# Simple

| Name      | Example       | Input size | Input                     | Output (pseudocode)                  |
| --------- | ------------- | ---------- | ------------------------- | ------------------------------------ |
| Implicit  | `INX`         | `0`        | 🚫                        | 🚫                                   |
| Immediate | `LDA #$08`    | `1`        | 🔢 _final_ **value**      | 🔢                                   |
| Absolute  | `LDA $C002`   | `2`        | 🐏 _full_ **address**     | 🔢/🐏                                |
| Zero Page | `LDA $15`     | `1`        | 🐏 _partial_ **address**  | 🔢/🐏                                |
| Relative  | `BNE @label`  | `1`        | 🐏 _relative_ **address** | 🔢/🐏<br/>`[PC] + address`.          |
| Indirect  | `JMP ($4080)` | `2`        | 🐏 _indirect_ **address** | 🔢/🐏<br/>`read16(address)` **(\*)** |

<br/>

**(\*)** The **Indirect** addressing mode has a bug (called _"page boundary bug"_):

If the address falls on a page boundary `($aaFF)`, it fetches the least significant byte from
`$aaFF` as expected, but takes the most significant byte from `$aa00` (instead of `$ab00`).

# Indexed

| Name             | Example       | Input size | Input                    | Output (pseudocode)                |
| ---------------- | ------------- | ---------- | ------------------------ | ---------------------------------- |
| Zero Page,X      | `STA $60,X`   | `1`        | 🐏 _partial_ **address** | 🔢/🐏<br/>`address + [X]`.         |
| Zero Page,Y      | `STA $60,Y`   | `1`        | 🐏 _partial_ **address** | 🔢/🐏<br/>`address + [Y]`.         |
| Absolute,X       | `STA $4050,X` | `2`        | 🐏 _full_ **address**    | 🔢/🐏<br/>`address + [X]`.         |
| Absolute,Y       | `STA $4050,Y` | `2`        | 🐏 _full_ **address**    | 🔢/🐏<br/>`address + [Y]`.         |
| Indexed Indirect | `STA ($01,X)` | `1`        | 🐏 _partial_ **address** | 🔢/🐏<br/>`read16(address+[X])`.   |
| Indirect Indexed | `LDA ($03),Y` | `1`        | 🐏 _partial_ **address** | 🔢/🐏<br/>`read16(address) + [Y]`. |
