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
	/* 0x00 */ 0xff757575,
	/* 0x01 */ 0xff8f1b27,
	/* 0x02 */ 0xffab0000,
	/* 0x03 */ 0xff9f0047,
	/* 0x04 */ 0xff77008f,
	/* 0x05 */ 0xff1300ab,
	/* 0x06 */ 0xff0000a7,
	/* 0x07 */ 0xff000b7f,
	/* 0x08 */ 0xff002f43,
	/* 0x09 */ 0xff004700,
	/* 0x0a */ 0xff005100,
	/* 0x0b */ 0xff173f00,
	/* 0x0c */ 0xff5f3f1b,
	/* 0x0d */ 0xff000000,
	/* 0x0e */ 0xff000000,
	/* 0x0f */ 0xff000000,
	/* 0x10 */ 0xffbcbcbc,
	/* 0x11 */ 0xffef7300,
	/* 0x12 */ 0xffef3b23,
	/* 0x13 */ 0xfff30083,
	/* 0x14 */ 0xffbf00bf,
	/* 0x15 */ 0xff5b00e7,
	/* 0x16 */ 0xff002bdb,
	/* 0x17 */ 0xff0f4fcb,
	/* 0x18 */ 0xff00738b,
	/* 0x19 */ 0xff009700,
	/* 0x1a */ 0xff00ab00,
	/* 0x1b */ 0xff3b9300,
	/* 0x1c */ 0xff8b8300,
	/* 0x1d */ 0xff000000,
	/* 0x1e */ 0xff000000,
	/* 0x1f */ 0xff000000,
	/* 0x20 */ 0xffffffff,
	/* 0x21 */ 0xffffbf3f,
	/* 0x22 */ 0xffff975f,
	/* 0x23 */ 0xfffd8ba7,
	/* 0x24 */ 0xffff7bf7,
	/* 0x25 */ 0xffb777ff,
	/* 0x26 */ 0xff6377ff,
	/* 0x27 */ 0xff3b9bff,
	/* 0x28 */ 0xff3fbff3,
	/* 0x29 */ 0xff13d383,
	/* 0x2a */ 0xff4bdf4f,
	/* 0x2b */ 0xff98f858,
	/* 0x2c */ 0xffdbeb00,
	/* 0x2d */ 0xff000000,
	/* 0x2e */ 0xff000000,
	/* 0x2f */ 0xff000000,
	/* 0x30 */ 0xffffffff,
	/* 0x31 */ 0xffffe7ab,
	/* 0x32 */ 0xffffd7c7,
	/* 0x33 */ 0xffffcbd7,
	/* 0x34 */ 0xffffc7ff,
	/* 0x35 */ 0xffdbc7ff,
	/* 0x36 */ 0xffb3bfff,
	/* 0x37 */ 0xffabdbff,
	/* 0x38 */ 0xffa3e7ff,
	/* 0x39 */ 0xffa3ffe3,
	/* 0x3a */ 0xffbff3ab,
	/* 0x3b */ 0xffcfffb3,
	/* 0x3c */ 0xfff3ff9f,
	/* 0x3d */ 0xff000000,
	/* 0x3e */ 0xff000000,
	/* 0x3f */ 0xff000000,
];

