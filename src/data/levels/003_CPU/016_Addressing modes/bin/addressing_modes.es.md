# CPU: Modos de direccionamiento

#### Simples

| Nombre    | Ejemplo       | Tamaño de entrada | Entrada                      | Salida (pseudocódigo)              |
| --------- | ------------- | ----------------- | ---------------------------- | ---------------------------------- |
| Implicit  | `INX`         | `0`               | 🚫                           | 🚫                                 |
| Immediate | `LDA #$08`    | `1`               | 🔢 **valor** _final_         | 🔢                                 |
| Absolute  | `LDA $C002`   | `2`               | 🐏 **dirección** _completa_  | 🔢/🐏                              |
| Zero Page | `LDA $15`     | `1`               | 🐏 **dirección** _parcial_   | 🔢/🐏                              |
| Relative  | `BNE @label`  | `1`               | 🐏 **dirección** _relativa_  | 🐏 **(\*1)**<br/>`[PC] + address`  |
| Indirect  | `JMP ($4080)` | `2`               | 🐏 **dirección** _indirecta_ | 🐏 **(\*2)**<br/>`read16(address)` |

#### Indexados

| Nombre           | Ejemplo       | Tamaño de entrada | Entrada                     | Salida (pseudocódigo)                       |
| ---------------- | ------------- | ----------------- | --------------------------- | ------------------------------------------- |
| Zero Page,X      | `STA $60,X`   | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/>`toU8(address+[X])`               |
| Zero Page,Y      | `STA $60,Y`   | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/>`toU8(address+[Y])`               |
| Absolute,X       | `STA $4050,X` | `2`               | 🐏 **dirección** _completa_ | 🔢/🐏 **(\*1)**<br/>`address + [X]`         |
| Absolute,Y       | `STA $4050,Y` | `2`               | 🐏 **dirección** _completa_ | 🔢/🐏 **(\*1)**<br/>`address + [Y]`         |
| Indexed Indirect | `STA ($01,X)` | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏 **(\*1)**<br/>`read16(address+[X])`   |
| Indirect Indexed | `LDA ($03),Y` | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏 **(\*1)**<br/>`read16(address) + [Y]` |

<hr>

**(\*1)** Estos modos de direccionamiento definen la _salida_ como la suma de una _dirección base_ y un desplazamiento, agregando dos ciclos extra (`cpu.extraCycles += 2`) si cruzan páginas. Esto es, cuando la _dirección base_ y la _salida_ difieren en su byte más significativo.

⚠️ No todos los opcodes tienen esta penalidad al cruzar de página, por lo que los modos de direccionamiento reciben un booleano `hasPageCrossPenalty` que indica si los ciclos extra deberían ser agregados.

**(\*2)** El modo de direccionamiento **Indirect** tiene una falla (llamada _"page boundary bug"_):

Si la dirección cae en el borde de una página `($aaFF)`, lee el byte menos significativo de `$aaFF` como es esperado, pero toma el byte más significativo de `$aa00` (en vez de `$ab00`).

Así que, en vez de `read16(address)`, la implementación debería ser algo así:

```
buildU16(
  read(
    lowByteOf(address) === 0xff
      ? buildU16(highByteOf(address), 0x00)
      : address + 1
  ),
  read(address)
);
```
