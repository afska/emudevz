# Simple

| Name      | Example       | Input size | Input                     | Output (pseudocode)                |
| --------- | ------------- | ---------- | ------------------------- | ---------------------------------- |
| Implicit  | `INX`         | `0`        | 🚫                        | 🚫                                 |
| Immediate | `LDA #$08`    | `1`        | 🔢 _final_ **value**      | 🔢                                 |
| Absolute  | `LDA $C002`   | `2`        | 🐏 _full_ **address**     | 🔢/🐏                              |
| Zero Page | `LDA $15`     | `1`        | 🐏 _partial_ **address**  | 🔢/🐏                              |
| Relative  | `BNE @label`  | `1`        | 🐏 _relative_ **address** | 🐏 **(\*1)**<br/>`[PC] + address`  |
| Indirect  | `JMP ($4080)` | `2`        | 🐏 _indirect_ **address** | 🐏 **(\*2)**<br/>`read16(address)` |

<br/>

**(\*1)** The **Relative** addressing mode adds two extra cycles (`cpu.extraCycles += 2`) if it crosses pages. That is, when `[PC]` and the new address differ in their most significant byte.

**(\*2)** The **Indirect** addressing mode has a bug (called _"page boundary bug"_):

If the address falls on a page boundary `($aaFF)`, it fetches the least significant byte from
`$aaFF` as expected, but takes the most significant byte from `$aa00` (instead of `$ab00`).

So, instead of `read16(address)`, the implementation should be like this:

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

# Indexed

| Name             | Example       | Input size | Input                    | Output (pseudocode)                |
| ---------------- | ------------- | ---------- | ------------------------ | ---------------------------------- |
| Zero Page,X      | `STA $60,X`   | `1`        | 🐏 _partial_ **address** | 🔢/🐏<br/>`address + [X]`.         |
| Zero Page,Y      | `STA $60,Y`   | `1`        | 🐏 _partial_ **address** | 🔢/🐏<br/>`address + [Y]`.         |
| Absolute,X       | `STA $4050,X` | `2`        | 🐏 _full_ **address**    | 🔢/🐏<br/>`address + [X]`.         |
| Absolute,Y       | `STA $4050,Y` | `2`        | 🐏 _full_ **address**    | 🔢/🐏<br/>`address + [Y]`.         |
| Indexed Indirect | `STA ($01,X)` | `1`        | 🐏 _partial_ **address** | 🔢/🐏<br/>`read16(address+[X])`.   |
| Indirect Indexed | `LDA ($03),Y` | `1`        | 🐏 _partial_ **address** | 🔢/🐏<br/>`read16(address) + [Y]`. |
