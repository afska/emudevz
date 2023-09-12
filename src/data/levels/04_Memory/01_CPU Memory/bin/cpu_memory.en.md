# CPU Memory Map

| Address range | Size    | Device                                     |
| ------------- | ------- | ------------------------------------------ |
| `$0000-$07FF` | `$0800` | 🐏 WRAM (`2` KiB)                          |
| `$0800-$1FFF` | `$1800` | 🚽 Mirrors of `$0000-$07FF`                |
| `$2000-$2007` | `$0008` | 🖥️ PPU registers                           |
| `$2008-$3FFF` | `$1FF8` | 🚽 Mirrors of `$2000-$2007`                |
| `$4000-$4013` | `$0014` | 🔊 APU registers                           |
| `$4014-$4014` | `$0001` | 🖥️ PPU's OAMDMA register                   |
| `$4015-$4015` | `$0001` | 🔊 APUStatus / APUControl registers        |
| `$4016-$4016` | `$0001` | 🎮 Controller port 1                       |
| `$4017-$4017` | `$0001` | 🎮 Controller port 2 / 🔊 APUFrameCounter  |
| `$4018-$401F` | `$0008` | 🧸 Unused                                  |
| `$4020-$FFFF` | `$BFE0` | 💾 Cartridge space (PRG-ROM, mapper, etc.) |

#### CPU memory regions

- 🐏 WRAM (`2` KiB)
