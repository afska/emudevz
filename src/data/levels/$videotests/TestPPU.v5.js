const interrupts = {
	// Non-maskable interrupt (used to detect vertical blanking)
	NMI: {
		id: "NMI",
		vector: 0xfffa,
	},

	// Reset (called when the system is powered on)
	RESET: {
		id: "RESET",
		vector: 0xfffc,
	},

	// Interrupt request (runs a user interrupt handler)
	IRQ: {
		id: "IRQ",
		vector: 0xfffe,
	},
};

const byte = {
	/** Converts `s8` to an unsigned byte (-2 => 254). */
	/** It also forces `s8` to fit in 8 bits (257 => 1). */
	toU8(s8) {
		return s8 & 0xff;
	},

	/** Converts `u8` to a signed byte (254 => -2). */
	toS8(u8) {
		return (u8 << 24) >> 24;
	},

	/** Forces a `value` to fit in 16 bits (65537 => 1). */
	toU16(value) {
		return value & 0xffff;
	},

	/** Returns whether `u8` can be represented as a single byte or not. */
	overflows(u8) {
		return u8 >= 256;
	},

	/** Returns whether `s8` is positive or not. */
	isPositive(s8) {
		return !((s8 >> 7) & 1);
	},

	/** Returns whether `s8` is negative or not. */
	isNegative(s8) {
		return !!((s8 >> 7) & 1);
	},

	/** Returns the bit located at `position` in `number`, as a boolean. */
	getFlag(number, position) {
		return !!this.getBit(number, position);
	},

	/** Returns the bit located at `position` in `number`. */
	getBit(number, position) {
		return (number >> position) & 1;
	},

	/** Returns an updated `u8`, with a `bit` changed to `value` (0 or 1). */
	setBit(u8, bit, value) {
		const mask = 1 << bit;
		return (u8 & ~mask) | ((value & 0b1) << bit);
	},

	/** Returns a sub-number of `size` bits inside `u8`, starting at `startPosition`. */
	getBits(u8, startPosition, size) {
		return (u8 >> startPosition) & (0xff >> (8 - size));
	},

	/**
	 * Inserts a `value` of `size` bits inside `u8`, starting at `startPosition`.
	 * Returns the updated number.
	 */
	setBits(u8, startPosition, size, value) {
		const mask = ((1 << size) - 1) << startPosition;
		return (u8 & ~mask) | ((value << startPosition) & mask);
	},

	/** Returns the most significant byte of `u16`. */
	highByteOf(u16) {
		return u16 >> 8;
	},

	/** Returns the least significant byte of `u16`. */
	lowByteOf(u16) {
		return u16 & 0xff;
	},

	/** Returns a 16-bit number from `highByte` and `lowByte`. */
	buildU16(highByte, lowByte) {
		return ((highByte & 0xff) << 8) | (lowByte & 0xff);
	},

	/** Returns the upper nybble of `u8`. */
	highNybbleOf(u8) {
		return u8 >> 4;
	},

	/** Returns the lower nybble of `u8`. */
	lowNybbleOf(u8) {
		return u8 & 0b1111;
	},

	/** Returns an 8-bit number from `highNybble` and `lowNybble`. */
	buildU8(highNybble, lowNybble) {
		return ((highNybble & 0b1111) << 4) | (lowNybble & 0b1111);
	},

	/** Returns an 8-bit number from `bit0`, `bit1`, `bit2`, etc. */
	bitfield(bit0, bit1, bit2, bit3, bit4, bit5, bit6, bit7) {
		return (
			((bit0 & 1) << 0) |
			((bit1 & 1) << 1) |
			((bit2 & 1) << 2) |
			((bit3 & 1) << 3) |
			((bit4 & 1) << 4) |
			((bit5 & 1) << 5) |
			((bit6 & 1) << 6) |
			((bit7 & 1) << 7)
		);
	},

	/** Returns a 2-bit number from `highBit` and `lowBit`. */
	buildU2(highBit, lowBit) {
		return (highBit << 1) | lowBit;
	},

	/** Returns a random byte ([1, `max`]). */
	random(max = 254) {
		return 1 + Math.floor(Math.random() * max);
	},
};

