const { evaluate, byte } = $;

let mainModule;
let NROM = null;
beforeEach(async () => {
	mainModule = await evaluate();
	try {
		NROM = (await evaluate("/lib/NROM.js")).default;
	} catch {}
});

// [!] Duplicated >>>
const newHeader = (prgPages = 1, chrPages = 1, flags6 = 0, flags7 = 0) => {
	// prettier-ignore
	return [0x4e, 0x45, 0x53, 0x1a, prgPages, chrPages, flags6, flags7, 0, 0, 0, 0, 0, 0, 0, 0];
};

const newRom = (prgBytes = [], header = newHeader()) => {
	const prg = prgBytes;
	const chr = [];
	for (let i = prgBytes.length; i < 16384; i++) prg.push(0);
	for (let i = 0; i < 8192; i++) chr.push(byte.random());
	const bytes = new Uint8Array([...header, ...prg, ...chr]);

	return bytes;
};

const newCPU = (prgBytes = []) => {
	const CPU = mainModule.default.CPU;
	const Cartridge = mainModule.default.Cartridge;

	const cartridge = new Cartridge(newRom(prgBytes));

	const areMappersImplemented = GLOBAL_LEVEL_ID >= Book.current.getId("5a.19");
	if (areMappersImplemented && NROM != null) {
		const mapper = new NROM({ cartridge });
		return new CPU(mapper);
	} else {
		return new CPU(cartridge);
	}
};
// [!] Duplicated <<<

// 5a.16 Addressing modes (2/2): Indexed

["x", "y"].forEach((register) => {
	const name = register.toUpperCase();

	it("`INDEXED_ZERO_PAGE_" + name + "`: inputSize == 1", () => {
		const addressingModes = mainModule.default.addressingModes;
		addressingModes.should.include.key(`INDEXED_ZERO_PAGE_${name}`);
		expect(addressingModes[`INDEXED_ZERO_PAGE_${name}`]).to.be.an("object");
		addressingModes[`INDEXED_ZERO_PAGE_${name}`].inputSize.should.equalN(
			1,
			"inputSize"
		);
	})({
		locales: {
			es: "`INDEXED_ZERO_PAGE_" + name + "`: inputSize == 1",
		},
		use: ({ id }, book) => id >= book.getId("5a.16"),
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
				.should.equalN(150, "getAddress(...)");
		}
	)({
		locales: {
			es:
				"`INDEXED_ZERO_PAGE_" +
				name +
				"` / `getAddress`: " +
				`retorna la dirección + [${name}]`,
		},
		use: ({ id }, book) => id >= book.getId("5a.16"),
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
				.should.equalN(123, "getValue(...)");
		}
	)({
		locales: {
			es:
				"`INDEXED_ZERO_PAGE_" +
				name +
				"` / `getValue`: lee de memoria la dirección retornada por `getAddress`",
		},
		use: ({ id }, book) => id >= book.getId("5a.16"),
	});

	it("`INDEXED_ZERO_PAGE_" + name + "`: cannot cross the first page", () => {
		const addressingModes = mainModule.default.addressingModes;
		const cpu = newCPU();

		cpu[register].setValue(200);
		addressingModes[`INDEXED_ZERO_PAGE_${name}`]
			.getAddress(cpu, 130)
			.should.equalN(74, "getAddress(...)");
	})({
		locales: {
			es: "`INDEXED_ZERO_PAGE_" + name + "`: no puede cruzar la primer página",
		},
		use: ({ id }, book) => id >= book.getId("5a.16"),
	});
});

