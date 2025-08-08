import { byte } from "../../../utils";

const PATTERN_TABLE_SIZE = 0x1000;
const TILE_SIZE_PIXELS = 8;
const TILE_TOTAL_BYTES = 16;

class Tile {
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

const ImGui = window.ImGui;
const ImGui_Impl = window.ImGui_Impl;

// TODO: FIX TEXTURE when opening debugger while already open

export default class Debugger_PPU {
	init() {
		const gl = ImGui_Impl.gl;
		this._fbTex0 = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._fbTex0);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// RGBA buffer
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			256 * 2,
			240 * 2,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null
		);
	}

	draw() {
		ImGui.Text("hello PPU");

		const gl = ImGui_Impl.gl;
		const W = SCREEN_WIDTH * 2;
		const H = SCREEN_HEIGHT * 2;
		const pixels = new Uint32Array(W * H);

		const emulation = window.EmuDevz?.emulation;
		const neees = emulation?.neees;
		const ppu = neees?.ppu;

		if (ppu) {
			const drawNametable = (nameTableId, offsetX, offsetY) => {
				for (let y = 0; y < SCREEN_HEIGHT; y++) {
					const backgroundColor = ppu.getColor(0, 0);

					for (let x = 0; x < SCREEN_WIDTH; ) {
						const scrolledX = x;
						const scrolledY = y;

						const nameTableX = scrolledX % SCREEN_WIDTH;
						const nameTableY = scrolledY % SCREEN_HEIGHT;
						const tileX = Math.floor(nameTableX / TILE_SIZE_PIXELS);
						const tileY = Math.floor(nameTableY / TILE_SIZE_PIXELS);
						const tileIndex = tileY * TILES_PER_ROW + tileX;
						const tileId = ppu.memory.read(
							MEM_NAME_TABLES + nameTableId * NAME_TABLE_SIZE_BYTES + tileIndex
						);
						const paletteId = this._getBackgroundPaletteId(
							ppu,
							nameTableId,
							nameTableX,
							nameTableY
						);

						const paletteColors = ppu.getPaletteColors(paletteId);
						const patternTableId =
							ppu.registers.ppuCtrl.backgroundPatternTableId;
						const tileStartX = nameTableX % TILE_SIZE_PIXELS;
						const tileInsideY = nameTableY % TILE_SIZE_PIXELS;

						const tile = new Tile(ppu, patternTableId, tileId, tileInsideY);
						const tilePixels = Math.min(
							TILE_SIZE_PIXELS - tileStartX,
							SCREEN_WIDTH - nameTableX
						);

						for (let xx = 0; xx < tilePixels; xx++) {
							const colorIndex = tile.getColorIndex(tileStartX + xx);
							const color =
								colorIndex > 0 ? paletteColors[colorIndex] : backgroundColor;

							const a = (color >> 24) & 0xff;
							const b = (color >> 16) & 0xff;
							const g = (color >> 8) & 0xff;
							const r = color & 0xff;

							const px = offsetX + x + xx;
							const py = offsetY + y;
							if (px >= 0 && px < W && py >= 0 && py < H)
								pixels[py * W + px] = (a << 24) | (b << 16) | (g << 8) | r;
						}

						x += tilePixels;
					}
				}
			};

			drawNametable(0, 0, 0);
			drawNametable(1, 256, 0);
			drawNametable(2, 0, 240);
			drawNametable(3, 256, 240);
		}

		gl.bindTexture(gl.TEXTURE_2D, this._fbTex0);
		gl.texSubImage2D(
			gl.TEXTURE_2D,
			0,
			0,
			0,
			W,
			H,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array(pixels.buffer)
		);

		ImGui.Image(this._fbTex0, new ImGui.Vec2(W, H));
		ImGui.Text("bye PPU");
	}

	_getBackgroundPaletteId(ppu, nameTableId, x, y) {
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

		const block = ppu.memory.read(startAddress + blockIndex);

		return byte.getBits(
			block,
			regionIndex * ATTRIBUTE_TABLE_REGION_SIZE_BITS,
			ATTRIBUTE_TABLE_REGION_SIZE_BITS
		);
	}
}
