# Modos de direccionamiento

#### Simples

| Nombre    | Ejemplo       | Tamaño de entrada | Entrada                      | Salida (pseudocódigo)                         |
| --------- | ------------- | ----------------- | ---------------------------- | --------------------------------------------- |
| Implicit  | `INX`         | `0`               | 🚫                           | 🚫                                            |
| Immediate | `LDA #$08`    | `1`               | 🔢 **valor** _final_         | 🔢                                            |
| Absolute  | `LDA $C002`   | `2`               | 🐏 **dirección** _completa_  | 🔢/🐏                                         |
| Zero Page | `LDA $15`     | `1`               | 🐏 **dirección** _parcial_   | 🔢/🐏                                         |
| Relative  | `BNE @label`  | `1`               | 🐏 **dirección** _relativa_  | 🐏 **(\*)**<br/>`toU16([PC] + toS8(address))` |
| Indirect  | `JMP ($4080)` | `2`               | 🐏 **dirección** _indirecta_ | 🐏<br/>`read16(address)`                      |

#### Indexados

| Nombre           | Ejemplo       | Tamaño de entrada | Entrada                     | Salida (pseudocódigo)                                                                                                                                                           |
| ---------------- | ------------- | ----------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zero Page,X      | `STA $60,X`   | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/>`toU8(address+[X])`                                                                                                                                                   |
| Zero Page,Y      | `STA $60,Y`   | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/>`toU8(address+[Y])`                                                                                                                                                   |
| Absolute,X       | `STA $4050,X` | `2`               | 🐏 **dirección** _completa_ | 🔢/🐏 **(\*)**<br/>`toU16(address+[X])`                                                                                                                                         |
| Absolute,Y       | `STA $4050,Y` | `2`               | 🐏 **dirección** _completa_ | 🔢/🐏 **(\*)**<br/>`toU16(address+[Y])`                                                                                                                                         |
| Indexed Indirect | `STA ($01,X)` | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/><br/>`const start = toU8(address+[X]);`<br/>`const end = toU8(start+1);`<br/><br/>`buildU16(read(end), read(start))`                                                  |
| Indirect Indexed | `LDA ($03),Y` | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏 **(\*)**<br/><br/>`const start = address;`<br/>`const end = toU8(start+1);`<br/>`const baseAddress = buildU16(read(end), read(start));`<br/><br/>`toU16(baseAddress+[Y])` |

<hr>

**(\*)** Estos modos de direccionamiento definen la _salida_ como la suma de una _dirección base_ y un desplazamiento, agregando `1` ciclo extra (`cpu.extraCycles++`) si se cruza un límite de página. Esto es, cuando la _dirección base_ y la _salida_ difieren en su byte más significativo (por ejemplo, al sumar `$3BFF + 1` se produce un _cruce de página_).

⚠️ No todos los opcodes tienen esta penalización por cruce de página, por lo que los modos de direccionamiento reciben un booleano `hasPageCrossPenalty` que indica si se deben agregar ciclos extra cuando se cruza un límite de página. Para que quede claro, solo debes agregar ciclos si se cumplen **ambas** condiciones (`hasPageCrossPenalty && thereIsPageCross`).
