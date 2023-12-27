# PPU: Background rendering

- A 🏞️📖 _name table_ is a matrix of `32x30` 🕊️ _tile indexes_.
- Since the screen resolution is `256x240`, and each 🕊️ _tile_ is `8x8` pixels, these `32x30` tiles cover the whole screen area ✨.
- Each 🕊️ _tile index_ occupies `1` byte, and there are `64` bytes of 🖍️ _color metadata_ at the end of the name table.
- So, each _name table_ totals `1024` bytes (`32*30*1 + 64`).
- The 🐏 `VRAM` contains `2` 🏞️📖 _name tables_.
  - (that's available in PPU addresses `$2000-$27FF`)

<div class="embed-image"><img alt="Name table memory" src="assets/graphics/name_tables.png" style="width: 100%" /></div>

#### Name table example

<div class="embed-image"><img alt="Name table" src="assets/graphics/nametable_debug.png" style="width: 75%" /></div>

#### Rendering

##### ⬛️⬜️ Grayscale

- Find the location of the 🏞️📖 _name table_:
  - The first `2` bits of 🎛️ `PPUCtrl` contain the `nameTableId`.
  - The table will be in the PPU address `0x2000 + nameTableId * 1024`.
- Find out which 🏞️📖 _pattern table_ we should use (`0` or `1`):
  - This is in bit `4` of 🎛️ `PPUCtrl`.
- Each of the next `960` bytes will be a 🕊️ _tile index_ (`0-255`).
  - Ignore 🖍️ _color metadata_ for now.
- On cycle `256` of every visible scanline (`0-239`), draw a row of pixels (composed by `32` tiles each).
  - Use a fixed 🎨 _palette_:
    - `[0xffffffff, 0xffcecece, 0xff686868, 0xff000000]`.

##### 🎨🌈 Adding color

###### **Obtaining palette ids**

- Each section of `"color metadata"` is an 🖍️📖 _attribute table_ that defines which 🎨 _palette_ each tile should use.
- 🎨 Palettes have `4` colors, and they are assigned to `blocks` of `2x2` tiles.

<div class="embed-image"><img alt="Palette blocks" src="assets/graphics/palette-blocks.gif" style="width: 75%" /></div>

- The red grid illustrates palette `blocks`. Note how all tiles of each `2x2` block share the same palette.
- To encode this data, the screen is first divided into `metablocks` of `4x4` tiles.

<div class="embed-image"><img alt="Palette metablocks" src="assets/graphics/palette-metablocks.gif" style="width: 75%" /></div>

- The green grid represents `metablocks`. There are `64` of them, `1` byte per `metablock`.
- Each byte contains:
  - Bits `0,1`: 🎨 _palette id_ of `block 0` (top-left).
  - Bits `2,3`: 🎨 _palette id_ of `block 1` (top-right).
  - Bits `4,5`: 🎨 _palette id_ of `block 2` (bottom-left).
  - Bits `6,7`: 🎨 _palette id_ of `block 3` (bottom-right).

###### **Reading palette data**

- A 🎨 _palette_ is an array of `4` 🖍️ _color indexes_ (`0-63`), pointing to the hardcoded 👑🎨 `master palette`.
- Each 🖍️ _color index_ occupies `1` byte, so each 🎨 _palette_ totals `4` bytes.
- The 🐏 `Palette RAM` contains `4` palettes for backgrounds, and `4` palettes for sprites.
  - (background palettes are available in PPU addresses `$3F00-$3F0F`)

<div class="embed-image"><img alt="Palette RAM" src="assets/graphics/palette_ram.png" style="width: 100%" /></div>