const mirroringTypes = {
	HORIZONTAL: {
		$2000: 0x000,
		$2400: 0x000,
		$2800: 0x400,
		$2C00: 0x400,
	},
	VERTICAL: {
		$2000: 0x000,
		$2400: 0x400,
		$2800: 0x000,
		$2C00: 0x400,
	},
	ONE_SCREEN_LOWER_BANK: {
		$2000: 0x000,
		$2400: 0x000,
		$2800: 0x000,
		$2C00: 0x000,
	},
	ONE_SCREEN_UPPER_BANK: {
		$2000: 0x400,
		$2400: 0x400,
		$2800: 0x400,
		$2C00: 0x400,
	},
	FOUR_SCREEN: {
		$2000: 0x000,
		$2400: 0x400,
		$2800: 0x800,
		$2C00: 0xc00,
	},
};

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

	/** Adds a read-only field of `size` bits named `named`, starting at `startPosition`. */
	addField(name, startPosition, size = 1) {
		this._readOnlyFields.push({ name, startPosition, size });
		this[name] = 0;

		return this;
	}

	/** Adds a writable field of `size` bits named `named`, starting at `startPosition`. */
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
			constructor(apu) {
				super();

				this.apu = apu;
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
		this.changeNameTableMirroringTo(cartridge.header.mirroringId);
	}

	read(address) {
		// 🕊️ Pattern tables 0 and 1 (mapper)
		if (address >= 0x0000 && address <= 0x1fff)
			return this.mapper.ppuRead(address);

		// 🏞️ Name tables 0 to 3 (VRAM + mirror)
		if (address >= 0x2000 && address <= 0x2fff) {
			if (address >= 0x2000 && address < 0x2400)
				return this.vram[this._mirroring.$2000 + address - 0x2000];
			if (address >= 0x2400 && address < 0x2800)
				return this.vram[this._mirroring.$2400 + address - 0x2400];
			if (address >= 0x2800 && address < 0x2c00)
				return this.vram[this._mirroring.$2800 + address - 0x2800];
			if (address >= 0x2c00 && address < 0x3000)
				return this.vram[this._mirroring.$2C00 + address - 0x2c00];
		}

		// 🚽 Mirrors of $2000-$2EFF
		if (address >= 0x3000 && address <= 0xeff)
			return this.read(0x2000 + ((address - 0x3000) % 0x1000));

		// 🎨 Palette RAM
		if (address >= 0x3f00 && address <= 0x3f1f) {
			if (address === 0x3f10) return this.read(0x3f00);
			if (address === 0x3f14) return this.read(0x3f04);
			if (address === 0x3f18) return this.read(0x3f08);
			if (address === 0x3f1c) return this.read(0x3f0c);
			return this.paletteRam[address - 0x3f00];
		}

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
			if (address >= 0x2000 && address < 0x2400)
				return (this.vram[this._mirroring.$2000 + address - 0x2000] = value);
			if (address >= 0x2400 && address < 0x2800)
				return (this.vram[this._mirroring.$2400 + address - 0x2400] = value);
			if (address >= 0x2800 && address < 0x2c00)
				return (this.vram[this._mirroring.$2800 + address - 0x2800] = value);
			if (address >= 0x2c00 && address < 0x3000)
				return (this.vram[this._mirroring.$2C00 + address - 0x2c00] = value);
		}

		// 🚽 Mirrors of $2000-$2EFF
		if (address >= 0x3000 && address <= 0xeff)
			return this.write(0x2000 + ((address - 0x3000) % 0x1000), value);

		// 🎨 Palette RAM
		if (address >= 0x3f00 && address <= 0x3f1f) {
			if (address === 0x3f10) return this.write(0x3f00, value);
			if (address === 0x3f14) return this.write(0x3f04, value);
			if (address === 0x3f18) return this.write(0x3f08, value);
			if (address === 0x3f1c) return this.write(0x3f0c, value);
			this.paletteRam[address - 0x3f00] = value;
			return;
		}

		// 🚽 Mirrors of $3F00-$3F1F
		if (address >= 0x3f20 && address <= 0x3fff)
			return this.write(0x3f00 + ((address - 0x3f20) % 0x0020), value);
	}

	changeNameTableMirroringTo(mirroringId) {
		if (this.cartridge.header.mirroringId === "FOUR_SCREEN")
			mirroringId = "FOUR_SCREEN";

		this.mirroringId = mirroringId;
		this._mirroring = mirroringTypes[mirroringId];
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

		const patternTableId = registers.ppuCtrl.backgroundPatternTableId;

		for (let x = 0; x < 256; ) {
			if (!this.ppu.registers.ppuMask.showBackgroundInFirst8Pixels && x < 8) {
				this.ppu.plotBG(x, y, this.ppu.getColor(0, 0), 0);
				x++;
				continue;
			}

			const scrolledX = this.ppu.loopy.scrolledX(x);
			const scrolledY = this.ppu.loopy.scrolledY(y);
			const nameTableId = this.ppu.loopy.nameTableId(scrolledX);
			const nameTableX = scrolledX % 256;
			const nameTableY = scrolledY % 240;
			const nameTableAddress = 0x2000 + nameTableId * 1024;

			const tileX = Math.floor(nameTableX / 8);
			const tileY = Math.floor(nameTableY / 8);
			const tileIndex = tileY * 32 + tileX;
			const tileId = memory.read(nameTableAddress + tileIndex);
			const paletteId = this._getBackgroundPaletteId(
				nameTableId,
				nameTableX,
				nameTableY
			);

			const tileStartX = nameTableX % 8;
			const tileInsideY = nameTableY % 8;
			const tilePixels = Math.min(8 - tileStartX, 256 - nameTableX);

			const tile = new Tile(this.ppu, patternTableId, tileId, tileInsideY);
			for (let xx = 0; xx < tilePixels; xx++) {
				const colorIndex = tile.getColorIndex(tileStartX + xx);
				const color =
					colorIndex > 0
						? this.ppu.getColor(paletteId, colorIndex)
						: this.ppu.getColor(0, 0);
				this.ppu.plotBG(x + xx, y, color, colorIndex);
			}

			x += tilePixels;
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
		const buffer = this._render(sprites);
		this._draw(buffer);
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
		const buffer = [];

		for (let sprite of sprites) {
			const insideY = sprite.diffY(y);
			const tileInsideY = insideY % 8;
			const tile = new Tile(
				this.ppu,
				sprite.patternTableId,
				sprite.tileIdFor(insideY),
				sprite.flipY ? 7 - tileInsideY : tileInsideY
			);
			const paletteColors = [
				this.ppu.getColor(sprite.paletteId, 0),
				this.ppu.getColor(sprite.paletteId, 1),
				this.ppu.getColor(sprite.paletteId, 2),
				this.ppu.getColor(sprite.paletteId, 3),
			];

			for (let insideX = 0; insideX < 8; insideX++) {
				const colorIndex = tile.getColorIndex(
					sprite.flipX ? 7 - insideX : insideX
				);
				if (colorIndex > 0) {
					const x = sprite.x + insideX;
					if (!this.ppu.registers.ppuMask.showSpritesInFirst8Pixels && x < 8)
						continue;

					const color = paletteColors[colorIndex];
					buffer[x] = { x, sprite, color };

					if (
						sprite.id === 0 &&
						this.ppu.isBackgroundPixelOpaque(x, y) &&
						this.ppu.registers.ppuMask.showBackground &&
						this.ppu.registers.ppuMask.showSprites
					)
						this.ppu.registers.ppuStatus.sprite0Hit = 1;
				}
			}
		}

		return buffer;
	}

	_draw(buffer) {
		const y = this.ppu.scanline;

		for (let element of buffer) {
			if (element !== undefined) {
				const isInFront = element.sprite.isInFrontOfBackground;
				const isBGOpaque = this.ppu.isBackgroundPixelOpaque(element.x, y);

				if (isInFront || !isBGOpaque)
					this.ppu.plot(element.x, y, element.color);
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
		this.addField("vramAddressIncrement32", 2)
			.addField("sprite8x8PatternTableId", 3)
			.addField("backgroundPatternTableId", 4)
			.addField("spriteSize", 5)
			.addField("generateNMIOnVBlank", 7);
	}

	onWrite(value) {
		this.setValue(value);
		this.ppu.loopy.onPPUCtrlWrite(value);
	}
}

class PPUMask extends InMemoryRegister.PPU {
	onLoad() {
		this.addField("showBackgroundInFirst8Pixels", 1)
			.addField("showSpritesInFirst8Pixels", 2)
			.addField("showBackground", 3)
			.addField("showSprites", 4);
	}

	onWrite(value) {
		this.setValue(value);
	}

	isRenderingEnabled() {
		return this.showBackground || this.showSprites;
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
		this.ppu.loopy.onPPUStatusRead();

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
	onWrite(value) {
		this.ppu.loopy.onPPUScrollWrite(value);
	}
}

class PPUAddr extends InMemoryRegister.PPU {
	onWrite(value) {
		this.ppu.loopy.onPPUAddrWrite(value);
	}

	get address() {
		return this.ppu.loopy.vAddress.getValue();
	}

	set address(value) {
		this.ppu.loopy.vAddress.setValue(value);
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

const LOOPY_ADDR_COARSE_X_OFFSET = 0;
const LOOPY_ADDR_COARSE_X_MASK = 0b11111;
const LOOPY_ADDR_COARSE_Y_OFFSET = 5;
const LOOPY_ADDR_COARSE_Y_MASK = 0b11111;
const LOOPY_ADDR_BASE_NAME_TABLE_ID_OFFSET = 10;
const LOOPY_ADDR_BASE_NAME_TABLE_ID_MASK = 0b11;
const LOOPY_ADDR_FINE_Y_OFFSET = 12;
const LOOPY_ADDR_FINE_Y_MASK = 0b111;
const NAME_TABLE_OFFSETS = [1, -1, 1, -1];
const SCREEN_WIDTH = 256;

/**
 * PPU's internal register (discovered by a user called `loopy` on nesdev).
 * It contains important data related to Name table scrolling.
 * Every write to `PPUAddr`, `PPUScroll`, and `PPUCtrl` changes its state.
 * It's also changed multiple times by the PPU during render.
 */
class LoopyRegister {
	constructor() {
		this.vAddress = new LoopyAddress(); // v (current VRAM address)
		this.tAddress = new LoopyAddress(); // t (temporary VRAM address)
		this.fineX = 0; //                     x (fine X scroll)
		this.latch = false; //                 w (first or second write toggle)
	}

	/**
	 * Returns the scrolled X in Name table coordinates ([0..262]).
	 * If this value overflows (> 255), switch the horizontal Name table.
	 */
	scrolledX(x) {
		const { vAddress, fineX } = this;
		return vAddress.coarseX * TILE_SIZE_PIXELS + fineX + (x % TILE_SIZE_PIXELS);
	}

	/** Returns the scrolled X in Name table coordinates ([0..255]). */
	scrolledY() {
		const { vAddress } = this;
		return vAddress.coarseY * TILE_SIZE_PIXELS + vAddress.fineY;
	}

	/**
	 * Returns the appropriate Name table id for a `scrolledX`.
	 * It switches the horizontal Name table if scrolledX has overflowed.
	 */
	nameTableId(scrolledX) {
		const baseNameTableId = this.vAddress.nameTableId;
		const offset =
			scrolledX >= SCREEN_WIDTH ? NAME_TABLE_OFFSETS[baseNameTableId] : 0;
		return baseNameTableId + offset;
	}

	/** Executed on `PPUCtrl` writes (updates `nameTableId` of `t`). */
	onPPUCtrlWrite(value) {
		// $2000 write
		// t: ...GH.. ........ <- d: ......GH
		//    <used elsewhere> <- d: ABCDEF..
		this.tAddress.nameTableId = byte.getBits(value, 0, 2);
	}

	/** Executed on `PPUStatus` reads (resets `latch`). */
	onPPUStatusRead() {
		// $2002 read
		// w:                  <- 0
		this.latch = false;
	}

	/** Executed on `PPUScroll` writes (updates X and Y scrolling on `t`). */
	onPPUScrollWrite(value) {
		if (!this.latch) {
			// $2005 first write (w is 0)
			// t: ....... ...ABCDE <- d: ABCDE...
			// x:              FGH <- d: .....FGH
			// w:                  <- 1

			this.tAddress.coarseX = byte.getBits(value, 3, 5);
			this.fineX = byte.getBits(value, 0, 3);
		} else {
			// $2005 second write (w is 1)
			// t: FGH..AB CDE..... <- d: ABCDEFGH
			// w:                  <- 0

			this.tAddress.coarseY = byte.getBits(value, 3, 5);
			this.tAddress.fineY = byte.getBits(value, 0, 3);
		}

		this.latch = !this.latch;
	}

	/** Executed on `PPUAddr` writes (updates everything in a weird way, copying `t` to `v`). */
	onPPUAddrWrite(value) {
		if (!this.latch) {
			// $2006 first write (w is 0)
			// t: .CDEFGH ........ <- d: ..CDEFGH
			//        <unused>     <- d: AB......
			// t: Z...... ........ <- 0 (bit Z is cleared)
			// w:                  <- 1

			let number = this.tAddress.toNumber();
			let high = byte.highByteOf(number);
			high = byte.setBits(high, 0, 6, byte.getBits(value, 0, 6));
			high = byte.setBits(high, 6, 1, 0);
			number = byte.buildU16(high, byte.lowByteOf(number));
			this.tAddress.setValue(number);
		} else {
			// $2006 second write (w is 1)
			// t: ....... ABCDEFGH <- d: ABCDEFGH
			// v: <...all bits...> <- t: <...all bits...>
			// w:                  <- 0

			let number = this.tAddress.toNumber();
			number = byte.buildU16(byte.highByteOf(number), value);
			this.tAddress.setValue(number);
			this.vAddress.setValue(number);
		}

		this.latch = !this.latch;
	}

	/** Executed multiple times for each pre line. */
	onPreLine(cycle) {
		/**
		 * During dots 280 to 304 of the pre-render scanline (end of vblank)
		 * If rendering is enabled, at the end of vblank, shortly after the horizontal bits are copied
		 * from t to v at dot 257, the PPU will repeatedly copy the vertical bits from t to v from
		 * dots 280 to 304, completing the full initialization of v from t.
		 */
		if (cycle >= 280 && cycle <= 304) this._copyY();

		this._onLine(cycle);
	}

	/** Executed multiple times for each visible line. */
	onVisibleLine(cycle) {
		this._onLine(cycle);
	}

	/** Executed multiple times for each visible line (prefetch dots were ignored). */
	onPlot(x) {
		const cycle = x + 1;
		/**
		 * Between dot 328 of a scanline, and 256 of the next scanline
		 * If rendering is enabled, the PPU increments the horizontal position in v many times
		 * across the scanline, it begins at dots 328 and 336, and will continue through the next
		 * scanline at 8, 16, 24... 240, 248, 256 (every 8 dots across the scanline until 256).
		 * Across the scanline the effective coarse X scroll coordinate is incremented repeatedly,
		 * which will also wrap to the next nametable appropriately.
		 */
		if (cycle >= 8 && cycle <= 256 && cycle % 8 === 0)
			this.vAddress.incrementX();
	}

	/** Returns a snapshot of the current state. */
	getSaveState() {
		return {
			v: this.vAddress.toNumber(),
			t: this.tAddress.toNumber(),
			x: this.fineX,
			w: this.latch,
		};
	}

	/** Restores state from a snapshot. */
	setSaveState(saveState) {
		this.vAddress.setValue(saveState.v);
		this.tAddress.setValue(saveState.t);
		this.fineX = saveState.x;
		this.latch = saveState.w;
	}

	/** Executed multiple times for each line. */
	_onLine(cycle) {
		/**
		 * At dot 256 of each scanline
		 * If rendering is enabled, the PPU increments the vertical position in v. The effective Y
		 * scroll coordinate is incremented, which is a complex operation that will correctly skip
		 * the attribute table memory regions, and wrap to the next nametable appropriately.
		 */
		if (cycle === 256) this.vAddress.incrementY();

		/**
		 * At dot 257 of each scanline
		 * If rendering is enabled, the PPU copies all bits related to horizontal position from t to v.
		 */
		if (cycle === 257) this._copyX();
	}

	_copyX() {
		// (copies all bits related to horizontal position from `t` to `v`)
		const v = this.vAddress.toNumber();
		const t = this.tAddress.toNumber();

		// v: ....A.. ...BCDEF <- t: ....A.. ...BCDEF
		this.vAddress.setValue((v & 0b111101111100000) | (t & 0b000010000011111));
	}

	_copyY() {
		// (copies all bits related to vertical position from `t` to `v`)
		const v = this.vAddress.toNumber();
		const t = this.tAddress.toNumber();

		// v: GHIA.BC DEF..... <- t: GHIA.BC DEF.....
		this.vAddress.setValue((v & 0b000010000011111) | (t & 0b111101111100000));
	}
}

/**
 * A VRAM address, used for fetching the right tile during render.
 * yyy NN YYYYY XXXXX
 * ||| || ||||| +++++-- coarse X scroll
 * ||| || +++++-------- coarse Y scroll
 * ||| ++-------------- nametable select
 * +++----------------- fine Y scroll
 */
class LoopyAddress {
	constructor() {
		this.coarseX = 0;
		this.coarseY = 0;
		this.nameTableId = 0;
		this.fineY = 0;
	}

	/** Increments X, wrapping when needed. */
	incrementX() {
		if (this.coarseX === 31) {
			this.coarseX = 0;
			this._switchHorizontalNameTable();
		} else {
			this.coarseX++;
		}
	}

	/** Increments Y, wrapping when needed. */
	incrementY() {
		if (this.fineY < 7) {
			this.fineY++;
		} else {
			this.fineY = 0;

			if (this.coarseY === 29) {
				this.coarseY = 0;
				this._switchVerticalNameTable();
			} else if (this.coarseY === 31) {
				this.coarseY = 0;
			} else {
				this.coarseY++;
			}
		}
	}

	/** Converts the address to a 15-bit number. */
	toNumber() {
		return (
			(this.coarseX << LOOPY_ADDR_COARSE_X_OFFSET) |
			(this.coarseY << LOOPY_ADDR_COARSE_Y_OFFSET) |
			(this.nameTableId << LOOPY_ADDR_BASE_NAME_TABLE_ID_OFFSET) |
			(this.fineY << LOOPY_ADDR_FINE_Y_OFFSET)
		);
	}

	/**
	 * Returns the value as a 14-bit number.
	 * The v register has 15 bits, but the PPU memory space is only 14 bits wide.
	 * The highest bit is unused for access through $2007.
	 */
	getValue() {
		return this.toNumber() & 0b11111111111111;
	}

	/** Updates the address from a 15-bit number. */
	setValue(number) {
		this.coarseX =
			(number >> LOOPY_ADDR_COARSE_X_OFFSET) & LOOPY_ADDR_COARSE_X_MASK;
		this.coarseY =
			(number >> LOOPY_ADDR_COARSE_Y_OFFSET) & LOOPY_ADDR_COARSE_Y_MASK;
		this.nameTableId =
			(number >> LOOPY_ADDR_BASE_NAME_TABLE_ID_OFFSET) &
			LOOPY_ADDR_BASE_NAME_TABLE_ID_MASK;
		this.fineY = (number >> LOOPY_ADDR_FINE_Y_OFFSET) & LOOPY_ADDR_FINE_Y_MASK;
	}

	_switchHorizontalNameTable() {
		this.nameTableId = this.nameTableId ^ 0b1;
	}

	_switchVerticalNameTable() {
		this.nameTableId = this.nameTableId ^ 0b10;
	}
}

export default class PPU {
	constructor(cpu) {
		this.cpu = cpu;

		this.cycle = 0;
		this.scanline = -1;
		this.frame = 0;

		this.frameBuffer = new Uint32Array(256 * 240);
		this.colorIndexes = new Uint8Array(256 * 240);
		this.memory = new PPUMemory();

		this.registers = new VideoRegisters(this);
		this.loopy = new LoopyRegister();

		this.backgroundRenderer = new BackgroundRenderer(this);
		this.spriteRenderer = new SpriteRenderer(this);
	}

	plotBG(x, y, color, colorIndex) {
		this.colorIndexes[y * 256 + x] = colorIndex;
		this.plot(x, y, color);
		this.loopy.onPlot(x);
	}

	plot(x, y, color) {
		this.frameBuffer[y * 256 + x] = color;
	}

	isBackgroundPixelOpaque(x, y) {
		return this.colorIndexes[y * 256 + x] > 0;
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
		if (!this.registers.ppuMask.isRenderingEnabled()) return;

		if (this.cycle === 1) {
			this.registers.ppuStatus.isInVBlankInterval = 0;
			this.registers.ppuStatus.spriteOverflow = 0;
			this.registers.ppuStatus.sprite0Hit = 0;
		}

		this.loopy.onPreLine(this.cycle);
	}

	_onVisibleLine() {
		if (!this.registers.ppuMask.isRenderingEnabled()) return;

		if (this.cycle === 0) {
			if (this.registers.ppuMask.showBackground)
				this.backgroundRenderer.renderScanline();
			if (this.registers.ppuMask.showSprites)
				this.spriteRenderer.renderScanline();
		}

		this.loopy.onVisibleLine(this.cycle);
	}

	_onVBlankLine(onInterrupt) {
		if (this.cycle === 1) {
			this.registers.ppuStatus.isInVBlankInterval = 1;
			if (this.registers.ppuCtrl.generateNMIOnVBlank)
				onInterrupt(interrupts.NMI);
		}
	}
}
