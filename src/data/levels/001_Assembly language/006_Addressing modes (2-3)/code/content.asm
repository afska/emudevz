LDA #$CD

; Zero Page,X
LDX #$02
STA $60,X ; Writes [A] to $62
INX
STA $60,X ; Writes [A] to $63

; Zero Page,X (wrap)
LDX #$06
STA $FF,X ; Writes [A] to $05

; Absolute,X
LDX #$02
STA $4050,X ; Writes [A] to $4052