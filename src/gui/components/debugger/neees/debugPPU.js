import { byte } from "../../../../utils";

const PATTERN_TABLE_SIZE = 0x1000;
const TILE_SIZE_PIXELS = 8;
const TILE_TOTAL_BYTES = 16;
export const GRAYSCALE_PALETTE = [
	0xff000000,
	0xff555555,
	0xffaaaaaa,
	0xffffffff,
];

export class Tile {
	constructor(ppu, patternTableId, tileId, y) {
		const startAddress = patternTableId * PATTERN_TABLE_SIZE;
		const firstPlane = tileId * TILE_TOTAL_BYTES;
		const secondPlane = firstPlane + TILE_TOTAL_BYTES / 2;

		this._lowRow = ppu.memory?.read?.(startAddress + firstPlane + y) ?? 0;
		this._highRow = ppu.memory?.read?.(startAddress + secondPlane + y) ?? 0;
	}

	getColorIndex(x) {
		const bitNumber = TILE_SIZE_PIXELS - 1 - x;
		const lowBit = byte.getBit(this._lowRow, bitNumber);
		const highBit = byte.getBit(this._highRow, bitNumber);

		return byte.buildU2(highBit, lowBit);
	}
}

// ---

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const TILES_PER_ROW = SCREEN_WIDTH / TILE_SIZE_PIXELS;
const MEM_NAME_TABLES = 0x2000;
const NAME_TABLE_SIZE_BYTES = 1024;
const ATTRIBUTE_TABLE_SIZE_BYTES = 64;
const ATTRIBUTE_TABLE_BLOCK_SIZE = 32;
const ATTRIBUTE_TABLE_REGION_SIZE = 16;
const ATTRIBUTE_TABLE_TOTAL_BLOCKS_X =
	SCREEN_WIDTH / ATTRIBUTE_TABLE_BLOCK_SIZE;
const ATTRIBUTE_TABLE_TOTAL_REGIONS_X =
	ATTRIBUTE_TABLE_BLOCK_SIZE / ATTRIBUTE_TABLE_REGION_SIZE;
const ATTRIBUTE_TABLE_REGION_SIZE_BITS = 2;

export class NameTableRenderer {
	constructor(ppu, plot) {
		this.ppu = ppu;
		this.plot = plot;
	}

	render(nameTableId, offsetX, offsetY, plot) {
		for (let y = 0; y < SCREEN_HEIGHT; y++) {
			const backgroundColor = this.ppu.getColor?.(0, 0) ?? 0;

			for (let x = 0; x < SCREEN_WIDTH; ) {
				const scrolledX = x;
				const scrolledY = y;

				const nameTableX = scrolledX % SCREEN_WIDTH;
				const nameTableY = scrolledY % SCREEN_HEIGHT;
				const tileX = Math.floor(nameTableX / TILE_SIZE_PIXELS);
				const tileY = Math.floor(nameTableY / TILE_SIZE_PIXELS);
				const tileIndex = tileY * TILES_PER_ROW + tileX;
				const tileId = this.ppu.memory.read(
					MEM_NAME_TABLES + nameTableId * NAME_TABLE_SIZE_BYTES + tileIndex
				);
				const paletteId = this._getBackgroundPaletteId(
					nameTableId,
					nameTableX,
					nameTableY
				);

				const paletteColors =
					this.ppu.getPaletteColors?.(paletteId) ?? GRAYSCALE_PALETTE;
				const patternTableId =
					this.ppu.registers?.ppuCtrl?.backgroundPatternTableId ?? 0;
				const tileStartX = nameTableX % TILE_SIZE_PIXELS;
				const tileInsideY = nameTableY % TILE_SIZE_PIXELS;

				const tile = new Tile(this.ppu, patternTableId, tileId, tileInsideY);
				const tilePixels = Math.min(
					TILE_SIZE_PIXELS - tileStartX,
					SCREEN_WIDTH - nameTableX
				);

				for (let xx = 0; xx < tilePixels; xx++) {
					const colorIndex = tile.getColorIndex(tileStartX + xx);
					const color =
						colorIndex > 0 ? paletteColors[colorIndex] : backgroundColor;
					this.plot(offsetX + x + xx, offsetY + y, color);
				}

				x += tilePixels;
			}
		}
	}

