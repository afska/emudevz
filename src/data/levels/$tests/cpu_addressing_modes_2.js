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

// 5a.13 Addressing modes (2/2): Indexed

["x", "y"].forEach((register) => {
  const name = register.toUpperCase();

  it("`INDEXED_ZERO_PAGE_" + name + "`: <inputSize> == 1", () => {
    const addressingModes = mainModule.default.addressingModes;
    expect(addressingModes).to.include.key(`INDEXED_ZERO_PAGE_${name}`);
    expect(addressingModes[`INDEXED_ZERO_PAGE_${name}`]).to.be.an("object");
    expect(addressingModes[`INDEXED_ZERO_PAGE_${name}`].inputSize).to.equalN(
      1,
      "inputSize"
    );
  })({
    locales: {
      es: "`INDEXED_ZERO_PAGE_" + name + "`: <inputSize> == 1",
    },
    use: ({ id }, book) => id >= book.getId("5a.13"),
  });

  it(
    "`INDEXED_ZERO_PAGE_" +
      name +
      "`: `getAddress(...)` " +
      `returns the address + [${name}]`,
    () => {
      const addressingModes = mainModule.default.addressingModes;
      const cpu = newCPU();

      cpu[register].setValue(20);
      expect(
        addressingModes[`INDEXED_ZERO_PAGE_${name}`].getAddress(cpu, 130)
      ).to.equalN(150, "getAddress(...)");
    }
  )({
    locales: {
      es:
        "`INDEXED_ZERO_PAGE_" +
        name +
        "`: `getAddress(...)` " +
        `retorna la dirección + [${name}]`,
    },
    use: ({ id }, book) => id >= book.getId("5a.13"),
  });

  it(
    "`INDEXED_ZERO_PAGE_" +
      name +
      "`: `getValue(...)` reads from memory the address returned by `getAddress(...)`",
    () => {
      const addressingModes = mainModule.default.addressingModes;
      const cpu = newCPU();

      cpu.memory.write(150, 123);
      cpu[register].setValue(20);
      expect(
        addressingModes[`INDEXED_ZERO_PAGE_${name}`].getValue(cpu, 130)
      ).to.equalN(123, "getValue(...)");
    }
  )({
    locales: {
      es:
        "`INDEXED_ZERO_PAGE_" +
        name +
        "`: `getValue(...)` lee de memoria la dirección retornada por `getAddress(...)`",
    },
    use: ({ id }, book) => id >= book.getId("5a.13"),
  });

  it("`INDEXED_ZERO_PAGE_" + name + "`: cannot cross the first page", () => {
    const addressingModes = mainModule.default.addressingModes;
    const cpu = newCPU();

    cpu[register].setValue(200);
    expect(
      addressingModes[`INDEXED_ZERO_PAGE_${name}`].getAddress(cpu, 130)
    ).to.equalN(74, "getAddress(...)");
  })({
    locales: {
      es: "`INDEXED_ZERO_PAGE_" + name + "`: no puede cruzar la primera página",
    },
    use: ({ id }, book) => id >= book.getId("5a.13"),
  });
});

