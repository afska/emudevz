# PPU: Definitions

- 🕊️ **Tile**: A 8x8 _grayscale_ pixel grid that represents a **pattern**. Tiles are stored in 🕊️📖 `pattern tables`.
- 🕊️📖 **Pattern table**: A list of **tiles**, stored in 👾 `<CHR-ROM>` or 👾 `<CHR-RAM>` (inside the 💾 `cartridge`, handled by its 🗜️ `mapper`).
  <br /><br />
- 🏞️ **Background**: A **static image** behind the _sprites_, stored in a 🏞️📖 `name tables`.
- 🏞️📖 **Name table**: A map of **tile indexes** for _backgrounds_, stored in 🐏 `<VRAM>`.
  - 🖍️📖 **Attribute tables**: A map of **palette indexes** for _backgrounds_, stored at the end of each 🏞️📖 `name table`.
    <br /><br />
- 🛸 **Sprite**: A **game object** on top of the _background_ that can be moved or flipped, stored in 🛸📖 `OAM`.
- 🛸📖 **OAM**: A list of **sprites**, stored in 🐏 `<OAM RAM>`.
  <br /><br />
- 🎨 **Palette**: A list of **color indexes**, stored in 🐏 `<Palette RAM>`.
- 👑🎨 **Master palette**: A list of 64 **colors**, `hardcoded`.

#### PPU memory regions

- 🐏 VRAM (`2` KiB)
- 🐏 Palette RAM (`32` bytes)
- 🐏 OAM RAM (`256` bytes)