const masterPalette = [
	/* 0x00 */ 0xff626262,
	/* 0x01 */ 0xff902001,
	/* 0x02 */ 0xffa00b24,
	/* 0x03 */ 0xff900047,
	/* 0x04 */ 0xff620060,
	/* 0x05 */ 0xff24006a,
	/* 0x06 */ 0xff001160,
	/* 0x07 */ 0xff002747,
	/* 0x08 */ 0xff003c24,
	/* 0x09 */ 0xff004a01,
	/* 0x0a */ 0xff004f00,
	/* 0x0b */ 0xff244700,
	/* 0x0c */ 0xff623600,
	/* 0x0d */ 0xff000000,
	/* 0x0e */ 0xff000000,
	/* 0x0f */ 0xff000000,
	/* 0x10 */ 0xffababab,
	/* 0x11 */ 0xffe1561f,
	/* 0x12 */ 0xffff394d,
	/* 0x13 */ 0xffef237e,
	/* 0x14 */ 0xffb71ba3,
	/* 0x15 */ 0xff6422b4,
	/* 0x16 */ 0xff0e37ac,
	/* 0x17 */ 0xff00558c,
	/* 0x18 */ 0xff00725e,
	/* 0x19 */ 0xff00882d,
	/* 0x1a */ 0xff009007,
	/* 0x1b */ 0xff478900,
	/* 0x1c */ 0xff9d7300,
	/* 0x1d */ 0xff000000,
	/* 0x1e */ 0xff000000,
	/* 0x1f */ 0xff000000,
	/* 0x20 */ 0xffffffff,
	/* 0x21 */ 0xffffac67,
	/* 0x22 */ 0xffff8d95,
	/* 0x23 */ 0xffff75c8,
	/* 0x24 */ 0xffff6af2,
	/* 0x25 */ 0xffc56fff,
	/* 0x26 */ 0xff6a83ff,
	/* 0x27 */ 0xff1fa0e6,
	/* 0x28 */ 0xff00bfb8,
	/* 0x29 */ 0xff01d885,
	/* 0x2a */ 0xff35e35b,
	/* 0x2b */ 0xff88de45,
	/* 0x2c */ 0xffe3ca49,
	/* 0x2d */ 0xffe4e404e,
	/* 0x2e */ 0xff000000,
	/* 0x2f */ 0xff000000,
	/* 0x30 */ 0xffffffff,
	/* 0x31 */ 0xffffe0bf,
	/* 0x32 */ 0xffffd3d1,
	/* 0x33 */ 0xffffc9e6,
	/* 0x34 */ 0xffffc3f7,
	/* 0x35 */ 0xffeec4ff,
	/* 0x36 */ 0xffc9cbff,
	/* 0x37 */ 0xffa9d7f7,
	/* 0x38 */ 0xff97e3e6,
	/* 0x39 */ 0xff97eed1,
	/* 0x3a */ 0xffa9f3bf,
	/* 0x3b */ 0xffc9f2b5,
	/* 0x3c */ 0xffeeebb5,
	/* 0x3d */ 0xffb8b8b8,
	/* 0x3e */ 0xff000000,
	/* 0x3f */ 0xff000000,
];

class InMemoryRegister {
	constructor() {
		this.value = 0;
		this._readOnlyFields = [];

		this.onLoad();
	}

	/** Called when instantiating the register. */
	onLoad() {}

	/** Called when the CPU reads the memory address. */
	onRead() {
		return 0;
	}

	/** Called when the CPU writes the memory address. */
	onWrite(value) {}

	/** Sets the value manually (updating internal accessors). */
	setValue(value) {
		this.value = byte.toU8(value);
		this._writeReadOnlyFields();
	}

	/** Adds a read-only field of `size` bits named `name`, starting at `startPosition`. */
	addField(name, startPosition, size = 1) {
		this._readOnlyFields.push({ name, startPosition, size });
		this[name] = 0;

		return this;
	}

