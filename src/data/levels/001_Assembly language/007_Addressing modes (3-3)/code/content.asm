; Indexed indirect:
LDY #$80
STY $03
LDY #$40
STY $04

LDA #$FA
LDX #$02
STA ($01,X) ; = STA ($01+X) = STA ($0003) = STA $4080
;   ^ dereferences to $4080

; Indirect indexed:
LDY #$5
LDA ($03),Y ; = LDA ($03)+Y = LDA $4080+Y = LDA $4085
;   ^ dereferences to $4085