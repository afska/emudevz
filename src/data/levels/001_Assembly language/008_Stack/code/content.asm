; X = Position
; Y = Number
LDY #1
@firstLoop:
  TYA          ; Transfers [Y] to [A]
  PHA          ; Pushes [A] to the Stack
  STA $4080,X  ; = STA $4080+X
  INX
  INY
  CPX #8       ; (loops until [X] is #8)
  BNE @firstLoop
@secondLoop:
  PLA          ; Pulls from the Stack to [A]
  STA $4080,X
  INX
  CPX #16      ; (loops until [X] is #16)
  BNE @secondLoop