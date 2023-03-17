import byte from "/lib/byte";

const unsupported = () => { throw new Error("Unsupported.") };
function read(cpu, argument, hasPageCrossPenalty) {
  return cpu.memory.read(this.getAddress(cpu, argument, hasPageCrossPenalty));
}

const addressingModes = {
  IMPLICIT: {
    inputSize: 0,
    getAddress: () => null,
    getValue: unsupported
  },

  IMMEDIATE: {
    inputSize: 1,
    getAddress: unsupported,
    getValue: (cpu, value) => value
  },

  ABSOLUTE: {
    inputSize: 2,
    getAddress: (cpu, address) => address,
    getValue: read
  },

  ZERO_PAGE: {
    inputSize: 1,
    getAddress: (cpu, zeroPageAddress) => zeroPageAddress,
    getValue: read
  },

  RELATIVE: {
    inputSize: 1,
    getAddress: (cpu, offset, hasPageCrossPenalty) => {
      // TODO: IMPLEMENT
      return 0;
    },
    getValue: unsupported
  },

  INDIRECT: {
    inputSize: 2,
    getAddress: (cpu, absoluteAddress) => {
      // TODO: IMPLEMENT
      return 0;
    },
    getValue: unsupported
  },

  INDEXED_ZERO_PAGE_X: {
    inputSize: 1,
    getAddress: (cpu, zeroPageAddress) => {
      // TODO: IMPLEMENT
      return 0;
    },
    getValue: read
  },

  INDEXED_ZERO_PAGE_Y: {
    inputSize: 1,
    getAddress: (cpu, zeroPageAddress) => {
      // TODO: IMPLEMENT
      return 0;
    },
    getValue: read
  },

  INDEXED_ABSOLUTE_X: {
    inputSize: 2,
    getAddress: (cpu, absoluteAddress, hasPageCrossPenalty) => {
      // TODO: IMPLEMENT
      return 0;
    },
    getValue: read
  },

  INDEXED_ABSOLUTE_Y: {
    inputSize: 2,
    getAddress: (cpu, absoluteAddress, hasPageCrossPenalty) => {
      // TODO: IMPLEMENT
      return 0;
    },
    getValue: read
  },

  INDEXED_INDIRECT: {
    inputSize: 1,
    getAddress: (cpu, zeroPageAddress) => {
      // TODO: IMPLEMENT
      return 0;
    },
    getValue: read
  },

  INDIRECT_INDEXED: {
    inputSize: 1,
    getAddress: (cpu, zeroPageAddress, hasPageCrossPenalty) => {
      // TODO: IMPLEMENT
      return 0;
    },
    getValue: read
  },
};

for (let key in addressingModes) {
  addressingModes[key].id = key;
}

export default addressingModes;
