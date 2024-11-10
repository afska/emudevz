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

class PPUCtrl extends InMemoryRegister.PPU {
	onLoad() {
		this.addField("nameTableId", 0, 2)
			.addField("vramAddressIncrement32", 2)
			.addField("sprite8x8PatternTableId", 3)
			.addField("backgroundPatternTableId", 4)
			.addField("spriteSize", 5)
			.addField("generateNMIOnVBlank", 7);
	}

	onWrite(value) {
		this.setValue(value);
	}
}

class PPUMask extends InMemoryRegister.PPU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}
}

class PPUStatus extends InMemoryRegister.PPU {
	onLoad() {
		this.addWritableField("spriteOverflow", 5)
			.addWritableField("sprite0Hit", 6)
			.addWritableField("isInVBlankInterval", 7);

		this.setValue(0b10000000);
	}

	onRead() {
		return value;
	}
}

class OAMAddr extends InMemoryRegister.PPU {
	onWrite(value) {
		this.setValue(value);
	}
}

class OAMData extends InMemoryRegister.PPU {
	onRead() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class PPUScroll extends InMemoryRegister.PPU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class PPUAddr extends InMemoryRegister.PPU {
	onLoad() {
		this.latch = false;
		this.address = 0;
	}

	onWrite(value) {
		if (!this.latch) {
			this.address = byte.buildU16(value, byte.lowByteOf(this.address));
		} else {
			this.address = byte.buildU16(byte.highByteOf(this.address), value);
		}

		this.latch = !this.latch;
	}
}

class PPUData extends InMemoryRegister.PPU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onRead() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		this.ppu.memory.write(this.ppu.registers.ppuAddr.address, value);
		this._incrementAddress();
	}

	_incrementAddress() {
		if (this.ppu.registers.ppuCtrl.vramAddressIncrement32) {
			this.ppu.registers.ppuAddr.address = byte.toU16(
				this.ppu.registers.ppuAddr.address + 32
			);
		} else {
			this.ppu.registers.ppuAddr.address = byte.toU16(
				this.ppu.registers.ppuAddr.address + 1
			);
		}
	}
}

class OAMDMA extends InMemoryRegister.PPU {
	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class VideoRegisters {
	constructor(ppu) {
		this.ppuCtrl = new PPUCtrl(ppu); //     $2000
		this.ppuMask = new PPUMask(ppu); //     $2001
		this.ppuStatus = new PPUStatus(ppu); // $2002
		this.oamAddr = new OAMAddr(ppu); //     $2003
		this.oamData = new OAMData(ppu); //     $2004
		this.ppuScroll = new PPUScroll(ppu); // $2005
		this.ppuAddr = new PPUAddr(ppu); //     $2006
		this.ppuData = new PPUData(ppu); //     $2007
		this.oamDma = new OAMDMA(ppu); //       $4014
	}

	read(address) {
		return this._getRegister(address)?.onRead();
	}

	write(address, value) {
		this._getRegister(address)?.onWrite(value);
	}

	_getRegister(address) {
		switch (address) {
			case 0x2000:
				return this.ppuCtrl;
			case 0x2001:
				return this.ppuMask;
			case 0x2002:
				return this.ppuStatus;
			case 0x2003:
				return this.oamAddr;
			case 0x2004:
				return this.oamData;
			case 0x2005:
				return this.ppuScroll;
			case 0x2006:
				return this.ppuAddr;
			case 0x2007:
				return this.ppuData;
			case 0x4014:
				return this.oamDma;
			default:
		}
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

		this.registers = new VideoRegisters(this);
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
				const testPalette = [0xffffffff, 0xff999999, 0xff424242, 0xff000000];
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
