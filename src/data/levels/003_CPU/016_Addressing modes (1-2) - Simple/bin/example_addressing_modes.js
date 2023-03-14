import byte from "/lib/byte";

// TODO: COPY

const unsupported = () => { throw new Error("Unsupported.") };
function read(cpu, argument, operation) {
  return cpu.memory.read(this.getAddress(cpu, argument, operation));
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
    getAddress: (cpu, address) => address,
    getValue: read
  },

  RELATIVE: {
    inputSize: 1,
    getAddress: (cpu, address, operation) => {
      const address = cpu.pc.getValue();
      const newAddress = address + byte.toS8(address);
      const pageCrossed =
        byte.highByteOf(address) !== byte.highByteOf(newAddress);

      if (pageCrossed && operation.takesExtraCyclesOnPageCross) cpu.extraCycles += 2;

      return byte.toU16(newAddress);
    },
    getValue: unsupported
  },

  INDIRECT: {
    inputSize: 1,
    getAddress: (cpu, address, operation) => {
      const msb = byte.highPartOf(address);
      const lsb = byte.lowPartOf(address);
      const low = cpu.memory.read(address);
      const high = cpu.memory.read(
        lsb === 0xff ? byte.toU16(msb, 0x00) : address + 1
      );

      return byte.buildU16(high, low);
    },
    getValue: unsupported
  },
};

for (let key in addressingModes) {
  addressingModes[key].id = key;
}

export default addressingModes;