["x", "y"].forEach((register) => {
  const name = register.toUpperCase();

  it("`INDEXED_ABSOLUTE_" + name + "`: <inputSize> == 2", () => {
    const addressingModes = mainModule.default.addressingModes;
    expect(addressingModes).to.include.key(`INDEXED_ABSOLUTE_${name}`);
    expect(addressingModes[`INDEXED_ABSOLUTE_${name}`]).to.be.an("object");
    expect(addressingModes[`INDEXED_ABSOLUTE_${name}`].inputSize).to.equalN(
      2,
      "inputSize"
    );
  })({
    locales: {
      es: "`INDEXED_ABSOLUTE_" + name + "`: <inputSize> == 2",
    },
    use: ({ id }, book) => id >= book.getId("5a.13"),
  });

  it(
    "`INDEXED_ABSOLUTE_" +
      name +
      "`: `getAddress(...)` " +
      `returns the address + [${name}]`,
    () => {
      const addressingModes = mainModule.default.addressingModes;
      const cpu = newCPU();

      cpu[register].setValue(180);
      expect(
        addressingModes[`INDEXED_ABSOLUTE_${name}`].getAddress(cpu, 1000)
      ).to.equalN(1180, "getAddress(...)");
    }
  )({
    locales: {
      es:
        "`INDEXED_ABSOLUTE_" +
        name +
        "`: `getAddress(...)` " +
        `retorna la dirección + [${name}]`,
    },
    use: ({ id }, book) => id >= book.getId("5a.13"),
  });

  it(
    "`INDEXED_ABSOLUTE_" +
      name +
      "`: `getValue(...)` reads from memory the address returned by `getAddress(...)`",
    () => {
      const addressingModes = mainModule.default.addressingModes;
      const cpu = newCPU();

      cpu.memory.write(1180, 123);
      cpu[register].setValue(180);
      expect(
        addressingModes[`INDEXED_ABSOLUTE_${name}`].getValue(cpu, 1000)
      ).to.equalN(123, "getValue(...)");
    }
  )({
    locales: {
      es:
        "`INDEXED_ABSOLUTE_" +
        name +
        "`: `getValue(...)` lee de memoria la dirección retornada por `getAddress(...)`",
    },
    use: ({ id }, book) => id >= book.getId("5a.13"),
  });

  it("`INDEXED_ABSOLUTE_" + name + "`: cannot cross $FFFF", () => {
    const addressingModes = mainModule.default.addressingModes;
    const cpu = newCPU();

    cpu[register].setValue(2);
    expect(
      addressingModes[`INDEXED_ABSOLUTE_${name}`].getAddress(cpu, 0xffff)
    ).to.equalHex(0x0001, "getAddress(...)");
  })({
    locales: {
      es: "`INDEXED_ABSOLUTE_" + name + "`: no puede cruzar $FFFF",
    },
    use: ({ id }, book) => id >= book.getId("5a.13"),
  });

  it(
    "`INDEXED_ABSOLUTE_" + name + "`: adds 1 cycle if it <crosses page>",
    () => {
      const addressingModes = mainModule.default.addressingModes;
      const cpu = newCPU();
      cpu[register].setValue(180);

      cpu.extraCycles = 0;
      addressingModes[`INDEXED_ABSOLUTE_${name}`].getAddress(cpu, 1000, true);
      expect(cpu.extraCycles).to.equalN(1, "extraCycles");

      cpu.extraCycles = 0;
      addressingModes.RELATIVE.getAddress(cpu, 1000, false);
      expect(cpu.extraCycles).to.equalN(0, "extraCycles");
    }
  )({
    locales: {
      es:
        "`INDEXED_ABSOLUTE_" + name + "`: agrega 1 ciclo si <cruza de página>",
    },
    use: ({ id }, book) => id >= book.getId("5a.13"),
  });

  it(
    "`INDEXED_ABSOLUTE_" +
      name +
      "`: doesn't add any cycles if there's <no page-cross>",
    () => {
      const addressingModes = mainModule.default.addressingModes;
      const cpu = newCPU();

      cpu[register].setValue(20);
      addressingModes[`INDEXED_ABSOLUTE_${name}`].getAddress(cpu, 900, true);
      expect(cpu.extraCycles).to.equalN(0, "extraCycles");
    }
  )({
    locales: {
      es:
        "`INDEXED_ABSOLUTE_" +
        name +
        "`: no agrega ningún ciclo si <no cruza de página>",
    },
    use: ({ id }, book) => id >= book.getId("5a.13"),
  });
});

