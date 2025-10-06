const { EmulatorBuilder, testHelpers, evaluate, byte } = $;

let mainModule, NEEES;
before(async () => {
  mainModule = await evaluate();
  NEEES = await new EmulatorBuilder().addUserCPU(true, true).build();
});

const { newHeader, newRom } = testHelpers;
function newCPU(prgBytes = []) {
  const neees = new NEEES();
  neees.load(newRom(prgBytes));
  return neees.cpu;
}

// 5a.12 Addressing modes (1/2): Simple

it("the file `/code/index.js` exports <an object> containing the `addressingModes` object", () => {
  expect(mainModule.default).to.be.an("object");
  expect(mainModule.default).to.include.key("addressingModes");
  expect(mainModule.default.addressingModes).to.be.an("object");
})({
  locales: {
    es:
      "el archivo `/code/index.js` exporta <un objeto> que contiene el objeto `addressingModes`",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("every member of the `addressingModes` object has an `id`", () => {
  const addressingModes = mainModule.default.addressingModes;

  for (let key in addressingModes) {
    expect(addressingModes[key]).to.include.key("id");
    expect(addressingModes[key].id).to.equalN(key, "id");
  }
})({
  locales: {
    es: "cada miembro del objeto `addressingModes` tiene un `id`",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`IMPLICIT`: <inputSize> == 0", () => {
  const addressingModes = mainModule.default.addressingModes;
  expect(addressingModes).to.include.key("IMPLICIT");
  expect(addressingModes.IMPLICIT).to.be.an("object");
  expect(addressingModes.IMPLICIT.inputSize).to.equalN(0, "inputSize");
})({
  locales: {
    es: "`IMPLICIT`: <inputSize> == 0",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`IMPLICIT`: `getAddress(...)` returns <null>", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  expect(addressingModes.IMPLICIT.getAddress(cpu, 0)).to.equalN(
    null,
    "getAddress(...)"
  );
})({
  locales: {
    es: "`IMPLICIT`: `getAddress(...)` retorna <null>",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`IMPLICIT`: `getValue(...)` is unsupported", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  expect(() => addressingModes.IMPLICIT.getValue(cpu, 0)).to.throw(
    Error,
    /Unsupported/
  );
})({
  locales: {
    es: "`IMPLICIT`: `getValue(...)` no es soportado",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`IMMEDIATE`: <inputSize> == 1", () => {
  const addressingModes = mainModule.default.addressingModes;
  expect(addressingModes).to.include.key("IMMEDIATE");
  expect(addressingModes.IMMEDIATE).to.be.an("object");
  expect(addressingModes.IMMEDIATE.inputSize).to.equalN(1, "inputSize");
})({
  locales: {
    es: "`IMMEDIATE`: <inputSize> == 1",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`IMMEDIATE`: `getAddress(...)` is unsupported", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  expect(() => addressingModes.IMMEDIATE.getAddress(cpu, 0)).to.throw(
    Error,
    /Unsupported/
  );
})({
  locales: {
    es: "`IMMEDIATE`: `getAddress(...)` no es soportado",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`IMMEDIATE`: `getValue(...)` returns the same value", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  expect(addressingModes.IMMEDIATE.getValue(cpu, 123)).to.equalN(
    123,
    "getValue(...)"
  );
})({
  locales: {
    es: "`IMMEDIATE`: `getValue(...)` retorna el mismo valor",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`ABSOLUTE`: <inputSize> == 2", () => {
  const addressingModes = mainModule.default.addressingModes;
  expect(addressingModes).to.include.key("ABSOLUTE");
  expect(addressingModes.ABSOLUTE).to.be.an("object");
  expect(addressingModes.ABSOLUTE.inputSize).to.equalN(2, "inputSize");
})({
  locales: {
    es: "`ABSOLUTE`: <inputSize> == 2",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`ABSOLUTE`: `getAddress(...)` returns the same address", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  expect(addressingModes.ABSOLUTE.getAddress(cpu, 0x1234)).to.equalHex(
    0x1234,
    "getAddress(...)"
  );
})({
  locales: {
    es: "`ABSOLUTE`: `getAddress(...)` retorna la misma dirección",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`ABSOLUTE`: `getValue(...)` reads from memory the address returned by `getAddress(...)`", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.memory.write(0x1234, 123);
  expect(addressingModes.ABSOLUTE.getValue(cpu, 0x1234)).to.equalN(
    123,
    "getValue(...)"
  );
})({
  locales: {
    es:
      "`ABSOLUTE`: `getValue(...)` lee de memoria la dirección retornada por `getAddress(...)`",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`ZERO_PAGE`: <inputSize> == 1", () => {
  const addressingModes = mainModule.default.addressingModes;
  expect(addressingModes).to.include.key("ZERO_PAGE");
  expect(addressingModes.ZERO_PAGE).to.be.an("object");
  expect(addressingModes.ZERO_PAGE.inputSize).to.equalN(1, "inputSize");
})({
  locales: {
    es: "`ZERO_PAGE`: <inputSize> == 1",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`ZERO_PAGE`: `getAddress(...)` returns the same address", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  expect(addressingModes.ZERO_PAGE.getAddress(cpu, 120)).to.equalN(
    120,
    "getAddress(...)"
  );
})({
  locales: {
    es: "`ZERO_PAGE`: `getAddress(...)` retorna la misma dirección",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`ZERO_PAGE`: `getValue(...)` reads from memory the address returned by `getAddress(...)`", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.memory.write(120, 221);
  expect(addressingModes.ABSOLUTE.getValue(cpu, 120)).to.equalN(
    221,
    "getValue(...)"
  );
})({
  locales: {
    es:
      "`ZERO_PAGE`: `getValue(...)` lee de memoria la dirección retornada por `getAddress(...)`",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`RELATIVE`: <inputSize> == 1", () => {
  const addressingModes = mainModule.default.addressingModes;
  expect(addressingModes).to.include.key("RELATIVE");
  expect(addressingModes.RELATIVE).to.be.an("object");
  expect(addressingModes.RELATIVE.inputSize).to.equalN(1, "inputSize");
})({
  locales: {
    es: "`RELATIVE`: <inputSize> == 1",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`RELATIVE`: `getAddress(...)` returns an address based on [PC] + offset", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.pc.setValue(0xfe10);
  expect(addressingModes.RELATIVE.getAddress(cpu, 4)).to.equalHex(
    0xfe14,
    "getAddress(...)"
  );
  expect(addressingModes.RELATIVE.getAddress(cpu, byte.toU8(-10))).to.equalHex(
    0xfe06,
    "getAddress(...)"
  );
})({
  locales: {
    es:
      "`RELATIVE`: `getAddress(...)` retorna una dirección basada en [PC] + desplazamiento",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`RELATIVE`: `getValue(...)` is unsupported", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  expect(() => addressingModes.RELATIVE.getValue(cpu, 0)).to.throw(
    Error,
    /Unsupported/
  );
})({
  locales: {
    es: "`RELATIVE`: `getValue(...)` no es soportado",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`RELATIVE`: cannot cross $FFFF", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.pc.setValue(0xffff);
  expect(addressingModes.RELATIVE.getAddress(cpu, 3)).to.equalN(
    2,
    "getAddress(...)"
  );
})({
  locales: {
    es: "`RELATIVE`: no puede cruzar $FFFF",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`RELATIVE`: adds 2 cycles if it <crosses page>", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();
  cpu.pc.setValue(0xfafe);

  cpu.extraCycles = 0;
  addressingModes.RELATIVE.getAddress(cpu, 20, true);
  expect(cpu.extraCycles).to.equalN(2, "extraCycles");

  cpu.extraCycles = 0;
  addressingModes.RELATIVE.getAddress(cpu, 20, false);
  expect(cpu.extraCycles).to.equalN(0, "extraCycles");
})({
  locales: {
    es: "`RELATIVE`: agrega 2 ciclos si <cruza de página>",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`RELATIVE`: doesn't add any cycles if there's <no page-cross>", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.pc.setValue(0xfe10);
  addressingModes.RELATIVE.getAddress(cpu, 4, true);
  expect(cpu.extraCycles).to.equalN(0, "extraCycles");
})({
  locales: {
    es: "`RELATIVE`: no agrega ningún ciclo si <no cruza de página>",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`INDIRECT`: <inputSize> == 2", () => {
  const addressingModes = mainModule.default.addressingModes;
  expect(addressingModes).to.include.key("INDIRECT");
  expect(addressingModes.INDIRECT).to.be.an("object");
  expect(addressingModes.INDIRECT.inputSize).to.equalN(2, "inputSize");
})({
  locales: {
    es: "`INDIRECT`: <inputSize> == 2",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`INDIRECT`: `getAddress(...)` grabs the address from memory", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.memory.write(130, 0x12);
  cpu.memory.write(131, 0xfe);
  expect(addressingModes.INDIRECT.getAddress(cpu, 130)).to.equalHex(
    0xfe12,
    "getAddress(...)"
  );
})({
  locales: {
    es: "`INDIRECT`: `getAddress(...)` toma la dirección desde la memoria",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

it("`INDIRECT`: `getValue(...)` is unsupported", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  expect(() => addressingModes.INDIRECT.getValue(cpu, 0)).to.throw(
    Error,
    /Unsupported/
  );
})({
  locales: {
    es: "`INDIRECT`: `getValue(...)` no es soportado",
  },
  use: ({ id }, book) => id >= book.getId("5a.12"),
});

// --- After passing 5a.16 ---

it('`INDIRECT`: emulates the "page boundary bug"', () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.memory.write(0x04ff, 0x12);
  cpu.memory.write(0x0400, 0xcd);
  expect(addressingModes.INDIRECT.getAddress(cpu, 0x04ff)).to.equalHex(
    0xcd12,
    "getAddress(...)"
  );
})({
  locales: {
    es: '`INDIRECT`: emula el "page boundary bug"',
  },
  use: ({ id }, book) => id > book.getId("5a.16"),
});
