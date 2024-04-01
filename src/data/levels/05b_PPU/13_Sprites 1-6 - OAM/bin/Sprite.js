import byte from "../byte";

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
export default class Sprite {
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
