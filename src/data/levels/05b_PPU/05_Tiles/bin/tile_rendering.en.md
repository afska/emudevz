# PPU: Tile rendering

- A 🕊️📖 _pattern table_ is a list of `256` consecutive 🕊️ _tiles_.
- Each 🕊️ _tile_ occupies `16` bytes...
- ...so each _pattern table_ is `4096` bytes.
- The 👾 `<CHR-ROM>` inside the 💾 `cartridge` contains `2` 🕊️📖 _pattern tables_.
  - (that's available in PPU addresses `$0000-$1FFF`)

#### Pattern table example

<div class="embed-image"><img alt="Pattern table" src="assets/graphics/tiles_grayscale.png" style="width: 30%" /></div>

#### Rendering

- A 🕊️ _tile_ is an 8x8 _grayscale_ pixel grid.
- Those pixels are indexes of 🎨 _palette entries_...
- ...so each pixel can be either `0`, `1`, `2` or `3`.
  - (in binary: `00`, `01`, `10` or `11`)

To encode the pixels, the `16` bytes of the tile data are divided in **two** `8-byte` **bitplanes**.

Here's an example of how a tile for **½** (one-half fraction) is encoded:

<div class="embed-image"><img alt="Encoded tile" src="assets/graphics/one_half_fraction.png" style="width: 75%" /></div>

Each bit in the first plane controls <strong style="color: #7723ec">bit 0</strong> of a pixel's color; the corresponding bit in the second plane controls <strong style="color: #4eeebf">bit 1</strong>.