["x", "y"].forEach((register) => {
	const name = register.toUpperCase();

	it("`INDEXED_ABSOLUTE_" + name + "`: inputSize == 2", () => {
		const addressingModes = mainModule.default.addressingModes;
		addressingModes.should.include.key(`INDEXED_ABSOLUTE_${name}`);
		expect(addressingModes[`INDEXED_ABSOLUTE_${name}`]).to.be.an("object");
		addressingModes[`INDEXED_ABSOLUTE_${name}`].inputSize.should.equalN(
			2,
			"inputSize"
		);
	})({
		locales: {
			es: "`INDEXED_ABSOLUTE_" + name + "`: inputSize == 2",
		},
		use: ({ id }, book) => id >= book.getId("5a.16"),
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
				.should.equalN(1180, "getAddress(...)");
		}
	)({
		locales: {
			es:
				"`INDEXED_ABSOLUTE_" +
				name +
				"` / `getAddress`: " +
				`retorna la dirección + [${name}]`,
		},
		use: ({ id }, book) => id >= book.getId("5a.16"),
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
				.should.equalN(123, "getValue(...)");
		}
	)({
		locales: {
			es:
				"`INDEXED_ABSOLUTE_" +
				name +
				"` / `getValue`: lee de memoria la dirección retornada por `getAddress`",
		},
		use: ({ id }, book) => id >= book.getId("5a.16"),
	});

	it("`INDEXED_ABSOLUTE_" + name + "`: cannot cross $FFFF", () => {
		const addressingModes = mainModule.default.addressingModes;
		const cpu = newCPU();

		cpu[register].setValue(2);
		addressingModes[`INDEXED_ABSOLUTE_${name}`]
			.getAddress(cpu, 0xffff)
			.should.equalHex(0x0001, "getAddress(...)");
	})({
		locales: {
			es: "`INDEXED_ABSOLUTE_" + name + "`: no puede cruzar $FFFF",
		},
		use: ({ id }, book) => id >= book.getId("5a.16"),
	});

	it("`INDEXED_ABSOLUTE_" + name + "`: adds 1 cycle if it crosses page", () => {
		const addressingModes = mainModule.default.addressingModes;
		const cpu = newCPU();
		cpu[register].setValue(180);

		cpu.extraCycles = 0;
		addressingModes[`INDEXED_ABSOLUTE_${name}`].getAddress(cpu, 1000, true);
		cpu.extraCycles.should.equalN(1, "extraCycles");

		cpu.extraCycles = 0;
		addressingModes.RELATIVE.getAddress(cpu, 1000, false);
		cpu.extraCycles.should.equalN(0, "extraCycles");
	})({
		locales: {
			es: "`INDEXED_ABSOLUTE_" + name + "`: agrega 1 ciclo si cruza de página",
		},
		use: ({ id }, book) => id >= book.getId("5a.16"),
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
			cpu.extraCycles.should.equalN(0, "extraCycles");
		}
	)({
		locales: {
			es:
				"`INDEXED_ABSOLUTE_" +
				name +
				"`: no agrega ningún ciclo si no cruza de página",
		},
		use: ({ id }, book) => id >= book.getId("5a.16"),
	});
});

