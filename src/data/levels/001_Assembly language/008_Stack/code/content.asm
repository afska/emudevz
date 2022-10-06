; X = Position
; Y = Number
LDY #1
@firstLoop:
  TYA
  STA $4080,X
  PHA
  INX
  INY
  CPX #8       ; loop until X is #8
  BNE @firstLoop
@secondLoop:
  PLA
  STA $4080,X
  INX
  CPX #16      ; loop until X is #16
  BNE @secondLoop