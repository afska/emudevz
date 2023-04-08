# iNEEES Format

An iNEEES file consists of the following sections, in order:

- 🗣️ Header (`16` bytes)
- 🧸 Padding, if present (`0` or `512` bytes)
- 🤖 `PRG-ROM` data (`16384` \* `x` bytes)
  - `x` = byte `4` from header
- 👾 `CHR-ROM` data (`8192` \* `y` bytes)
  - `y` = byte `5` from header

## Header

The format of the header is as follows:

- `0-3`: Constant `$4E $45 $53 $1A`
- `4`: Size of 🤖 `PRG-ROM` in `16` KiB units
- `5`: Size of 👾 `CHR-ROM` in `8` KiB units (value `0` means the board uses `8` KiB of 👾 `CHR-RAM`)
- `6`: Flags 6 - 🧠 Mapper (lower nybble), 🚽 mirroring, 🔋 game saves (`PRG-RAM`), 🧸 padding
- `7`: Flags 7 - 🧠 Mapper (upper nybble)
- `8-15`: 🧸 Unused padding

🧠 Cartridge boards are divided into classes called **mappers** based on similar board hardware and behavior, and each mapper has an assigned 8-bit number.

🚽 Each cartridge also defines a **mirroring type** which directly affects the screen arrangement and how the game will handle scrolling.

For now:

- 🧠 Mapper id can be any number between `0` and `255`.
- 🚽 Mirroring type can be any of: `HORIZONTAL`, `VERTICAL`, `FOUR_SCREENS`.

### Flags 6

```
76543210
||||||||
|||||||+- Mirroring: 0: HORIZONTAL (for vertical scrolling)
|||||||              1: VERTICAL (for horizontal scrolling)
||||||+-- 1: Cartridge contains PRG-RAM (for save files)
|||||+--- 1: File contains 512-byte padding before PRG-ROM data
||||+---- 1: Ignore bit 0 and use FOUR_SCREENS mirroring
++++----- Lower nybble of mapper number
```

### Flags 7

```
76543210
||||||||
||||||||
||||||||
||||||||
||||||||
||||++++- Unused padding
++++----- Upper nybble of mapper number
```
