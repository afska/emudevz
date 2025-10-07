# `Mapper`

📄 /lib/Mapper.js 📄

Esta clase facilita la implementación de los mappers de NEEES.

## Uso

1. Crea una clase que extienda `Mapper`.
2. Sobrescribe e implementa los siguientes métodos:
   - `cpuRead(address)`
   - `cpuWrite(address, value)`
   - `ppuRead(address)`
   - `ppuWrite(address, value)`
3. Usa `$getPrgPage(page)` y `$getChrPage(page)` para obtener una página específica de `PRG` o `CHR`.
4. Implementa `getSaveState()` y `setSaveState(saveState)` para crear y restaurar correctamente los save states.
5. Puedes sobrescribir `prgRomPageSize()` y `chrRomPageSize()` para cambiar el tamaño de las páginas.
6. Puedes sobrescribir `onLoad()` para ejecutar operaciones cuando se carga una ROM.
7. Puedes sobrescribir `tick()` para ejecutar operaciones en cada scanline.
