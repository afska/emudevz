LDA #$01
STA $4070
LDA #$05
STA $4071
LDA #$08
STA $4072

;  LDX #$08
;decrement:
;  DEX
;  STX $0200
;  CPX #$03
;  BNE decrement
;  STX $0201
;  BRK