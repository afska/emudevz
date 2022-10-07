  JSR $4029 ; @init
  JSR $402C ; @loop
  JSR $4032 ; @end

@init:
  LDX #$03
  RTS

@loop:
  INX
  CPX #$05
  BNE @loop
  RTS

@end:
  BRK