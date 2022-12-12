/*
 * A byte helper. Numbers use the "Two's complement" representation.
 *
 * Positive values are: {value}            => [0  , 127]
 * Negative values are: -(256 - {value})   => [128, 255]
 */
export default {
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

	/** Returns whether `u8` is positive or not. */
	isPositive(u8) {
		return !((u8 >> 7) & 1);
	},

	/** Returns whether `u8` is negative or not. */
	isNegative(u8) {
		return (u8 >> 7) & 1;
	},

	/** Converts `u8` to its negative. */
	negate(u8) {
		return this.toU8(-this.toS8(u8));
	},

	/** Returns the bit located at `position` in `number`, as a boolean. */
	getFlag(number, position) {
		return !!this.getBit(number, position);
	},

	/** Returns the bit located at `position` in `number`. */
	getBit(number, position) {
		return (number >> position) & 1;
	},

	/** Returns a sub-number of `size` bits inside a `byte`, starting at `startPosition`. */
	getBits(byte, startPosition, size) {
		return (byte >> startPosition) & (0xff >> (8 - size));
	},

	/** Inserts a `value` of `size` bits inside a `byte`, starting at `startPosition`. */
	setBits(byte, startPosition, size, value) {
		let newByte = byte;
		for (let i = startPosition; i < startPosition + size; i++)
			newByte &= ~(1 << i);
		return newByte | (value << startPosition);
	},

	/** Returns the most significative byte of `u16`. */
	highByteOf(u16) {
		return u16 >> 8;
	},

	/** Returns the least significative byte of `u16`. */
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

	/** Returns a random byte ([0, `max`]). */
	random(max = 255) {
		return Math.floor(Math.random() * max);
	},
};
