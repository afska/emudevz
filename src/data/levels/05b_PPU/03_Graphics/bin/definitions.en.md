# PPU: Definitions

<hr />

- 🕊️ **Tile**: An 8x8 _grayscale_ pixel grid that represents a **pattern**. Tiles are stored in 🕊️📖 pattern tables.
<div class="embed-image"><img alt="Tile" src="assets/graphics/tile_grayscale.png" style="width: 30%" /></div>
- 🕊️📖 **Pattern table**: A list of 🕊️ tiles, stored in 👾 CHR-ROM or 👾 CHR-RAM.
<div class="embed-image"><img alt="Pattern table" src="assets/graphics/tiles_grayscale.png" style="width: 30%" /></div>
<hr />
- 🏞️ **Background**: A **static image** behind the sprites stored in a 🏞️📖 name table.
- 🏞️📖 **Name table**: A map of **tile indexes** for backgrounds, stored in 🐏 VRAM.
- 🖍️📖 **Attribute tables**: A map of **palette indexes** for backgrounds, stored at the end of each 🏞️📖 name table.
<div class="embed-image"><img alt="Background" src="assets/graphics/background.png" style="width: 30%" /></div>
<hr />
- 🛸 **Sprite**: A **game object** on top (or behind!) of the background that can be moved or flipped, stored in 🛸📖 OAM. It can use one 🕊️ tile (`8x8` sprite) or two (`8x16` sprite).
- 🛸📖 **OAM**: _(Object Attribute Memory)_ A list of sprites, stored in 🐏 OAM RAM.
<div class="embed-image"><img alt="Sprites" src="assets/graphics/sprites.png" style="width: 30%" /></div>
<hr />
- 🎨 **Palette**: A list of **color indexes**, stored in 🐏 Palette RAM.
- 👑🎨 **Master palette**: A list of 64 **colors**, `hardcoded`.
<div class="embed-image"><img alt="Master palette" src="assets/graphics/colors.png" style="width: 50%" /></div>

<hr />

#### PPU memory regions

- 🐏 VRAM (`2` KiB)
- 🐏 Palette RAM (`32` bytes)
- 🐏 OAM RAM (`256` bytes)