it("`INDEXED_INDIRECT`: inputSize == 1", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("INDEXED_INDIRECT");
	expect(addressingModes.INDEXED_INDIRECT).to.be.an("object");
	addressingModes.INDEXED_INDIRECT.inputSize.should.equalN(1, "inputSize");
})({
	locales: {
		es: "`INDEXED_INDIRECT`: inputSize == 1",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});

it("`INDEXED_INDIRECT` / `getAddress`: grabs the (address + [X]) from memory", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.x.setValue(180);
	cpu.memory.write(195, 0x12);
	cpu.memory.write(196, 0xfe);
	addressingModes.INDEXED_INDIRECT.getAddress(cpu, 15).should.equalHex(
		0xfe12,
		"getAddress(...)"
	);
})({
	locales: {
		es:
			"`INDEXED_INDIRECT` / `getAddress`: toma la (dirección + [X]) desde la memoria",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});

it("`INDEXED_INDIRECT` / `getValue`: reads from memory the address returned by `getAddress`", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(0x0412, 123);
	cpu.x.setValue(180);
	cpu.memory.write(195, 0x12);
	cpu.memory.write(196, 0x04);
	addressingModes.INDEXED_INDIRECT.getValue(cpu, 15).should.equalN(
		123,
		"getValue(...)"
	);
})({
	locales: {
		es:
			"`INDEXED_INDIRECT` / `getValue`: lee de memoria la dirección retornada por `getAddress`",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});

it("`INDEXED_INDIRECT`: cannot cross the first page", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.x.setValue(255);
	cpu.memory.write(0, 0x12);
	cpu.memory.write(1, 0xfe);
	addressingModes.INDEXED_INDIRECT.getAddress(cpu, 1).should.equalHex(
		0xfe12,
		"getAddress(...)"
	);
})({
	locales: {
		es: "`INDEXED_INDIRECT`: no puede cruzar la primer página",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});

it("`INDEXED_INDIRECT`: the 16-bit read wraps within the first page", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.x.setValue(254);
	cpu.memory.write(255, 0x12);
	cpu.memory.write(0, 0xfe);
	addressingModes.INDEXED_INDIRECT.getAddress(cpu, 1).should.equalHex(
		0xfe12,
		"getAddress(...)"
	);
})({
	locales: {
		es:
			"`INDEXED_INDIRECT`: la lectura de 16 bits se envuelve dentro de la primer página",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});

it("`INDIRECT_INDEXED`: inputSize == 1", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("INDIRECT_INDEXED");
	expect(addressingModes.INDIRECT_INDEXED).to.be.an("object");
	addressingModes.INDIRECT_INDEXED.inputSize.should.equalN(1, "inputSize");
})({
	locales: {
		es: "`INDIRECT_INDEXED`: inputSize == 1",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});

it("`INDIRECT_INDEXED` / `getAddress`: grabs the address from memory, then adds [Y]", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.y.setValue(0xb4);
	cpu.memory.write(130, 0x12);
	cpu.memory.write(131, 0xfe);
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130).should.equalHex(
		0xfec6,
		"getAddress(...)"
	);
})({
	locales: {
		es:
			"`INDIRECT_INDEXED` / `getAddress`: toma la dirección desde la memoria, luego suma [Y]",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});

it("`INDIRECT_INDEXED` / `getValue`: reads from memory the address returned by `getAddress`", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(0x04c6, 123);
	cpu.y.setValue(0xb4);
	cpu.memory.write(130, 0x12);
	cpu.memory.write(131, 0x04);
	addressingModes.INDIRECT_INDEXED.getValue(cpu, 130).should.equalN(
		123,
		"getValue(...)"
	);
})({
	locales: {
		es:
			"`INDIRECT_INDEXED` / `getValue`: lee de memoria la dirección retornada por `getAddress`",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});

it("`INDIRECT_INDEXED`: cannot cross $FFFF", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.y.setValue(3);
	cpu.memory.write(130, 0xff);
	cpu.memory.write(131, 0xff);
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130).should.equalN(
		2,
		"getAddress(...)"
	);
})({
	locales: {
		es: "`INDIRECT_INDEXED`: no puede cruzar $FFFF",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});

it("`INDIRECT_INDEXED`: the 16-bit read wraps within the first page", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.y.setValue(3);
	cpu.memory.write(255, 0x12);
	cpu.memory.write(0, 0xfe);
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 255).should.equalHex(
		0xfe15,
		"getAddress(...)"
	);
})({
	locales: {
		es:
			"`INDIRECT_INDEXED`: la lectura de 16 bits se envuelve dentro de la primer página",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});

it("`INDIRECT_INDEXED`: adds 1 cycle if it crosses page", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();
	cpu.y.setValue(0xfc);
	cpu.memory.write(130, 0x12);
	cpu.memory.write(131, 0xfa);

	cpu.extraCycles = 0;
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130, true);
	cpu.extraCycles.should.equalN(1, "extraCycles");

	cpu.extraCycles = 0;
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130, false);
	cpu.extraCycles.should.equalN(0, "extraCycles");
})({
	locales: {
		es: "`INDIRECT_INDEXED`: agrega 1 ciclo si cruza de página",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});

it("`INDIRECT_INDEXED`: doesn't add any cycles if there's no page-cross", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.y.setValue(0xb4);
	cpu.memory.write(130, 0x12);
	cpu.memory.write(131, 0xfe);
	addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130);
	cpu.extraCycles.should.equalN(0, "extraCycles");
})({
	locales: {
		es: "`INDIRECT_INDEXED`: no agrega ningún ciclo si no cruza de página",
	},
	use: ({ id }, book) => id >= book.getId("5a.16"),
});
