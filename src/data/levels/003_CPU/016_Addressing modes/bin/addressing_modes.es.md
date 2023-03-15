# Simples

| Nombre    | Ejemplo       | Tamaño de entrada | Entrada                      | Salida (pseudocódigo)              |
| --------- | ------------- | ----------------- | ---------------------------- | ---------------------------------- |
| Implicit  | `INX`         | `0`               | 🚫                           | 🚫                                 |
| Immediate | `LDA #$08`    | `1`               | 🔢 **valor** _final_         | 🔢                                 |
| Absolute  | `LDA $C002`   | `2`               | 🐏 **dirección** _completa_  | 🔢/🐏                              |
| Zero Page | `LDA $15`     | `1`               | 🐏 **dirección** _parcial_   | 🔢/🐏                              |
| Relative  | `BNE @label`  | `1`               | 🐏 **dirección** _relativa_  | 🐏 **(\*1)**<br/>`[PC] + address`  |
| Indirect  | `JMP ($4080)` | `2`               | 🐏 **dirección** _indirecta_ | 🐏 **(\*2)**<br/>`read16(address)` |

<br/>

**(\*1)** El modo de direccionamiento **Relative** agrega dos ciclos extra (`cpu.extraCycles += 2`) si cruza páginas. Esto es, cuando `[PC]` y la nueva dirección difieren en su byte más significativo.

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

# Indexados

| Nombre           | Ejemplo       | Tamaño de entrada | Entrada                     | Salida (pseudocódigo)              |
| ---------------- | ------------- | ----------------- | --------------------------- | ---------------------------------- |
| Zero Page,X      | `STA $60,X`   | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/>`address + [X]`.         |
| Zero Page,Y      | `STA $60,Y`   | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/>`address + [Y]`.         |
| Absolute,X       | `STA $4050,X` | `2`               | 🐏 **dirección** _completa_ | 🔢/🐏<br/>`address + [X]`.         |
| Absolute,Y       | `STA $4050,Y` | `2`               | 🐏 **dirección** _completa_ | 🔢/🐏<br/>`address + [Y]`.         |
| Indexed Indirect | `STA ($01,X)` | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/>`read16(address+[X])`.   |
| Indirect Indexed | `LDA ($03),Y` | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/>`read16(address) + [Y]`. |
