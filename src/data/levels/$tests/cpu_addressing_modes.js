const { evaluate, byte } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

// [!] Duplicated >>>
const newHeader = (prgPages = 1, chrPages = 1) => {
	// prettier-ignore
	return [0x4e, 0x45, 0x53, 0x1a, prgPages, chrPages, 0b00000000, 0b00000000, 0, 0, 0, 0, 0, 0, 0, 0];
};

const newRom = (prgBytes = []) => {
	const header = newHeader();
	const prg = prgBytes;
	const chr = [];
	for (let i = prgBytes.length; i < 16384; i++) prg.push(0);
	for (let i = 0; i < 8192; i++) chr.push(byte.random());
	const bytes = new Uint8Array([...header, ...prg, ...chr]);

	return bytes;
};

const newCPU = (prgBytes = null) => {
	const CPU = mainModule.default.CPU;
	const Cartridge = mainModule.default.Cartridge;

	const cartridge =
		prgBytes == null ? { prg: () => [] } : new Cartridge(newRom(prgBytes));

	return new CPU(cartridge);
};
// [!] Duplicated <<<

// 4.16 Addressing modes

it("`/code/index.js` exports an object containing the `addressingModes` object", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("addressingModes");
	expect(mainModule.default.addressingModes).to.be.an("object");
})({
	locales: {
		es:
			"`/code/index.js` exporta un objeto que contiene el objeto `addressingModes`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("every member of the `addressingModes` object has an `id`", () => {
	const instructions = mainModule.default.addressingModes;

	for (let key in instructions) {
		instructions[key].should.include.key("id");
		instructions[key].id.should.equal(key);
	}
})({
	locales: {
		es: "cada miembro del objeto `addressingModes` tiene un `id`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMPLICIT`: inputSize == 0", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("IMPLICIT");
	expect(addressingModes.IMPLICIT).to.be.an("object");
	addressingModes.IMPLICIT.inputSize.should.equal(0);
})({
	locales: {
		es: "`IMPLICIT`: inputSize == 0",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMPLICIT` / `getAddress`: unsupported", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	(() => addressingModes.IMPLICIT.getAddress(cpu, 0)).should.throw(
		"Unsupported."
	);
})({
	locales: {
		es: "`IMPLICIT` / `getAddress`: no soportado",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMPLICIT` / `getValue`: unsupported", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	(() => addressingModes.IMPLICIT.getValue(cpu, 0)).should.throw(
		"Unsupported."
	);
})({
	locales: {
		es: "`IMPLICIT` / `getValue`: no soportado",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMMEDIATE`: inputSize == 1", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("IMMEDIATE");
	expect(addressingModes.IMMEDIATE).to.be.an("object");
	addressingModes.IMMEDIATE.inputSize.should.equal(1);
})({
	locales: {
		es: "`IMMEDIATE`: inputSize == 1",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMMEDIATE` / `getAddress`: unsupported", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	(() => addressingModes.IMMEDIATE.getAddress(cpu, 0)).should.throw(
		"Unsupported."
	);
})({
	locales: {
		es: "`IMMEDIATE` / `getAddress`: no soportado",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMMEDIATE` / `getValue`: returns the same value", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	addressingModes.IMMEDIATE.getValue(cpu, 123).should.equal(123);
})({
	locales: {
		es: "`IMMEDIATE` / `getValue`: retorna el mismo valor",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ABSOLUTE`: inputSize == 2", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("ABSOLUTE");
	expect(addressingModes.ABSOLUTE).to.be.an("object");
	addressingModes.ABSOLUTE.inputSize.should.equal(2);
})({
	locales: {
		es: "`ABSOLUTE`: inputSize == 2",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ABSOLUTE` / `getAddress`: returns the same address", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	addressingModes.ABSOLUTE.getAddress(cpu, 0x1234).should.equal(0x1234);
})({
	locales: {
		es: "`ABSOLUTE` / `getAddress`: retorna la misma dirección",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ABSOLUTE` / `getValue`: reads from memory the address returned by `getAddress`", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(0x1234, 123);
	addressingModes.ABSOLUTE.getValue(cpu, 0x1234).should.equal(123);
})({
	locales: {
		es:
			"`ABSOLUTE` / `getValue`: lee de memoria la dirección retornada por `getAddress`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ZERO_PAGE`: inputSize == 1", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("ZERO_PAGE");
	expect(addressingModes.ZERO_PAGE).to.be.an("object");
	addressingModes.ZERO_PAGE.inputSize.should.equal(1);
})({
	locales: {
		es: "`ZERO_PAGE`: inputSize == 1",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ZERO_PAGE` / `getAddress`: returns the same address", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	addressingModes.ZERO_PAGE.getAddress(cpu, 120).should.equal(120);
})({
	locales: {
		es: "`ZERO_PAGE` / `getAddress`: retorna la misma dirección",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ZERO_PAGE` / `getValue`: reads from memory the address returned by `getAddress`", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(120, 221);
	addressingModes.ABSOLUTE.getValue(cpu, 120).should.equal(221);
})({
	locales: {
		es:
			"`ZERO_PAGE` / `getValue`: lee de memoria la dirección retornada por `getAddress`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`RELATIVE`: inputSize == 1", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("RELATIVE");
	expect(addressingModes.RELATIVE).to.be.an("object");
	addressingModes.RELATIVE.inputSize.should.equal(1);
})({
	locales: {
		es: "`RELATIVE`: inputSize == 1",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`RELATIVE` / `getAddress`: returns an address based on [PC] + offset", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.pc.setValue(0xfe10);
	addressingModes.RELATIVE.getAddress(cpu, 4).should.equal(0xfe14);
	addressingModes.RELATIVE.getAddress(cpu, byte.toU8(-10)).should.equal(0xfe06);
})({
	locales: {
		es:
			"`RELATIVE` / `getAddress`: retorna una dirección basada en [PC] + desplazamiento",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`RELATIVE` / `getValue`: unsupported", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	(() => addressingModes.RELATIVE.getValue(cpu, 0)).should.throw(
		"Unsupported."
	);
})({
	locales: {
		es: "`RELATIVE` / `getValue`: no soportado",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`RELATIVE`: adds 2 cycles if it crosses page", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();
	cpu.pc.setValue(0xfafe);

	cpu.extraCycles = 0;
	addressingModes.RELATIVE.getAddress(cpu, 20, true);
	cpu.extraCycles.should.equal(2);

	cpu.extraCycles = 0;
	addressingModes.RELATIVE.getAddress(cpu, 20, false);
	cpu.extraCycles.should.equal(0);
})({
	locales: {
		es: "`RELATIVE`: agrega 2 ciclos si cruza de página",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`RELATIVE`: doesn't add any cycles if there's no page-cross", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.pc.setValue(0xfe10);
	addressingModes.RELATIVE.getAddress(cpu, 4);
	cpu.extraCycles.should.equal(0);
})({
	locales: {
		es: "`RELATIVE`: no agrega ningún ciclo si no cruza de página",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT`: inputSize == 2", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("INDIRECT");
	expect(addressingModes.INDIRECT).to.be.an("object");
	addressingModes.INDIRECT.inputSize.should.equal(2);
})({
	locales: {
		es: "`INDIRECT`: inputSize == 2",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT` / `getAddress`: grabs the address from memory", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(130, 0x12);
	cpu.memory.write(131, 0xfe);
	addressingModes.INDIRECT.getAddress(cpu, 130).should.equal(0xfe12);
})({
	locales: {
		es: "`INDIRECT` / `getAddress`: toma la dirección desde la memoria",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT` / `getValue`: unsupported", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	(() => addressingModes.INDIRECT.getValue(cpu, 0)).should.throw(
		"Unsupported."
	);
})({
	locales: {
		es: "`INDIRECT` / `getValue`: no soportado",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT`: emulates the 'page boundary bug'", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(0x04ff, 0x12);
	cpu.memory.write(0x0400, 0xcd);
	addressingModes.INDIRECT.getAddress(cpu, 0x04ff).should.equal(0xcd12);
})({
	locales: {
		es: "`INDIRECT`: emula el 'page boundary bug'",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

["x", "y"].forEach((register) => {
	const name = register.toUpperCase();

	it("`INDEXED_ZERO_PAGE_" + name + "`: inputSize == 1", () => {
		const addressingModes = mainModule.default.addressingModes;
		addressingModes.should.include.key(`INDEXED_ZERO_PAGE_${name}`);
		expect(addressingModes[`INDEXED_ZERO_PAGE_${name}`]).to.be.an("object");
		addressingModes[`INDEXED_ZERO_PAGE_${name}`].inputSize.should.equal(1);
	})({
		locales: {
			es: "`INDEXED_ZERO_PAGE_" + name + "`: inputSize == 1",
		},
		use: ({ id }, book) => id >= book.getId("4.16"),
	});

	it(
		"`INDEXED_ZERO_PAGE_" +
			name +
			"` / `getAddress`: " +
			`returns the address + [${name}]`,
		() => {
			const addressingModes = mainModule.default.addressingModes;
			const cpu = newCPU();

			cpu[register].setValue(20);
			addressingModes[`INDEXED_ZERO_PAGE_${name}`]
				.getAddress(cpu, 130)
				.should.equal(150);
		}
	)({
		locales: {
			es:
				"`INDEXED_ZERO_PAGE_`" +
				name +
				" / `getAddress`: " +
				`retorna la dirección + [${name}]`,
		},
		use: ({ id }, book) => id >= book.getId("4.16"),
	});

	it(
		"`INDEXED_ZERO_PAGE_" +
			name +
			"` / `getValue`: reads from memory the address returned by `getAddress`",
		() => {
			const addressingModes = mainModule.default.addressingModes;
			const cpu = newCPU();

			cpu.memory.write(150, 123);
			cpu[register].setValue(20);
			addressingModes[`INDEXED_ZERO_PAGE_${name}`]
				.getValue(cpu, 130)
				.should.equal(123);
		}
	)({
		locales: {
			es:
				"`INDEXED_ZERO_PAGE_`" +
				name +
				" / `getValue`: lee de memoria la dirección retornada por `getAddress`",
		},
		use: ({ id }, book) => id >= book.getId("4.16"),
	});

	it("`INDEXED_ZERO_PAGE_" + name + "`: cannot cross the first page", () => {
		const addressingModes = mainModule.default.addressingModes;
		const cpu = newCPU();

		cpu[register].setValue(200);
		addressingModes[`INDEXED_ZERO_PAGE_${name}`]
			.getAddress(cpu, 130)
			.should.equal(74);
	})({
		locales: {
			es: "`INDEXED_ZERO_PAGE_`" + name + ": no puede cruzar la primer página",
		},
		use: ({ id }, book) => id >= book.getId("4.16"),
	});
});

["x", "y"].forEach((register) => {
	const name = register.toUpperCase();

	it("`INDEXED_ABSOLUTE_" + name + "`: inputSize == 2", () => {
		const addressingModes = mainModule.default.addressingModes;
		addressingModes.should.include.key(`INDEXED_ABSOLUTE_${name}`);
		expect(addressingModes[`INDEXED_ABSOLUTE_${name}`]).to.be.an("object");
		addressingModes[`INDEXED_ABSOLUTE_${name}`].inputSize.should.equal(2);
	})({
		locales: {
			es: "`INDEXED_ABSOLUTE_" + name + "`: inputSize == 2",
		},
		use: ({ id }, book) => id >= book.getId("4.16"),
	});

	it(
		"`INDEXED_ABSOLUTE_" +
			name +
			"` / `getAddress`: " +
			`returns the address + [${name}]`,
		() => {
			const addressingModes = mainModule.default.addressingModes;
			const cpu = newCPU();

			cpu[register].setValue(180);
			addressingModes[`INDEXED_ABSOLUTE_${name}`]
				.getAddress(cpu, 1000)
				.should.equal(1180);
		}
	)({
		locales: {
			es:
				"`INDEXED_ABSOLUTE_`" +
				name +
				" / `getAddress`: " +
				`retorna la dirección + [${name}]`,
		},
		use: ({ id }, book) => id >= book.getId("4.16"),
	});

	it(
		"`INDEXED_ABSOLUTE_" +
			name +
			"` / `getValue`: reads from memory the address returned by `getAddress`",
		() => {
			const addressingModes = mainModule.default.addressingModes;
			const cpu = newCPU();

			cpu.memory.write(1180, 123);
			cpu[register].setValue(180);
			addressingModes[`INDEXED_ABSOLUTE_${name}`]
				.getValue(cpu, 1000)
				.should.equal(123);
		}
	)({
		locales: {
			es:
				"`INDEXED_ABSOLUTE_`" +
				name +
				" / `getValue`: lee de memoria la dirección retornada por `getAddress`",
		},
		use: ({ id }, book) => id >= book.getId("4.16"),
	});

	it("`INDEXED_ABSOLUTE_" + name + "`: cannot cross $FFFF", () => {
		const addressingModes = mainModule.default.addressingModes;
		const cpu = newCPU();

		cpu[register].setValue(2);
		addressingModes[`INDEXED_ABSOLUTE_${name}`]
			.getAddress(cpu, 0xffff)
			.should.equal(0x0001);
	})({
		locales: {
			es: "`INDEXED_ABSOLUTE_`" + name + ": no puede cruzar $FFFF",
		},
		use: ({ id }, book) => id >= book.getId("4.16"),
	});

	it("`INDEXED_ABSOLUTE_" + name + "`: adds 1 cycle if it crosses page", () => {
		const addressingModes = mainModule.default.addressingModes;
		const cpu = newCPU();
		cpu[register].setValue(180);

		cpu.extraCycles = 0;
		addressingModes[`INDEXED_ABSOLUTE_${name}`].getAddress(cpu, 1000, true);
		cpu.extraCycles.should.equal(1);

		cpu.extraCycles = 0;
		addressingModes.RELATIVE.getAddress(cpu, 1000, false);
		cpu.extraCycles.should.equal(0);
	})({
		locales: {
			es: "`INDEXED_ABSOLUTE_`" + name + ": agrega 1 ciclo si cruza de página",
		},
		use: ({ id }, book) => id >= book.getId("4.16"),
	});

	it(
		"`INDEXED_ABSOLUTE_" +
			name +
			"`: doesn't add any cycles if there's no page-cross",
		() => {
			const addressingModes = mainModule.default.addressingModes;
			const cpu = newCPU();

			cpu[register].setValue(20);
			addressingModes[`INDEXED_ABSOLUTE_${name}`].getAddress(cpu, 900, true);
			cpu.extraCycles.should.equal(0);
		}
	)({
		locales: {
			es:
				"`INDEXED_ABSOLUTE_`" +
				name +
				": no agrega ningún ciclo si no cruza de página",
		},
		use: ({ id }, book) => id >= book.getId("4.16"),
	});
});

it("`INDEXED_INDIRECT`: inputSize == 1", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("INDEXED_INDIRECT");
	expect(addressingModes.INDEXED_INDIRECT).to.be.an("object");
	addressingModes.INDEXED_INDIRECT.inputSize.should.equal(1);
})({
	locales: {
		es: "`INDEXED_INDIRECT`: inputSize == 1",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDEXED_INDIRECT` / `getAddress`: grabs the (address + [X]) from memory", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.x.setValue(180);
	cpu.memory.write(195, 0x12);
	cpu.memory.write(196, 0xfe);
	addressingModes.INDEXED_INDIRECT.getAddress(cpu, 15).should.equal(0xfe12);
})({
	locales: {
		es:
			"`INDEXED_INDIRECT` / `getAddress`: toma la (dirección + [X]) desde la memoria",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDEXED_INDIRECT` / `getValue`: reads from memory the address returned by `getAddress`", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(0x0412, 123);
	cpu.x.setValue(180);
	cpu.memory.write(195, 0x12);
	cpu.memory.write(196, 0x04);
	addressingModes.INDEXED_INDIRECT.getValue(cpu, 15).should.equal(123);
})({
	locales: {
		es:
			"`INDEXED_INDIRECT` / `getValue`: lee de memoria la dirección retornada por `getAddress`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDEXED_INDIRECT`: cannot cross the first page", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.x.setValue(255);
	cpu.memory.write(0, 0x12);
	cpu.memory.write(1, 0xfe);
	addressingModes.INDEXED_INDIRECT.getAddress(cpu, 1).should.equal(0xfe12);
})({
	locales: {
		es: "`INDEXED_INDIRECT`: no puede cruzar la primer página",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDEXED_INDIRECT`: the 16-bit read wraps within the first page", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.x.setValue(254);
	cpu.memory.write(255, 0x12);
	cpu.memory.write(0, 0xfe);
	addressingModes.INDEXED_INDIRECT.getAddress(cpu, 1).should.equal(0xfe12);
})({
	locales: {
		es:
			"`INDEXED_INDIRECT`: la lectura de 16 bits se envuelve dentro de la primer página",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT_INDEXED`: inputSize == 1", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("INDIRECT_INDEXED");
	expect(addressingModes.INDIRECT_INDEXED).to.be.an("object");
	addressingModes.INDIRECT_INDEXED.inputSize.should.equal(1);
})({
	locales: {
		es: "`INDIRECT_INDEXED`: inputSize == 1",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT_INDEXED` / `getAddress`: grabs the address from memory, then adds [Y]", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.y.setValue(0xb4);
	cpu.memory.write(130, 0x12);
	cpu.memory.write(131, 0xfe);
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130).should.equal(0xfec6);
})({
	locales: {
		es:
			"`INDIRECT_INDEXED` / `getAddress`: toma la dirección desde la memoria, luego suma [Y]",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT_INDEXED` / `getValue`: reads from memory the address returned by `getAddress`", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(0x04c6, 123);
	cpu.y.setValue(0xb4);
	cpu.memory.write(130, 0x12);
	cpu.memory.write(131, 0x04);
	addressingModes.INDIRECT_INDEXED.getValue(cpu, 130).should.equal(123);
})({
	locales: {
		es:
			"`INDIRECT_INDEXED` / `getValue`: lee de memoria la dirección retornada por `getAddress`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT_INDEXED`: cannot cross $FFFF", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.y.setValue(3);
	cpu.memory.write(130, 0xff);
	cpu.memory.write(131, 0xff);
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130).should.equal(2);
})({
	locales: {
		es: "`INDIRECT_INDEXED`: no puede cruzar $FFFF",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT_INDEXED`: the 16-bit read wraps within the first page", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.y.setValue(3);
	cpu.memory.write(255, 0x12);
	cpu.memory.write(0, 0xfe);
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 255).should.equal(0xfe15);
})({
	locales: {
		es:
			"`INDIRECT_INDEXED`: la lectura de 16 bits se envuelve dentro de la primer página",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT_INDEXED`: adds 1 cycle if it crosses page", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();
	cpu.y.setValue(0xfc);
	cpu.memory.write(130, 0x12);
	cpu.memory.write(131, 0xfa);

	cpu.extraCycles = 0;
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130, true);
	cpu.extraCycles.should.equal(1);

	cpu.extraCycles = 0;
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130, false);
	cpu.extraCycles.should.equal(0);
})({
	locales: {
		es: "`INDIRECT_INDEXED`: agrega 1 ciclo si cruza de página",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT_INDEXED`: doesn't add any cycles if there's no page-cross", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.y.setValue(0xb4);
	cpu.memory.write(130, 0x12);
	cpu.memory.write(131, 0xfe);
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130);
	cpu.extraCycles.should.equal(0);
})({
	locales: {
		es: "`INDIRECT_INDEXED`: no agrega ningún ciclo si no cruza de página",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});
