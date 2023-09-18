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
  }
};