	_getBackgroundPaletteId(nameTableId, x, y) {
		const startAddress =
			MEM_NAME_TABLES +
			(nameTableId + 1) * NAME_TABLE_SIZE_BYTES -
			ATTRIBUTE_TABLE_SIZE_BYTES;

		const blockX = Math.floor(x / ATTRIBUTE_TABLE_BLOCK_SIZE);
		const blockY = Math.floor(y / ATTRIBUTE_TABLE_BLOCK_SIZE);
		const blockIndex = blockY * ATTRIBUTE_TABLE_TOTAL_BLOCKS_X + blockX;

		const regionX = Math.floor(
			(x % ATTRIBUTE_TABLE_BLOCK_SIZE) / ATTRIBUTE_TABLE_REGION_SIZE
		);
		const regionY = Math.floor(
			(y % ATTRIBUTE_TABLE_BLOCK_SIZE) / ATTRIBUTE_TABLE_REGION_SIZE
		);
		const regionIndex = regionY * ATTRIBUTE_TABLE_TOTAL_REGIONS_X + regionX;

		const block = this.ppu.memory?.read?.(startAddress + blockIndex) ?? 0;

		return byte.getBits(
			block,
			regionIndex * ATTRIBUTE_TABLE_REGION_SIZE_BITS,
			ATTRIBUTE_TABLE_REGION_SIZE_BITS
		);
	}
}

// ---

const PALETTE_FOREGROUND_START = 4;
const SPRITE_ATTR_PALETTE_BITS_START = 0;
const SPRITE_ATTR_PALETTE_BITS_SIZE = 2;
const SPRITE_ATTR_PRIORITY_BIT = 5;
const SPRITE_ATTR_HORIZONTAL_FLIP_BIT = 6;
const SPRITE_ATTR_VERTICAL_FLIP_BIT = 7;

/**
 * A sprite containing an id, position, height, a tile id and some attributes.
 * Sprites are defined by (y, tileId, attributes, x).
 *                                     76543210
 *                                     |||   ++- foregroundPaletteId
 *                                     ||+------ priority (0: in front of background, 1: behind background)
 *                                     |+------- horizontalFlip
 *                                     +-------- verticalFlip
 */
export class Sprite {
	constructor(id, x, y, is8x16, patternTableId, topTileId, attributes) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.is8x16 = is8x16;
		this.patternTableId = patternTableId;
		this.tileId = topTileId;
		this.attributes = attributes;
	}

	/**
	 * Returns the tile id for an `insideY` position.
	 * The bottom part of a 8x16 sprite uses the next tile index.
	 */
	tileIdFor(insideY) {
		let index = +(insideY >= TILE_SIZE_PIXELS);
		if (this.is8x16 && this.flipY) index = +!index;

		return this.tileId + index;
	}

	/** Returns whether it should appear in a certain `scanline` or not. */
	shouldRenderInScanline(scanline) {
		const diffY = this.diffY(scanline);

		return diffY >= 0 && diffY < this.height;
	}

	/** Returns the difference between a `scanline` and sprite's Y coordinate. */
	diffY(scanline) {
		return scanline - this.y;
	}

	/** Returns the palette id of the sprite. */
	get paletteId() {
		return (
			PALETTE_FOREGROUND_START +
			byte.getBits(
				this.attributes,
				SPRITE_ATTR_PALETTE_BITS_START,
				SPRITE_ATTR_PALETTE_BITS_SIZE
			)
		);
	}

	/** Returns whether the sprite is in front of background or not. */
	get isInFrontOfBackground() {
		return !byte.getBit(this.attributes, SPRITE_ATTR_PRIORITY_BIT);
	}

	/** Returns whether the sprite is horizontally flipped or not. */
	get flipX() {
		return byte.getFlag(this.attributes, SPRITE_ATTR_HORIZONTAL_FLIP_BIT);
	}

	/** Returns whether the sprite is vertically flipped or not. */
	get flipY() {
		return byte.getFlag(this.attributes, SPRITE_ATTR_VERTICAL_FLIP_BIT);
	}

	/** Returns the sprite height. */
	get height() {
		return this.is8x16 ? 16 : 8;
	}
}