	/** Adds a writable field of `size` bits named `name`, starting at `startPosition`. */
	addWritableField(name, startPosition, size = 1) {
		Object.defineProperty(this, name, {
			get() {
				return byte.getBits(this.value, startPosition, size);
			},
			set(value) {
				this.value = byte.toU8(
					byte.setBits(this.value, startPosition, size, value)
				);
			},
		});

		return this;
	}

	_writeReadOnlyFields() {
		for (let { name, startPosition, size } of this._readOnlyFields)
			this[name] = byte.getBits(this.value, startPosition, size);
	}

	static get PPU() {
		return class PPUInMemoryRegister extends InMemoryRegister {
			constructor(ppu) {
				super();

				this.ppu = ppu;
			}
		};
	}

	static get APU() {
		return class APUInMemoryRegister extends InMemoryRegister {
			constructor(apu, id) {
				super();

				this.apu = apu;
				this.id = id;
			}
		};
	}

	static get Controller() {
		return class ControllerInMemoryRegister extends InMemoryRegister {
			constructor(controller) {
				super();

				this.controller = controller;
			}
		};
	}
}

class PPUMemory {
	constructor() {
		this.vram = new Uint8Array(4096);
		this.paletteRam = new Uint8Array(32);
		this.oamRam = new Uint8Array(256);
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
		if (address >= 0x2000 && address <= 0x2fff)
			return this.vram[address - 0x2000];

		// 🚽 Mirrors of $2000-$2EFF
		if (address >= 0x3000 && address <= 0xeff)
			return this.read(0x2000 + ((address - 0x3000) % 0x1000));

		// 🎨 Palette RAM
		if (address >= 0x3f00 && address <= 0x3f1f)
			return this.paletteRam[address - 0x3f00];

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
		if (address >= 0x2000 && address <= 0x2fff) {
			this.vram[address - 0x2000] = value;
			return;
		}

		// 🚽 Mirrors of $2000-$2EFF
		if (address >= 0x3000 && address <= 0xeff)
			return this.write(0x2000 + ((address - 0x3000) % 0x1000), value);

		// 🎨 Palette RAM
		if (address >= 0x3f00 && address <= 0x3f1f) {
			this.paletteRam[address - 0x3f00] = value;
			return;
		}

		// 🚽 Mirrors of $3F00-$3F1F
		if (address >= 0x3f20 && address <= 0x3fff)
			return this.write(0x3f00 + ((address - 0x3f20) % 0x0020), value);
	}
}

const TILE_SIZE_PIXELS = 8;
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
class Sprite {
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

class BackgroundRenderer {
	constructor(ppu) {
		this.ppu = ppu;
	}

	renderScanline() {
		const { scanline: y, registers, memory } = this.ppu;

		const nameTableId = registers.ppuCtrl.nameTableId;
		const patternTableId = registers.ppuCtrl.backgroundPatternTableId;
		const nameTableAddress = 0x2000 + nameTableId * 1024;

		for (let x = 0; x < 256; x += 8) {
			const tileX = Math.floor(x / 8);
			const tileY = Math.floor(y / 8);
			const tileIndex = tileY * 32 + tileX;
			const tileId = memory.read(nameTableAddress + tileIndex);
			const paletteId = this._getBackgroundPaletteId(nameTableId, x, y);

			const tileInsideY = y % 8;

			const tile = new Tile(this.ppu, patternTableId, tileId, tileInsideY);
			for (let xx = 0; xx < 8; xx++) {
				const colorIndex = tile.getColorIndex(xx);
				const color =
					colorIndex > 0
						? this.ppu.getColor(paletteId, colorIndex)
						: this.ppu.getColor(0, 0);
				this.ppu.plot(x + xx, y, color);
			}
		}
	}

