  LDX #08
@decrement:
  DEX            ; Decrements [X]
  INY            ; Increments [Y]
  CPX #3         ; Sets Z if [X] == 3
  BNE @decrement ; Jumps to @decrement if Z is clear
  STY $40BF      ; Writes [Y] to $40BF