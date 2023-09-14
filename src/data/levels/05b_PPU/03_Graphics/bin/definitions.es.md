# PPU: Definiciones

- 🕊️ **Tile**: Una cuadrícula de 8x8 píxeles en _escala de grises_ que representa un **pattern**. Los tiles se almacenan en 🕊️📖 `pattern tables`.
- 🕊️📖 **Pattern table**: Una lista de **tiles**, almacenada en 👾 `<CHR-ROM>` o 👾 `<CHR-RAM>` (dentro del 💾 `cartucho`, gestionada por su 🗜️ `mapper`).
  <br /><br />
- 🏞️ **Fondo**: Una **imagen estática** detrás de los _sprites_, almacenada en una 🏞️📖 `name table`.
- 🏞️📖 **Name table**: Un mapa de **índices de tiles** para _fondos_, almacenado en 🐏 `<VRAM>`.
  - 🖍️📖 **Attribute table**: Un mapa de **índices de paleta** para _fondos_, almacenado al final de cada 🏞️📖 `name table`.
    <br /><br />
- 🛸 **Sprite**: Un **objeto del juego** encima del _fondo_ que puede ser movido o volteado, almacenado en 🛸📖 `OAM`.
- 🛸📖 **OAM**: Una lista de **sprites**, almacenada en 🐏 `<OAM RAM>`.
  <br /><br />
- 🎨 **Paleta**: Una lista de **índices de colores**, almacenada en 🐏 `<Palette RAM>`.
- 👑🎨 **Paleta maestra**: Una lista de 64 **colores**, `hardcodeada`.

#### Regiones de memoria de la PPU

- 🐏 VRAM (`2` KiB)
- 🐏 Palette RAM (`32` bytes)
- 🐏 OAM RAM (`256` bytes)
