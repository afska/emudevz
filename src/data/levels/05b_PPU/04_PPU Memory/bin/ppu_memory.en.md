# PPU Memory Map

| Address range | Size    | Device                                |
| ------------- | ------- | ------------------------------------- |
| `$0000-$1FFF` | `$2000` | 🕊️ Pattern tables 0 and 1 (mapper)    |
| `$2000-$2FFF` | `$1000` | 🏞️ Name tables 0 to 3 (VRAM + mirror) |
| `$3000-$3EFF` | `$0F00` | 🚽 Mirrors of `$2000-$2EFF`           |
| `$3F00-$3F1F` | `$0020` | 🎨 Palette RAM                        |
| `$3F20-$3FFF` | `$00E0` | 🚽 Mirrors of `$3F00-$3F1F`           |

#### PPU memory chips

- 🐏 VRAM (`2` KiB)
- 🐏 Palette RAM (`32` bytes)
- 🐏 OAM RAM (`256` bytes)

#### Definitions

- 🕊️ **Pattern tables**: Contain **tiles**, stored in 👾 `<CHR-ROM>` or 👾 `<CHR-RAM>` (inside the 💾 cartridge, handled by the 🗜️ mapper).
- 🏞️ **Name tables**: Contain **tile indexes** for _backgrounds_, stored in 🐏 `<VRAM>`.
  - 🖍️ **Attribute tables**: Contain **palette indexes** for _backgrounds_, stored at the end of each _name table_.
- 🎨 **Palettes**: Contain **colors**, stored in 🐏 `<Palette RAM>`.
- 🛸 **OAM**: Contains **sprites**, stored in 🐏 `<OAM RAM>`.
