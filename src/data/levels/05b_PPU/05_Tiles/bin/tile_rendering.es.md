# PPU: Renderizado de Tiles

- Una 🕊️📖 _pattern table_ es una lista de `256` 🕊️ _tiles_ consecutivos.
- Cada 🕊️ _tile_ ocupa `16` bytes...
- ...por lo tanto, cada _pattern table_ es de `4096` bytes.
- El 👾 `<CHR-ROM>` dentro del 💾 `cartucho` contiene `2` 🕊️📖 _pattern tables_.
  - (eso está disponible en las direcciones PPU `$0000-$1FFF`)

#### Ejemplo de pattern table

<div class="embed-image"><img alt="Pattern table memory" src="assets/graphics/tile_bitplanes.png" style="width: 100%" /></div>

#### Renderizado

- Un 🕊️ _tile_ es una cuadrícula de 8x8 píxeles en _escala de grises_.
- Esos píxeles son índices de 🎨 _entradas de paleta_...
- ...por lo tanto, cada píxel puede ser `0`, `1`, `2` o `3`.
  - (en binario: `00`, `01`, `10` o `11`)

Para codificar los píxeles, los `16` bytes de los datos del tile se dividen en **dos** **bitplanes** de `8 bytes` (<strong style="color: #7723ec">low plane</strong> y <strong style="color: #4eeebf">high plane</strong>).

Aquí tienes un ejemplo de cómo se codifica un tile para **½** (fracción de un medio):

<div class="embed-image"><img alt="Encoded tile" src="assets/graphics/one_half_fraction.png" style="width: 75%" /></div>

Cada bit en el primer plano controla el <strong style="color: #7723ec">bit 0</strong> del color de un píxel; el bit correspondiente en el segundo plano controla el <strong style="color: #4eeebf">bit 1</strong>.
