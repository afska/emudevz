class PPUMemory {
	constructor() {
		/* TODO: IMPLEMENT */
	}

	onLoad(cartridge, mapper) {
		this.cartridge = cartridge;
		this.mapper = mapper;
	}

	read(address) {
		// 🕊️ Pattern tables 0 and 1 (mapper)
		if (address >= 0x0000 && address <= 0x1fff)
			return this.mapper.ppuRead(address);

		// 🏞️ Name tables 0 to 3 (VRAM + mirror)
		/* TODO: IMPLEMENT */

		// 🚽 Mirrors of $2000-$2EFF
		if (address >= 0x3000 && address <= 0xeff)
			return this.read(0x2000 + ((address - 0x3000) % 0x1000));

		// 🎨 Palette RAM
		/* TODO: IMPLEMENT */

		// 🚽 Mirrors of $3F00-$3F1F
		if (address >= 0x3f20 && address <= 0x3fff)
			return this.read(0x3f00 + ((address - 0x3f20) % 0x0020));

		return 0;
	}

	write(address, value) {
		// 🕊️ Pattern tables 0 and 1 (mapper)
		if (address >= 0x0000 && address <= 0x1fff)
			return this.mapper.ppuWrite(address, value);

		// 🏞️ Name tables 0 to 3 (VRAM + mirror)
		/* TODO: IMPLEMENT */

		// 🚽 Mirrors of $2000-$2EFF
		if (address >= 0x3000 && address <= 0xeff)
			return this.write(0x2000 + ((address - 0x3000) % 0x1000), value);

		// 🎨 Palette RAM
		/* TODO: IMPLEMENT */

		// 🚽 Mirrors of $3F00-$3F1F
		if (address >= 0x3f20 && address <= 0x3fff)
			return this.write(0x3f00 + ((address - 0x3f20) % 0x0020), value);
	}
}

const byte = {
	/** Returns the bit located at `position` in `number`. */
	getBit(number, position) {
		return (number >> position) & 1;
	},

	buildU2(highBit, lowBit) {
		return (highBit << 1) | lowBit;
	},
};

class Tile {
	constructor(ppu, patternTableId, tileId, y) {
		const tableAddress = patternTableId * 4096;
		const lowPlaneAddress = tableAddress + tileId * 16;
		const highPlaneAddress = lowPlaneAddress + 8;

		this._lowRow = ppu.memory.read(lowPlaneAddress + y);
		this._highRow = ppu.memory.read(highPlaneAddress + y);
	}

	getColorIndex(x) {
		const bitNumber = 7 - x;
		const lowBit = byte.getBit(this._lowRow, bitNumber);
		const highBit = byte.getBit(this._highRow, bitNumber);

		return byte.buildU2(highBit, lowBit);
	}
}

export default class PPU {
	constructor(cpu) {
		this.cpu = cpu;

		this.cycle = 0;
		this.scanline = -1;
		this.frame = 0;

		this.frameBuffer = new Uint32Array(256 * 240);
		this.memory = new PPUMemory();
	}

	plot(x, y, color) {
		this.frameBuffer[y * 256 + x] = color;
	}

	step(onFrame) {
		this.cycle++;
		if (this.cycle >= 341) {
			this.cycle = 0;
			this.scanline++;

			if (this.scanline >= 261) {
				this.scanline = -1;
				this.frame++;

				// <test>
				const testPalette = [0xff000000, 0xff555555, 0xffaaaaaa, 0xffffffff];
				const scale = 2;

				for (let tileId = 0; tileId < 240; tileId++) {
					const scaledSize = 8 * scale;
					const tilesPerRow = 256 / scaledSize;
					const startX = (tileId % tilesPerRow) * scaledSize;
					const startY = Math.floor(tileId / tilesPerRow) * scaledSize;

					for (let y = 0; y < 8; y++) {
						const tile = new Tile(this, 0, tileId, y);

						for (let x = 0; x < 8; x++) {
							const color = testPalette[tile.getColorIndex(x)];

							for (let scaledY = 0; scaledY < scale; scaledY++) {
								for (let scaledX = 0; scaledX < scale; scaledX++) {
									this.plot(
										startX + x * scale + scaledX,
										startY + y * scale + scaledY,
										color
									);
								}
							}
						}
					}
				}
				// </test>

				onFrame(this.frameBuffer);
			}
		}
	}
}
