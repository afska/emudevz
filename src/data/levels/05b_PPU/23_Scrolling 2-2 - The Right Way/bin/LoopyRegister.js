import byte from "../byte";

const LOOPY_ADDR_COARSE_X_OFFSET = 0;
const LOOPY_ADDR_COARSE_X_MASK = 0b11111;
const LOOPY_ADDR_COARSE_Y_OFFSET = 5;
const LOOPY_ADDR_COARSE_Y_MASK = 0b11111;
const LOOPY_ADDR_BASE_NAME_TABLE_ID_OFFSET = 10;
const LOOPY_ADDR_BASE_NAME_TABLE_ID_MASK = 0b11;
const LOOPY_ADDR_FINE_Y_OFFSET = 12;
const LOOPY_ADDR_FINE_Y_MASK = 0b111;
const NAME_TABLE_OFFSETS = [1, -1, 1, -1];
const TILE_SIZE_PIXELS = 8;
const SCREEN_WIDTH = 256;

/**
 * PPU's internal register (discovered by a user called `loopy`).
 * It contains important data related to Name table scrolling.
 * Every write to `PPUAddr`, `PPUScroll`, and `PPUCtrl` changes its state.
 * It's also changed multiple times by the PPU during render.
 */
export default class LoopyRegister {
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

  /** Returns the scrolled Y in Name table coordinates ([0..255]). */
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
      w: this.latch
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
