import byte from "/lib/byte";

export default {
	INX: {
		argument: "no",
		run(cpu) {
			// Increments [X], updating the Z and N flags.
			cpu.x.increment();
			cpu.flags.updateZeroAndNegative(cpu.x.getValue());
		},
	},
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
	LDA: {
		argument: "value",
		run(cpu, val) {
			// Loads <val> into [A], updating the Z and N flags.
			cpu.a.setValue(val);
			cpu.flags.updateZeroAndNegative(val);
		},
	},
};
