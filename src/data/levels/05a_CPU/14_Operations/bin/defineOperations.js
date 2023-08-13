/** Returns an array of operations, sorted by opcode. */
export default (instructions, addressingModes) => {
  const operations = [
    {
      id: 0x69,
      instruction: instructions.ADC,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE
    },
    {
      id: 0x65,
      instruction: instructions.ADC,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x75,
      instruction: instructions.ADC,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0x6d,
      instruction: instructions.ADC,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x7d,
      instruction: instructions.ADC,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X,
      hasPageCrossPenalty: true
    },
    {
      id: 0x79,
      instruction: instructions.ADC,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_Y,
      hasPageCrossPenalty: true
    },
    {
      id: 0x61,
      instruction: instructions.ADC,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_INDIRECT
    },
    {
      id: 0x71,
      instruction: instructions.ADC,
      cycles: 5,
      addressingMode: addressingModes.INDIRECT_INDEXED,
      hasPageCrossPenalty: true
    },
    {
      id: 0x0a,
      instruction: instructions.ASLa,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x06,
      instruction: instructions.ASL,
      cycles: 5,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x16,
      instruction: instructions.ASL,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0x0e,
      instruction: instructions.ASL,
      cycles: 6,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x1e,
      instruction: instructions.ASL,
      cycles: 7,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X
    },
    {
      id: 0xc6,
      instruction: instructions.DEC,
      cycles: 5,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0xd6,
      instruction: instructions.DEC,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0xce,
      instruction: instructions.DEC,
      cycles: 6,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0xde,
      instruction: instructions.DEC,
      cycles: 7,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X
    },
    {
      id: 0xca,
      instruction: instructions.DEX,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x88,
      instruction: instructions.DEY,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0xe6,
      instruction: instructions.INC,
      cycles: 5,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0xf6,
      instruction: instructions.INC,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0xee,
      instruction: instructions.INC,
      cycles: 6,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0xfe,
      instruction: instructions.INC,
      cycles: 7,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X
    },
    {
      id: 0xe8,
      instruction: instructions.INX,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0xc8,
      instruction: instructions.INY,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x4a,
      instruction: instructions.LSRa,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x46,
      instruction: instructions.LSR,
      cycles: 5,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x56,
      instruction: instructions.LSR,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0x4e,
      instruction: instructions.LSR,
      cycles: 6,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x5e,
      instruction: instructions.LSR,
      cycles: 7,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X
    },
    {
      id: 0x2a,
      instruction: instructions.ROLa,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x26,
      instruction: instructions.ROL,
      cycles: 5,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x36,
      instruction: instructions.ROL,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0x2e,
      instruction: instructions.ROL,
      cycles: 6,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x3e,
      instruction: instructions.ROL,
      cycles: 7,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X
    },
    {
      id: 0x6a,
      instruction: instructions.RORa,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x66,
      instruction: instructions.ROR,
      cycles: 5,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x76,
      instruction: instructions.ROR,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0x6e,
      instruction: instructions.ROR,
      cycles: 6,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x7e,
      instruction: instructions.ROR,
      cycles: 7,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X
    },
    {
      id: 0xe9,
      instruction: instructions.SBC,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE
    },
    {
      id: 0xe5,
      instruction: instructions.SBC,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0xf5,
      instruction: instructions.SBC,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0xed,
      instruction: instructions.SBC,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0xfd,
      instruction: instructions.SBC,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X,
      hasPageCrossPenalty: true
    },
    {
      id: 0xf9,
      instruction: instructions.SBC,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_Y,
      hasPageCrossPenalty: true
    },
    {
      id: 0xe1,
      instruction: instructions.SBC,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_INDIRECT
    },
    {
      id: 0xf1,
      instruction: instructions.SBC,
      cycles: 5,
      addressingMode: addressingModes.INDIRECT_INDEXED,
      hasPageCrossPenalty: true
    },
    {
      id: 0x18,
      instruction: instructions.CLC,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0xd8,
      instruction: instructions.CLD,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x58,
      instruction: instructions.CLI,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0xb8,
      instruction: instructions.CLV,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0xa9,
      instruction: instructions.LDA,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE
    },
    {
      id: 0xa5,
      instruction: instructions.LDA,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0xb5,
      instruction: instructions.LDA,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0xad,
      instruction: instructions.LDA,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0xbd,
      instruction: instructions.LDA,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X,
      hasPageCrossPenalty: true
    },
    {
      id: 0xb9,
      instruction: instructions.LDA,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_Y,
      hasPageCrossPenalty: true
    },
    {
      id: 0xa1,
      instruction: instructions.LDA,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_INDIRECT
    },
    {
      id: 0xb1,
      instruction: instructions.LDA,
      cycles: 5,
      addressingMode: addressingModes.INDIRECT_INDEXED,
      hasPageCrossPenalty: true
    },
    {
      id: 0xa2,
      instruction: instructions.LDX,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE
    },
    {
      id: 0xa6,
      instruction: instructions.LDX,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0xb6,
      instruction: instructions.LDX,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_Y
    },
    {
      id: 0xae,
      instruction: instructions.LDX,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0xbe,
      instruction: instructions.LDX,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_Y,
      hasPageCrossPenalty: true
    },
    {
      id: 0xa0,
      instruction: instructions.LDY,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE
    },
    {
      id: 0xa4,
      instruction: instructions.LDY,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0xb4,
      instruction: instructions.LDY,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0xac,
      instruction: instructions.LDY,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0xbc,
      instruction: instructions.LDY,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X,
      hasPageCrossPenalty: true
    },
    {
      id: 0x48,
      instruction: instructions.PHA,
      cycles: 3,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x08,
      instruction: instructions.PHP,
      cycles: 3,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x68,
      instruction: instructions.PLA,
      cycles: 4,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x28,
      instruction: instructions.PLP,
      cycles: 4,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x38,
      instruction: instructions.SEC,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0xf8,
      instruction: instructions.SED,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x78,
      instruction: instructions.SEI,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x85,
      instruction: instructions.STA,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x95,
      instruction: instructions.STA,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0x8d,
      instruction: instructions.STA,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x9d,
      instruction: instructions.STA,
      cycles: 5,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X
    },
    {
      id: 0x99,
      instruction: instructions.STA,
      cycles: 5,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_Y
    },
    {
      id: 0x81,
      instruction: instructions.STA,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_INDIRECT
    },
    {
      id: 0x91,
      instruction: instructions.STA,
      cycles: 6,
      addressingMode: addressingModes.INDIRECT_INDEXED
    },
    {
      id: 0x86,
      instruction: instructions.STX,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x96,
      instruction: instructions.STX,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_Y
    },
    {
      id: 0x8e,
      instruction: instructions.STX,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x84,
      instruction: instructions.STY,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x94,
      instruction: instructions.STY,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0x8c,
      instruction: instructions.STY,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0xaa,
      instruction: instructions.TAX,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0xa8,
      instruction: instructions.TAY,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0xba,
      instruction: instructions.TSX,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x8a,
      instruction: instructions.TXA,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x9a,
      instruction: instructions.TXS,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x98,
      instruction: instructions.TYA,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x24,
      instruction: instructions.BIT,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x2c,
      instruction: instructions.BIT,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0xc9,
      instruction: instructions.CMP,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE
    },
    {
      id: 0xc5,
      instruction: instructions.CMP,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0xd5,
      instruction: instructions.CMP,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0xcd,
      instruction: instructions.CMP,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0xdd,
      instruction: instructions.CMP,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X,
      hasPageCrossPenalty: true
    },
    {
      id: 0xd9,
      instruction: instructions.CMP,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_Y,
      hasPageCrossPenalty: true
    },
    {
      id: 0xc1,
      instruction: instructions.CMP,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_INDIRECT
    },
    {
      id: 0xd1,
      instruction: instructions.CMP,
      cycles: 5,
      addressingMode: addressingModes.INDIRECT_INDEXED,
      hasPageCrossPenalty: true
    },
    {
      id: 0xe0,
      instruction: instructions.CPX,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE
    },
    {
      id: 0xe4,
      instruction: instructions.CPX,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0xec,
      instruction: instructions.CPX,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0xc0,
      instruction: instructions.CPY,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE
    },
    {
      id: 0xc4,
      instruction: instructions.CPY,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0xcc,
      instruction: instructions.CPY,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x29,
      instruction: instructions.AND,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE
    },
    {
      id: 0x25,
      instruction: instructions.AND,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x35,
      instruction: instructions.AND,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0x2d,
      instruction: instructions.AND,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x3d,
      instruction: instructions.AND,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X,
      hasPageCrossPenalty: true
    },
    {
      id: 0x39,
      instruction: instructions.AND,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_Y,
      hasPageCrossPenalty: true
    },
    {
      id: 0x21,
      instruction: instructions.AND,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_INDIRECT
    },
    {
      id: 0x31,
      instruction: instructions.AND,
      cycles: 5,
      addressingMode: addressingModes.INDIRECT_INDEXED,
      hasPageCrossPenalty: true
    },
    {
      id: 0x49,
      instruction: instructions.EOR,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE
    },
    {
      id: 0x45,
      instruction: instructions.EOR,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x55,
      instruction: instructions.EOR,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0x4d,
      instruction: instructions.EOR,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x5d,
      instruction: instructions.EOR,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X,
      hasPageCrossPenalty: true
    },
    {
      id: 0x59,
      instruction: instructions.EOR,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_Y,
      hasPageCrossPenalty: true
    },
    {
      id: 0x41,
      instruction: instructions.EOR,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_INDIRECT
    },
    {
      id: 0x51,
      instruction: instructions.EOR,
      cycles: 5,
      addressingMode: addressingModes.INDIRECT_INDEXED,
      hasPageCrossPenalty: true
    },
    {
      id: 0x09,
      instruction: instructions.ORA,
      cycles: 2,
      addressingMode: addressingModes.IMMEDIATE
    },
    {
      id: 0x05,
      instruction: instructions.ORA,
      cycles: 3,
      addressingMode: addressingModes.ZERO_PAGE
    },
    {
      id: 0x15,
      instruction: instructions.ORA,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ZERO_PAGE_X
    },
    {
      id: 0x0d,
      instruction: instructions.ORA,
      cycles: 4,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x1d,
      instruction: instructions.ORA,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_X,
      hasPageCrossPenalty: true
    },
    {
      id: 0x19,
      instruction: instructions.ORA,
      cycles: 4,
      addressingMode: addressingModes.INDEXED_ABSOLUTE_Y,
      hasPageCrossPenalty: true
    },
    {
      id: 0x01,
      instruction: instructions.ORA,
      cycles: 6,
      addressingMode: addressingModes.INDEXED_INDIRECT
    },
    {
      id: 0x11,
      instruction: instructions.ORA,
      cycles: 5,
      addressingMode: addressingModes.INDIRECT_INDEXED,
      hasPageCrossPenalty: true
    },
    {
      id: 0x90,
      instruction: instructions.BCC,
      cycles: 2,
      addressingMode: addressingModes.RELATIVE,
      hasPageCrossPenalty: true
    },
    {
      id: 0xb0,
      instruction: instructions.BCS,
      cycles: 2,
      addressingMode: addressingModes.RELATIVE,
      hasPageCrossPenalty: true
    },
    {
      id: 0xf0,
      instruction: instructions.BEQ,
      cycles: 2,
      addressingMode: addressingModes.RELATIVE,
      hasPageCrossPenalty: true
    },
    {
      id: 0x30,
      instruction: instructions.BMI,
      cycles: 2,
      addressingMode: addressingModes.RELATIVE,
      hasPageCrossPenalty: true
    },
    {
      id: 0xd0,
      instruction: instructions.BNE,
      cycles: 2,
      addressingMode: addressingModes.RELATIVE,
      hasPageCrossPenalty: true
    },
    {
      id: 0x10,
      instruction: instructions.BPL,
      cycles: 2,
      addressingMode: addressingModes.RELATIVE,
      hasPageCrossPenalty: true
    },
    {
      id: 0x50,
      instruction: instructions.BVC,
      cycles: 2,
      addressingMode: addressingModes.RELATIVE,
      hasPageCrossPenalty: true
    },
    {
      id: 0x70,
      instruction: instructions.BVS,
      cycles: 2,
      addressingMode: addressingModes.RELATIVE,
      hasPageCrossPenalty: true
    },
    {
      id: 0x4c,
      instruction: instructions.JMP,
      cycles: 3,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x6c,
      instruction: instructions.JMP,
      cycles: 5,
      addressingMode: addressingModes.INDIRECT
    },
    {
      id: 0x20,
      instruction: instructions.JSR,
      cycles: 6,
      addressingMode: addressingModes.ABSOLUTE
    },
    {
      id: 0x40,
      instruction: instructions.RTI,
      cycles: 6,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x60,
      instruction: instructions.RTS,
      cycles: 6,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0x00,
      instruction: instructions.BRK,
      cycles: 0,
      addressingMode: addressingModes.IMPLICIT
    },
    {
      id: 0xea,
      instruction: instructions.NOP,
      cycles: 2,
      addressingMode: addressingModes.IMPLICIT
    }
  ];

  const sortedOperations = [];
  for (let i = 0; i < 256; i++)
    sortedOperations.push(operations.find((it) => it.id === i) || null);
  return sortedOperations;
};
