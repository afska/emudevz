import byte from "/lib/byte";

const unsupported = () => { throw new Error("Unsupported.") };
function read(cpu, argument, takesExtraCyclesOnPageCross) {
  return cpu.memory.read(this.getAddress(cpu, argument, takesExtraCyclesOnPageCross));
}

const addressingModes = {
  IMPLICIT: {
    inputSize: 0,
    getAddress: unsupported,
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
    getAddress: (cpu, offset, takesExtraCyclesOnPageCross) => {
      // TODO: IMPLEMENT
    },
    getValue: unsupported
  },

  INDIRECT: {
    inputSize: 1,
    getAddress: (cpu, indirectAddress) => {
      // TODO: IMPLEMENT
    },
    getValue: unsupported
  },
};

for (let key in addressingModes) {
  addressingModes[key].id = key;
}

export default addressingModes;
