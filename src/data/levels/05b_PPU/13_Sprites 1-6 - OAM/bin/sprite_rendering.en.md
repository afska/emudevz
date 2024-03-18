# PPU: Sprite rendering

- A 🛸📖 _OAM table_ is an array of `64` 🛸 _OAM entries_.
- Each 🛸 _OAM entry_ represents a _sprite_ and occupies `4` bytes.
- The 🐏 `OAM RAM` contains the full _OAM table_ (`256` bytes).
  - (it can only be accessed via 🏠 `OAMAddr` / 📝 `OAMData` / ⚡ `OAMDMA`)
- If bit `5` of 🎛️ `PPUCtrl` (_sprite height_) is enabled, sprites are rendered in `8x16` mode instead of `8x8`.

## OAM entry format

- Byte `0`: **Y** coordinate of the sprite (minus `1`).
- Byte `1`: 🕊️ _tile index_ of the sprite.
  - In `8x8` mode:
    - This byte is the actual _tile index_.
    - The _pattern table_ is obtained from bit `3` of 🎛️ `PPUCtrl` (_sprite pattern table select_).
  - In `8x16` mode:
    - The _tile index_ of the _top tile_ is this byte with its first bit clear (`byte1 & 0b11111110`).
    - The _tile index_ of the _bottom tile_ is the _top tile index_ plus `1`.
    - The _pattern table_ is obtained from the first bit (`byte1 & 0b00000001`).
- Byte `2`: Sprite attributes.
  - Bits `0-1`: Palette id.
  - Bit `5`: Priority (`0`: in front of background, `1`: behind background).
  - Bit `6`: Flip horizontally.
  - Bit `7`: Flip vertically.
- Byte `3`: **X** coordinate of the sprite.
