import byte from "/lib/byte";

export default {
  // Increment X Register
  INX: {
    argument: "no",
    run(cpu) {
      // Increments [X], updating the Z and N flags.
      cpu.x.increment();
      cpu.flags.updateZeroAndNegative(cpu.x.getValue());
    },
  },

  // Increment Memory
  INC: {
    argument: "address",
    run(cpu, addr) {
      // Adds one to the value held at <addr>, updating the Z and N flags.
      const value = cpu.memory.read(addr);
      const newValue = byte.toU8(value + 1);
      cpu.memory.write(addr, newValue);
      cpu.flags.updateZeroAndNegative(newValue);
    },
  },

  // Add with Carry
  ADC: {
    argument: "value",
    run(cpu, val) {
      // Adds the contents of <val> to [A] together with the Carry Flag
      // ([A] = [A] + <val> + C), updating the Z and N flags.
      const oldValue = cpu.a.getValue();
      const result = oldValue + val + cpu.flags.c;
      const newValue = byte.toU8(result);
      cpu.a.setValue(newValue);
      cpu.flags.updateZeroAndNegative(newValue);

      // C and V flags are set in case of unsigned and signed overflow respectively.
      // Unsigned overflow occurs when the result is >= `256` (use `byte.overflows(...)`)
      // Signed overflow occurs when `Positive + Positive = Negative` or `Negative + Negative = Positive`
      cpu.flags.c = byte.overflows(result);
      cpu.flags.v =
        (byte.isPositive(oldValue) &&
          byte.isPositive(val) &&
          byte.isNegative(newValue)) ||
        (byte.isNegative(oldValue) &&
          byte.isNegative(val) &&
          byte.isPositive(newValue));
    },
  },
};
