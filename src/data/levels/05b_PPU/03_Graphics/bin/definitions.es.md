# PPU: Definiciones

<hr />

- 🕊️ **Tile**: Una cuadrícula de `8x8` píxeles en _escala de grises_ que representa un **patrón**. Los tiles se almacenan en 🕊️📖 pattern tables.

<div class="embed-image"><img alt="Tile" src="assets/graphics/tile_grayscale.png" style="width: 30%" /></div>

- 🕊️📖 **Pattern table**: Una lista de 🕊️ tiles, almacenada en 👾 CHR-ROM o 👾 CHR-RAM.
<div class="embed-image"><img alt="Pattern table" src="assets/graphics/tiles_grayscale.png" style="width: 30%" /></div>

<hr />

- 🏞️ **Fondo**: Una **imagen estática** detrás de los sprites, almacenada en una 🏞️📖 name table.

- 🏞️📖 **Name table**: Un mapa de **índices de tiles** para fondos, almacenado en 🐏 VRAM.

- 🖍️📖 **Attribute table**: Un mapa de **índices de paleta** para fondos, almacenado al final de cada 🏞️📖 name table.

<div class="embed-image"><img alt="Background" src="assets/graphics/background.png" style="width: 30%" /></div>

<hr />

- 🛸 **Sprite**: Un **objeto del juego** encima (¡o detrás!) del fondo que puede ser movido o volteado, almacenado en 🛸📖 OAM. Puede usar uno (sprite de `8x8`) o dos (sprite de `8x16`) 🕊️ tiles.

- 🛸📖 **OAM**: _(Object Attribute Memory)_ Una lista de sprites, almacenada en 🐏 OAM RAM.
<div class="embed-image"><img alt="Sprites" src="assets/graphics/sprites.png" style="width: 30%" /></div>

<hr />

- 🎨 **Paleta**: Una lista de **índices de colores**, almacenada en 🐏 Palette RAM.

- 👑🎨 **Paleta maestra**: Una lista de 64 **colores**, `hardcodeada`.
<div class="embed-image"><img alt="Master palette" src="assets/graphics/colors.png" style="width: 50%" /></div>

<hr />

#### Regiones de memoria de la PPU

- 🐏 VRAM (`2` KiB)
- 🐏 Palette RAM (`32` bytes)
- 🐏 OAM RAM (`256` bytes)
