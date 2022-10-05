  INX         ; Implicit
  LDA #$08    ; Immediate
  LDA $C002   ; Absolute
  LDA $15     ; Zero page
  BNE @label  ; Relative
  INY
  INY

@label:
  LDA #$21
  STA $4080
  LDA #$40
  STA $4081
  JMP ($4080) ; Indirect
  ;   ^ dereferences to $4021