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

##### ⬛️⬜️ Grayscale (fixed palette)

- Each byte is a 🕊️ _tile index_ (`0-255`).
- Just draw, from top to bottom, `30` rows (`32` 🕊️ _tiles_ per row).
- Use a fixed 🎨 _palette_:
  - `[0xffffffff, 0xffcecece, 0xff686868, 0xff000000]`.

##### 🎨🌈 Color

- Each block of `"color metadata"` is an 🖍️📖 _attribute table_ that defines which 🎨 _palette_ each tile should use.

<div class="embed-image"><img alt="Attributes" src="assets/graphics/attributes.gif" style="width: 75%" /></div>
