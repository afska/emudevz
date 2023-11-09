# PPU: Background rendering

- A 🏞️📖 _name table_ is a `32x30` matrix of 🕊️ _tile indexes_.
- Since the screen resolution is `256x240`, and each 🕊️ _tile_ is `8x8` pixels, these `32x30` tiles represent the whole screen ✨.
- Each 🕊️ _tile index_ occupies `1` byte, and there are `64` bytes of 🖍️ _additional metadata_ at the end of the name table.
- So, including the metadata, each _name table_ totals `1024` bytes (`32*30 + 64`).
- The 🐏 `VRAM` contains `2` 🏞️📖 _name tables_.
  - (that's available in PPU addresses `$2000-$27FF`)

<div class="embed-image"><img alt="Name table memory" src="assets/graphics/name_tables.png" style="width: 100%" /></div>

# // TODO: CONTINUE

#### Pattern table example

<div class="embed-image"><img alt="Pattern table" src="assets/graphics/tiles_grayscale.png" style="width: 30%" /></div>

#### Rendering

- A 🕊️ _tile_ is an 8x8 _grayscale_ pixel grid.
- Those pixels are indexes of 🎨 _palette entries_...
- ...so each pixel can be either `0`, `1`, `2` or `3`.
  - (in binary: `00`, `01`, `10` or `11`)

To encode the pixels, the `16` bytes of the tile data are divided in **two** `8-byte` **bitplanes** (<strong style="color: #7723ec">low plane</strong> and <strong style="color: #4eeebf">high plane</strong>).

Here's an example of how a tile for **½** (one-half fraction) is encoded:

```
$41 $C2 $44 $48 $10 $20 $40 $80 $01 $02 $04 $08 $16 $21 $42 $87
```

<div class="embed-image"><img alt="Encoded tile" src="assets/graphics/one_half_fraction2.png" style="width: 75%" /></div>

Each bit in the first plane controls <strong style="color: #7723ec">bit 0</strong> of a pixel's color; the corresponding bit in the second plane controls <strong style="color: #4eeebf">bit 1</strong>.
