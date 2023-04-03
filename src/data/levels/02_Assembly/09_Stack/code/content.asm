; X = Position
; A = Number
  LDA #1
@save:
  PHA          ; Pushes [A] onto the Stack
  STA $4080,X  ; = STA $4080+X (puts the number in memory)
  INX          ; (position++)
  ADC #2       ; (number += 2)
  CPX #8       ; (loops until [X] is #8)
  BNE @save
@load:
  PLA          ; Pulls from the Stack to [A]
  STA $4080,X  ; = STA $4080+X (puts the number in memory)
  INX          ; (position++)
  CPX #16      ; (loops until [X] is #16)
  BNE @load