it("`INDEXED_INDIRECT`: <inputSize> == 1", () => {
  const addressingModes = mainModule.default.addressingModes;
  expect(addressingModes).to.include.key("INDEXED_INDIRECT");
  expect(addressingModes.INDEXED_INDIRECT).to.be.an("object");
  expect(addressingModes.INDEXED_INDIRECT.inputSize).to.equalN(1, "inputSize");
})({
  locales: {
    es: "`INDEXED_INDIRECT`: <inputSize> == 1",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});

it("`INDEXED_INDIRECT`: `getAddress(...)` grabs the (address + [X]) from memory", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.x.setValue(180);
  cpu.memory.write(195, 0x12);
  cpu.memory.write(196, 0xfe);
  expect(addressingModes.INDEXED_INDIRECT.getAddress(cpu, 15)).to.equalHex(
    0xfe12,
    "getAddress(...)"
  );
})({
  locales: {
    es:
      "`INDEXED_INDIRECT`: `getAddress(...)` toma la (dirección + [X]) desde la memoria",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});

it("`INDEXED_INDIRECT`: `getValue(...)` reads from memory the address returned by `getAddress(...)`", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.memory.write(0x0412, 123);
  cpu.x.setValue(180);
  cpu.memory.write(195, 0x12);
  cpu.memory.write(196, 0x04);
  expect(addressingModes.INDEXED_INDIRECT.getValue(cpu, 15)).to.equalN(
    123,
    "getValue(...)"
  );
})({
  locales: {
    es:
      "`INDEXED_INDIRECT`: `getValue(...)` lee de memoria la dirección retornada por `getAddress(...)`",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});

it("`INDEXED_INDIRECT`: cannot cross the first page", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.x.setValue(255);
  cpu.memory.write(0, 0x12);
  cpu.memory.write(1, 0xfe);
  expect(addressingModes.INDEXED_INDIRECT.getAddress(cpu, 1)).to.equalHex(
    0xfe12,
    "getAddress(...)"
  );
})({
  locales: {
    es: "`INDEXED_INDIRECT`: no puede cruzar la primera página",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});

it("`INDEXED_INDIRECT`: the 16-bit read <wraps> within the first page", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.x.setValue(254);
  cpu.memory.write(255, 0x12);
  cpu.memory.write(0, 0xfe);
  expect(addressingModes.INDEXED_INDIRECT.getAddress(cpu, 1)).to.equalHex(
    0xfe12,
    "getAddress(...)"
  );
})({
  locales: {
    es:
      "`INDEXED_INDIRECT`: la lectura de 16 bits <se envuelve> dentro de la primera página",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});

it("`INDIRECT_INDEXED`: <inputSize> == 1", () => {
  const addressingModes = mainModule.default.addressingModes;
  expect(addressingModes).to.include.key("INDIRECT_INDEXED");
  expect(addressingModes.INDIRECT_INDEXED).to.be.an("object");
  expect(addressingModes.INDIRECT_INDEXED.inputSize).to.equalN(1, "inputSize");
})({
  locales: {
    es: "`INDIRECT_INDEXED`: <inputSize> == 1",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});

it("`INDIRECT_INDEXED`: `getAddress(...)` grabs the address from memory, then adds [Y]", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.y.setValue(0xb4);
  cpu.memory.write(130, 0x12);
  cpu.memory.write(131, 0xfe);
  expect(addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130)).to.equalHex(
    0xfec6,
    "getAddress(...)"
  );
})({
  locales: {
    es:
      "`INDIRECT_INDEXED`: `getAddress(...)` toma la dirección desde la memoria, luego suma [Y]",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});

it("`INDIRECT_INDEXED`: `getValue(...)` reads from memory the address returned by `getAddress(...)`", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.memory.write(0x04c6, 123);
  cpu.y.setValue(0xb4);
  cpu.memory.write(130, 0x12);
  cpu.memory.write(131, 0x04);
  expect(addressingModes.INDIRECT_INDEXED.getValue(cpu, 130)).to.equalN(
    123,
    "getValue(...)"
  );
})({
  locales: {
    es:
      "`INDIRECT_INDEXED`: `getValue(...)` lee de memoria la dirección retornada por `getAddress(...)`",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});

it("`INDIRECT_INDEXED`: cannot cross $FFFF", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.y.setValue(3);
  cpu.memory.write(130, 0xff);
  cpu.memory.write(131, 0xff);
  expect(addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130)).to.equalN(
    2,
    "getAddress(...)"
  );
})({
  locales: {
    es: "`INDIRECT_INDEXED`: no puede cruzar $FFFF",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});

it("`INDIRECT_INDEXED`: the 16-bit read <wraps> within the first page", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.y.setValue(3);
  cpu.memory.write(255, 0x12);
  cpu.memory.write(0, 0xfe);
  expect(addressingModes.INDIRECT_INDEXED.getAddress(cpu, 255)).to.equalHex(
    0xfe15,
    "getAddress(...)"
  );
})({
  locales: {
    es:
      "`INDIRECT_INDEXED`: la lectura de 16 bits <se envuelve> dentro de la primera página",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});

it("`INDIRECT_INDEXED`: adds 1 cycle if it <crosses page>", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();
  cpu.y.setValue(0xfc);
  cpu.memory.write(130, 0x12);
  cpu.memory.write(131, 0xfa);

  cpu.extraCycles = 0;
  addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130, true);
  expect(cpu.extraCycles).to.equalN(1, "extraCycles");

  cpu.extraCycles = 0;
  addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130, false);
  expect(cpu.extraCycles).to.equalN(0, "extraCycles");
})({
  locales: {
    es: "`INDIRECT_INDEXED`: agrega 1 ciclo si <cruza de página>",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});

it("`INDIRECT_INDEXED`: doesn't add any cycles if there's <no page-cross>", () => {
  const addressingModes = mainModule.default.addressingModes;
  const cpu = newCPU();

  cpu.y.setValue(0xb4);
  cpu.memory.write(130, 0x12);
  cpu.memory.write(131, 0xfe);
  addressingModes.INDIRECT_INDEXED.getAddress(cpu, 130, true);
  expect(cpu.extraCycles).to.equalN(0, "extraCycles");
})({
  locales: {
    es: "`INDIRECT_INDEXED`: no agrega ningún ciclo si <no cruza de página>",
  },
  use: ({ id }, book) => id >= book.getId("5a.13"),
});
