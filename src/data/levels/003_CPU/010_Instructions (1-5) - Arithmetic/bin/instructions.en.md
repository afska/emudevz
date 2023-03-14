# CPU Instructions

#### 🔢 Arithmetic

| Code   | Name                                | Arg | Description                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------ | ----------------------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ADC`  | Add with Carry                      | 🔢  | Adds the contents of a `value` to `[A]` together with the Carry flag (`[A]` = `[A]` + `value` + `C`), updating the `Z` and `N` flags.<br><br>The `C` and `V` flags are set in case of unsigned and signed overflow respectively.<br><br>Unsigned overflow occurs when the result is >= `256` (use `byte.overflows(...)`).<br>Signed overflow occurs when `Positive + Positive = Negative` or `Negative + Negative = Positive`. |
| `ASL`  | Arithmetic Shift Left               | 🐏  | Shifts all the bits of the value held at an `address` one bit to the left.<br><br>Bit `7` is placed in the `C` flag and bit `0` is set to `0`.<br><br>The `Z` and `N` flags are updated using the result.                                                                                                                                                                                                                      |
| `ASLa` | Arithmetic Shift Left (Accumulator) | 🚫  | Like `ASL`, but works with `[A]` instead of a memory address.                                                                                                                                                                                                                                                                                                                                                                  |
| `DEC`  | Decrement Memory                    | 🐏  | Substracts one from the value held at an `address`, updating the `Z` and `N` flags.                                                                                                                                                                                                                                                                                                                                            |
| `DEX`  | Decrement X Register                | 🚫  | Substracts one from `[X]`, updating the `Z` and `N` flags.                                                                                                                                                                                                                                                                                                                                                                     |
| `DEY`  | Decrement Y Register                | 🚫  | Substracts one from `[Y]`, updating the `Z` and `N` flags.                                                                                                                                                                                                                                                                                                                                                                     |
| `INC`  | Increment Memory                    | 🐏  | Adds one to the value held at an `address`, updating the `Z` and `N` flags.                                                                                                                                                                                                                                                                                                                                                    |
| `INX`  | Increment X Register                | 🚫  | Adds one to `[X]`, updating the `Z` and `N` flags.                                                                                                                                                                                                                                                                                                                                                                             |
| `INY`  | Increment Y Register                | 🚫  | Adds one to `[Y]`, updating the `Z` and `N` flags.                                                                                                                                                                                                                                                                                                                                                                             |
| `LSR`  | Logical Shift Right                 | 🐏  | Shifts all the bits of the value held at an `address` one bit to the right.<br><br>Bit `0` is placed in the `C` flag and bit `7` is set to `0`.<br><br>The `Z` and `N` flags are updated using the result.                                                                                                                                                                                                                     |
| `LSRa` | Logical Shift Right (Accumulator)   | 🚫  | Like `LSR`, but works with `[A]` instead of a memory address.                                                                                                                                                                                                                                                                                                                                                                  |
| `ROL`  | Rotate Left                         | 🐏  | Moves all the bits of the value held at an `address` one place to the left.<br><br>Bit `7` is placed in the `C` flag and bit `0` is filled with the old value of the `C` flag.<br><br>The `Z` and `N` flags are updated using the result.                                                                                                                                                                                      |
| `ROLa` | Rotate Left (Accumulator)           | 🚫  | Like `ROL`, but works with `[A]` instead of a memory address.                                                                                                                                                                                                                                                                                                                                                                  |
| `ROR`  | Rotate Right                        | 🐏  | Moves all the bits of the value held at an `address` one place to the right.<br><br>Bit `0` is placed in the `C` flag and bit `7` is filled with the old value of the `C` flag.<br><br>The `Z` and `N` flags are updated using the result.                                                                                                                                                                                     |
| `RORa` | Rotate Right (Accumulator)          | 🚫  | Like `ROR`, but works with `[A]` instead of a memory address.                                                                                                                                                                                                                                                                                                                                                                  |
| `SBC`  | Subtract with Carry                 | 🔢  | Substracts the contents of a `value` to `[A]` together with the `not` of the Carry flag.<br><br>The `Z`, `N`, `C` (set if there was no borrow), and `V` (set when sign is wrong) flags are updated.<br><br>It can be implemented as an `ADC` call with the negative representation of `value` - 1.<br>Ex:<br>`SBC(cpu, value) { ADC(cpu, byte.negate(value) - 1) }`                                                            |

#### 🐏 Data

| Code  | Name                        | Arg | Description                                                             |
| ----- | --------------------------- | --- | ----------------------------------------------------------------------- |
| `CLC` | Clear Carry Flag            | 🚫  | Sets `C` = `0`.                                                         |
| `CLD` | Clear Decimal Mode          | 🚫  | Sets `D` = `0`.                                                         |
| `CLI` | Clear Interrupt Disable     | 🚫  | Sets `I` = `0`.                                                         |
| `CLV` | Clear Overflow Flag         | 🚫  | Sets `V` = `0`.                                                         |
| `LDA` | Load Accumulator            | 🔢  | Loads a `value` into `[A]`, updating the `Z` and `N` flags.             |
| `LDX` | Load X Register             | 🔢  | Loads a `value` into `[X]`, updating the `Z` and `N` flags.             |
| `LDY` | Load Y Register             | 🔢  | Loads a `value` into `[Y]`, updating the `Z` and `N` flags.             |
| `PHA` | Push Accumulator            | 🚫  | Pushes `[A]` onto the stack.                                            |
| `PHP` | Push Processor Status       | 🚫  | Pushes the flags (as a byte, with bit `4` set) onto the stack.          |
| `PLA` | Pull Accumulator            | 🚫  | Pulls a byte from the stack into `[A]`, updating the `Z` and `N` flags. |
| `PLP` | Pull Processor Status       | 🚫  | Pulls a byte from the stack into the flags register.                    |
| `SEC` | Set Carry Flag              | 🚫  | Sets `C` = `1`.                                                         |
| `SED` | Set Decimal Flag            | 🚫  | Sets `D` = `1`.                                                         |
| `SEI` | Set Interrupt Disable       | 🚫  | Sets `I` = `1`.                                                         |
| `STA` | Store Accumulator           | 🐏  | Stores the contents of `[A]` into an `address`.                         |
| `STX` | Store X Register            | 🐏  | Stores the contents of `[X]` into an `address`.                         |
| `STY` | Store Y Register            | 🐏  | Stores the contents of `[Y]` into an `address`.                         |
| `TAX` | Transfer Accumulator to X   | 🚫  | Copies `[A]` into `[X]`, updating the `Z` and `N` flags.                |
| `TAY` | Transfer Accumulator to Y   | 🚫  | Copies `[A]` into `[Y]`, updating the `Z` and `N` flags.                |
| `TSX` | Transfer Stack Pointer to X | 🚫  | Copies `[SP]` into `[X]`, updating the `Z` and `N` flags.               |
| `TXA` | Transfer X to Accumulator   | 🚫  | Copies `[X]` into `[A]`, updating the `Z` and `N` flags.                |
| `TXS` | Transfer X to Stack Pointer | 🚫  | Copies `[X]` into `[SP]`, **WITHOUT** updating any flag.                |
| `TYA` | Transfer Y to Accumulator   | 🚫  | Copies `[Y]` into `[A]`, updating the `Z` and `N` flags.                |

#### ✅ Checks

| Code  | Name                 | Arg | Description                                                                                                                                                                                                                                                           |
| ----- | -------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BIT` | Bit Test             | 🔢  | Tests if one or more bits are set in a `value`.<br><br>The `Z` flag is updated so it's set if the value ANDed with the `[A]` register is `0` (`Z` = `value` & `[A]` == `0`).<br><br>Bits `7` and `6` of the value are copied into the `N` and `V` flags respectively. |
| `CMP` | Compare              | 🔢  | Compares `[A]` with a `value`, setting the flags:<br><br>`Z` (if `[A]` == `value`), `N` (if bit `7` of (`[A]` - `value`) is set) and `C` (if `[A]` >= `value`).                                                                                                       |
| `CPX` | Compare X Register   | 🔢  | Compares `[X]` with a `value`, setting the flags:<br><br>`Z` (if `[X]` == `value`), `N` (if bit `7` of (`[X]` - `value`) is set) and `C` (if `[X]` >= `value`).                                                                                                       |
| `CPY` | Compare Y Register   | 🔢  | Compares `[Y]` with a `value`, setting the flags:<br><br>`Z` (if `[Y]` == `value`), `N` (if bit `7` of (`[Y]` - `value`) is set) and `C` (if `[Y]` >= `value`).                                                                                                       |
| `AND` | Logical AND          | 🔢  | Performs a "bit by bit" logical AND between `[A]` and a `value` (`[A]` & `value`), storing the result in `[A]` and updating the `Z` and `N` flags.                                                                                                                    |
| `EOR` | Exclusive OR         | 🔢  | Performs a "bit by bit" exclusive OR between `[A]` and a `value` (`[A]` ^ `value`), storing the result in `[A]` and updating the `Z` and `N` flags.                                                                                                                   |
| `ORA` | Logical Inclusive OR | 🔢  | Performs a "bit by bit" logical inclusive OR between `[A]` and a `value` (`[A]` \| `value`), storing the result in `[A]` and updating the `Z` and `N` flags.                                                                                                          |

