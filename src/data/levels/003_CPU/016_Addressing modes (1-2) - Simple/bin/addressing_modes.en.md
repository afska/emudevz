# Simple

| Name        | Example      | Input size | Input                     | Output                    |
| ----------- | ------------ | ---------- | ------------------------- | ------------------------- |
| Implicit    | `INX`        | `0`        | 🚫                        | 🚫                        |
| Immediate   | `LDA #$08`   | `1`        | 🔢 _final_ **value**      | 🔢                        |
| Absolute    | `LDA $C002`  | `2`        | 🐏 _full_ **address**.    | 🔢/🐏                     |
| Zero Page   | `LDA $15`    | `1`        | 🐏 _partial_ **address**. | 🔢/🐏                     |
| Relative    | `BNE @label` | `1`        | 🐏 _relative_ **address** | 🔢/🐏 `([PC] + address)`. |
| Zero Page,X | `STA $60,X`  | `1`        | 🐏 _partial_ **address**  | 🔢/🐏 `(address + [X])`.  |
| Zero Page,Y | `STA $60,Y`  | `1`        | 🐏 _partial_ **address**  | 🔢/🐏 `(address + [Y])`.  |

// TODO: ACCUMULATOR

# Indirect

| Name     | Example       | Input size | Input                     | Output                                        |
| -------- | ------------- | ---------- | ------------------------- | --------------------------------------------- |
| Indirect | `JMP ($4080)` | `2`        | 🐏 _indirect_ **address** | 🐏 `buildU16(read(address+1), read(address))` |
