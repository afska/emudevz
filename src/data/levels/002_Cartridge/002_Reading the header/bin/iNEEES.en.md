# iNEEES Format

An iNEEES file consists of the following sections, in order:

- Header (`16` bytes)
- Padding, if present (`0` or `512` bytes)
- PRG-ROM data (`16384` \* `x` bytes)
- CHR-ROM data (`8192` \* `y` bytes)

## Header

The format of the header is as follows:

- `0-3`: Constant `$4E $45 $53 $1A`
- `4`: Size of PRG-ROM in `16` KiB units
- `5`: Size of CHR-ROM in `8` KiB units (value `0` means the board uses CHR-RAM)
- `6`: Flags 6 - Mapper (lower nybble), mirroring, persistent memory, padding
- `7`: Flags 7 - Mapper (upper nybble)
- `8-15`: Unused padding

Cartridge boards are divided into classes called **mappers** based on similar board hardware and behavior, and each mapper has an assigned 8-bit number.

### Flags 6

```
76543210
||||||||
|||||||+- Mirroring: 0: horizontal (for vertical scrolling)
|||||||              1: vertical (for horizontal scrolling)
||||||+-- 1: Cartridge contains persistent memory (`$6000`-`$7FFF`)
|||||+--- 1: File contains 512-byte padding before PRG-ROM data
||||+---- 1: Ignore mirroring and provide four-screen VRAM
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