	_getBackgroundPaletteId(nameTableId, x, y) {
		const SCREEN_WIDTH = 256;
		const MEM_NAMETABLES = 0x2000;
		const NAME_TABLE_SIZE_BYTES = 1024;
		const ATTRIBUTE_TABLE_SIZE_BYTES = 64;
		const ATTRIBUTE_TABLE_METABLOCK_SIZE = 32;
		const ATTRIBUTE_TABLE_BLOCK_SIZE = 16;
		const ATTRIBUTE_TABLE_TOTAL_METABLOCKS_X =
			SCREEN_WIDTH / ATTRIBUTE_TABLE_METABLOCK_SIZE;
		const ATTRIBUTE_TABLE_TOTAL_BLOCKS_X =
			ATTRIBUTE_TABLE_METABLOCK_SIZE / ATTRIBUTE_TABLE_BLOCK_SIZE;
		const ATTRIBUTE_TABLE_BLOCK_SIZE_BITS = 2;

		const startAddress =
			MEM_NAMETABLES +
			(nameTableId + 1) * NAME_TABLE_SIZE_BYTES -
			ATTRIBUTE_TABLE_SIZE_BYTES;

		const metablockX = Math.floor(x / ATTRIBUTE_TABLE_METABLOCK_SIZE);
		const metablockY = Math.floor(y / ATTRIBUTE_TABLE_METABLOCK_SIZE);
		const metablockIndex =
			metablockY * ATTRIBUTE_TABLE_TOTAL_METABLOCKS_X + metablockX;

		const blockX = Math.floor(
			(x % ATTRIBUTE_TABLE_METABLOCK_SIZE) / ATTRIBUTE_TABLE_BLOCK_SIZE
		);
		const blockY = Math.floor(
			(y % ATTRIBUTE_TABLE_METABLOCK_SIZE) / ATTRIBUTE_TABLE_BLOCK_SIZE
		);
		const blockIndex = blockY * ATTRIBUTE_TABLE_TOTAL_BLOCKS_X + blockX;

		const block = this.ppu.memory.read(startAddress + metablockIndex);

		return byte.getBits(
			block,
			blockIndex * ATTRIBUTE_TABLE_BLOCK_SIZE_BITS,
			ATTRIBUTE_TABLE_BLOCK_SIZE_BITS
		);
	}
}

class SpriteRenderer {
	constructor(ppu) {
		this.ppu = ppu;
	}

	renderScanline() {
		const sprites = this._evaluate();
		this._render(sprites);
	}

	_evaluate() {
		const MAX_SPRITES = 64;
		const MAX_SPRITES_PER_SCANLINE = 8;

		const sprites = [];

		for (let spriteId = 0; spriteId < MAX_SPRITES; spriteId++) {
			const sprite = this._createSprite(spriteId);

			if (
				sprite.shouldRenderInScanline(this.ppu.scanline) &&
				sprites.length < MAX_SPRITES_PER_SCANLINE + 1
			) {
				if (sprites.length < MAX_SPRITES_PER_SCANLINE) {
					sprites.push(sprite);
				} else {
					this.ppu.registers.ppuStatus.spriteOverflow = 1;
					break;
				}
			}
		}

		return sprites.reverse();
	}

	_render(sprites) {
		const y = this.ppu.scanline;

		for (let sprite of sprites) {
			const insideY = sprite.diffY(y);
			const tile = new Tile(
				this.ppu,
				sprite.patternTableId,
				sprite.tileIdFor(insideY),
				insideY
			);
			const paletteColors = [
				this.ppu.getColor(sprite.paletteId, 0),
				this.ppu.getColor(sprite.paletteId, 1),
				this.ppu.getColor(sprite.paletteId, 2),
				this.ppu.getColor(sprite.paletteId, 3),
			];

			for (let insideX = 0; insideX < 8; insideX++) {
				const colorIndex = tile.getColorIndex(insideX);
				if (colorIndex > 0)
					this.ppu.plot(
						sprite.x + insideX,
						this.ppu.scanline,
						paletteColors[colorIndex]
					);
			}
		}
	}