#### 🔀 Branching

| Code  | Name                     | Arg | Description                                                                     |
| ----- | ------------------------ | --- | ------------------------------------------------------------------------------- |
| `BCC` | Branch if Carry Clear    | 🐏  | If the `C` flag is clear, jumps to an `address`.                                |
| `BCS` | Branch if Carry Set      | 🐏  | If the `C` flag is set, jumps to an `address`.                                  |
| `BEQ` | Branch if Equal          | 🐏  | If the `Z` flag is set, jumps to an `address`.                                  |
| `BMI` | Branch if Minus          | 🐏  | If the `N` flag is set, jumps to an `address`.                                  |
| `BNE` | Branch if Not Equal      | 🐏  | If the `Z` flag is clear, jumps to an `address`.                                |
| `BPL` | Branch if Positive       | 🐏  | If the `N` flag is clear, jumps to an `address`.                                |
| `BVC` | Branch if Overflow Clear | 🐏  | If the `V` flag is clear, jumps to an `address`.                                |
| `BVS` | Branch if Overflow Set   | 🐏  | If the `V` flag is set, jumps to an `address`.                                  |
| `JMP` | Jump                     | 🐏  | Jumps to an `address`.                                                          |
| `JSR` | Jump to Subroutine       | 🐏  | Pushes the current `[PC]` (minus one) onto the stack and jumps to an `address`. |
| `RTI` | Return from Interrupt    | 🚫  | Pulls the flags register from the stack, then pulls `[PC]` from the stack.      |
| `RTS` | Return from Subroutine   | 🚫  | Pulls `[PC]` (plus one) from the stack.                                         |

<br />

All **conditional** branching instructions must increment `cpu.extraCycles` if they branch.

#### 🧙‍♂️ System

| Code  | Name            | Arg | Description                                                                                                                                                                                |
| ----- | --------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BRK` | Force Interrupt | 🚫  | Forces the generation of an interrupt request.<br><br>The `[PC]` and flags (with bit `4` set) are pushed onto the stack, then the IRQ interrupt vector at `$FFFE/F` is loaded into `[PC]`. |
| `NOP` | No Operation    | 🚫  | Causes no changes at all.                                                                                                                                                                  |
