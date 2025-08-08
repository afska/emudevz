import { byte } from "../../../../utils";

const PATTERN_TABLE_SIZE = 0x1000;
const TILE_SIZE_PIXELS = 8;
const TILE_TOTAL_BYTES = 16;

export class Tile {
	constructor(ppu, patternTableId, tileId, y) {
		const startAddress = patternTableId * PATTERN_TABLE_SIZE;
		const firstPlane = tileId * TILE_TOTAL_BYTES;
		const secondPlane = firstPlane + TILE_TOTAL_BYTES / 2;

		this._lowRow = ppu.memory.read(startAddress + firstPlane + y);
		this._highRow = ppu.memory.read(startAddress + secondPlane + y);
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
			const backgroundColor = this.ppu.getColor(0, 0);

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

				const paletteColors = this.ppu.getPaletteColors(paletteId);
				const patternTableId = this.ppu.registers.ppuCtrl
					.backgroundPatternTableId;
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

		const block = this.ppu.memory.read(startAddress + blockIndex);

		return byte.getBits(
			block,
			regionIndex * ATTRIBUTE_TABLE_REGION_SIZE_BITS,
			ATTRIBUTE_TABLE_REGION_SIZE_BITS
		);
	}
}