	_createSprite(id) {
		const SPRITE_SIZE_BYTES = 4;
		const SPRITE_BYTE_Y = 0;
		const SPRITE_BYTE_TILE_ID = 1;
		const SPRITE_BYTE_ATTRIBUTES = 2;
		const SPRITE_BYTE_X = 3;
		const SPRITE_8x16_PATTERN_TABLE_MASK = 0b1;
		const SPRITE_8x16_TILE_ID_MASK = 0xfe;

		const oamRam = this.ppu.memory.oamRam;
		const ppuCtrl = this.ppu.registers.ppuCtrl;

		const is8x16 = ppuCtrl.spriteSize === 1;

		const address = id * SPRITE_SIZE_BYTES;
		const yByte = oamRam[address + SPRITE_BYTE_Y];
		const tileIdByte = oamRam[address + SPRITE_BYTE_TILE_ID];
		const attributes = oamRam[address + SPRITE_BYTE_ATTRIBUTES];
		const x = oamRam[address + SPRITE_BYTE_X];

		const y = yByte + 1;
		const patternTableId = is8x16
			? tileIdByte & SPRITE_8x16_PATTERN_TABLE_MASK
			: ppuCtrl.sprite8x8PatternTableId;
		const tileId = is8x16 ? tileIdByte & SPRITE_8x16_TILE_ID_MASK : tileIdByte;

		return new Sprite(id, x, y, is8x16, patternTableId, tileId, attributes);
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
		const value = this.value;

		this.isInVBlankInterval = 0;
		this.ppu.registers.ppuAddr.latch = false;

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
		const oamAddress = this.ppu.registers.oamAddr.value;
		return this.ppu.memory.oamRam[oamAddress];
	}

	onWrite(value) {
		const oamAddress = this.ppu.registers.oamAddr.value;
		this.ppu.memory.oamRam[oamAddress] = value;
		this.ppu.registers.oamAddr.setValue(oamAddress + 1);
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
		this.buffer = 0;
	}

	onRead() {
		let data = this.buffer;
		const address = this.ppu.registers.ppuAddr.address;
		this.buffer = this.ppu.memory.read(address);
		if (address >= 0x3f00 && address <= 0x3fff) data = this.buffer;
		this._incrementAddress();
		return data;
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
		for (let i = 0; i < 256; i++) {
			const address = byte.buildU16(value, i);
			const data = this.ppu.cpu.memory.read(address);
			this.ppu.memory.oamRam[i] = data;
		}
		this.ppu.cpu.extraCycles += 531;
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

		this.backgroundRenderer = new BackgroundRenderer(this);
		this.spriteRenderer = new SpriteRenderer(this);
	}

	plot(x, y, color) {
		this.frameBuffer[y * 256 + x] = color;
	}

	getColor(paletteId, colorIndex) {
		const startAddress = 0x3f00 + paletteId * 4;
		const masterColorIndex = this.memory.read(startAddress + colorIndex);

		return masterPalette[masterColorIndex];
	}

	step(onFrame, onInterrupt) {
		if (this.scanline === -1) this._onPreLine();
		else if (this.scanline < 240) this._onVisibleLine();
		else if (this.scanline === 241) this._onVBlankLine(onInterrupt);

		this.cycle++;
		if (this.cycle >= 341) {
			this.cycle = 0;
			this.scanline++;

			if (this.scanline >= 261) {
				this.scanline = -1;
				this.frame++;

				onFrame(this.frameBuffer);
			}
		}
	}

	_onPreLine() {
		if (this.cycle === 1) {
			this.registers.ppuStatus.isInVBlankInterval = 0;
			this.registers.ppuStatus.spriteOverflow = 0;
		}
	}

	_onVisibleLine() {
		if (this.cycle === 0) {
			this.backgroundRenderer.renderScanline();
			this.spriteRenderer.renderScanline();
		}
	}

	_onVBlankLine(onInterrupt) {
		if (this.cycle === 1) {
			this.registers.ppuStatus.isInVBlankInterval = 1;
			if (this.registers.ppuCtrl.generateNMIOnVBlank)
				onInterrupt(interrupts.NMI);
		}
	}
}
