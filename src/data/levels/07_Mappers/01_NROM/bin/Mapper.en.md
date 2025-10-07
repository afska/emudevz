# `Mapper`

📄 /lib/Mapper.js 📄

This class facilitates the implementation of NEEES mappers.

## Usage

1. Create a class extending `Mapper`.
2. Override and implement the following methods:
  - `cpuRead(address)`
  - `cpuWrite(address, value)`
  - `ppuRead(address)`
  - `ppuWrite(address, value)`
3. Use `$getPrgPage(page)` and `$getChrPage(page)` to get a particular `PRG` or `CHR` page.
  * Alternatively, you can access the `prgPages` and `chrPages` arrays manually.
4. Implement `getSaveState()` and `setSaveState(saveState)` to correctly create and restore save states.
5. You can override `prgRomPageSize()` and `chrRomPageSize()` to change page sizes.
6. You can override `onLoad()` to run operations when a ROM is loaded.
7. You can override `tick()` to run operations on every scanline.
