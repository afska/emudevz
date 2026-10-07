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

// 5a.8 Instructions (2/5): Data

[
  { instruction: "CLC", flag: "c" },
  { instruction: "CLD", flag: "d" },
  { instruction: "CLI", flag: "i" },
  { instruction: "CLV", flag: "v" },
].forEach(({ instruction, flag }) => {
  const name = flag.toUpperCase();

  it("`" + instruction + '`: argument == "no"', () => {
    const instructions = mainModule.default.instructions;
    expect(instructions).to.include.key(instruction);
    expect(instructions[instruction]).to.be.an("object");
    expect(instructions[instruction].argument).to.equalN("no", "argument");
  })({
    locales: {
      ru: "`" + instruction + '`: argument == "no"',
      es: "`" + instruction + '`: argument == "no"',
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });

  it("`" + instruction + "`: " + `clears the ~${name}~ flag`, () => {
    const cpu = newCPU();
    const instructions = mainModule.default.instructions;

    cpu.flags[flag] = true;
    instructions[instruction].run(cpu);
    expect(cpu.flags[flag]).to.equalN(false, flag);
  })({
    locales: {
      ru: "`" + instruction + "`: " + `сбрасывает флаг ~${name}~`,
      es: "`" + instruction + "`: " + `apaga la bandera ~${name}~`,
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });
});

[
  { instruction: "LDA", register: "a" },
  { instruction: "LDX", register: "x" },
  { instruction: "LDY", register: "y" },
].forEach(({ instruction, register }) => {
  const name = register.toUpperCase();

  it("`" + instruction + '`: argument == "value"', () => {
    const instructions = mainModule.default.instructions;
    expect(instructions).to.include.key(instruction);
    expect(instructions[instruction]).to.be.an("object");
    expect(instructions[instruction].argument).to.equalN("value", "argument");
  })({
    locales: {
      ru: "`" + instruction + '`: argument == "value"',
      es: "`" + instruction + '`: argument == "value"',
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });

  it("`" + instruction + "`: " + `loads [${name}] (positive value)`, () => {
    const cpu = newCPU();
    const instructions = mainModule.default.instructions;

    instructions[instruction].run(cpu, 5);
    expect(cpu[register].getValue()).to.equalN(5, "getValue()");
    expect(cpu.flags.z).to.equalN(false, "z");
    expect(cpu.flags.n).to.equalN(false, "n");
  })({
    locales: {
      ru:
        "`" +
        instruction +
        "`: " +
        `загружает [${name}] (положительное значение)`,
      es: "`" + instruction + "`: " + `carga [${name}] (valor positivo)`,
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });

  it("`" + instruction + "`: " + `loads [${name}] (negative value)`, () => {
    const cpu = newCPU();
    const instructions = mainModule.default.instructions;

    const value = byte.toU8(-5);
    instructions[instruction].run(cpu, value);
    expect(cpu[register].getValue()).to.equalN(value, "getValue()");
    expect(cpu.flags.z).to.equalN(false, "z");
    expect(cpu.flags.n).to.equalN(true, "n");
  })({
    locales: {
      ru:
        "`" +
        instruction +
        "`: " +
        `загружает [${name}] (отрицательное значение)`,
      es: "`" + instruction + "`: " + `carga [${name}] (valor negativo)`,
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });

  it("`" + instruction + "`: " + `loads [${name}] (zero value)`, () => {
    const cpu = newCPU();
    const instructions = mainModule.default.instructions;

    instructions[instruction].run(cpu, 0);
    expect(cpu[register].getValue()).to.equalN(0, "getValue()");
    expect(cpu.flags.z).to.equalN(true, "z");
    expect(cpu.flags.n).to.equalN(false, "n");
  })({
    locales: {
      ru: "`" + instruction + "`: " + `загружает [${name}] (нулевое значение)`,
      es: "`" + instruction + "`: " + `carga [${name}] (valor cero)`,
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });
});

it('`PHA`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("PHA");
  expect(instructions.PHA).to.be.an("object");
  expect(instructions.PHA.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`PHA`: argument == "no"',
    es: '`PHA`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.8"),
});

it("`PHA`: pushes [A] onto the stack", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(88);
  instructions.PHA.run(cpu);
  expect(cpu.stack.pop()).to.equalN(88, "pop()");
})({
  locales: {
    ru: "`PHA`: помещает [A] в стек",
    es: "`PHA`: pone [A] en la pila",
  },
  use: ({ id }, book) => id >= book.getId("5a.8"),
});

it('`PHP`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("PHP");
  expect(instructions.PHP).to.be.an("object");
  expect(instructions.PHP.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`PHP`: argument == "no"',
    es: '`PHP`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.8"),
});

it("`PHP`: pushes the flags onto the stack", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.flags.c = true;
  cpu.flags.z = false;
  cpu.flags.i = false;
  cpu.flags.d = false;
  cpu.flags.v = true;
  cpu.flags.n = false;
  instructions.PHP.run(cpu);
  expect(cpu.stack.pop()).to.equalBin(0b01110001, "pop()");
})({
  locales: {
    ru: "`PHP`: помещает флаги в стек",
    es: "`PHP`: pone las banderas en la pila",
  },
  use: ({ id }, book) => id >= book.getId("5a.8"),
});

it('`PLA`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("PLA");
  expect(instructions.PLA).to.be.an("object");
  expect(instructions.PLA.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`PLA`: argument == "no"',
    es: '`PLA`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.8"),
});

it("`PLA`: sets [A] with a value from the stack", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.stack.push(76);
  instructions.PLA.run(cpu);
  expect(cpu.a.getValue()).to.equalN(76, "getValue()");
})({
  locales: {
    ru: "`PLA`: записывает в [A] значение из стека",
    es: "`PLA`: asigna [A] con un valor de la pila",
  },
  use: ({ id }, book) => id >= book.getId("5a.8"),
});

it("`PLA`: updates the Zero and Negative flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.stack.push(240);
  instructions.PLA.run(cpu);
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");

  cpu.stack.push(0);
  instructions.PLA.run(cpu);
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`PLA`: обновляет флаги нуля и отрицательного результата",
    es: "`PLA`: actualiza las banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.8"),
});

it('`PLP`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("PLP");
  expect(instructions.PLP).to.be.an("object");
  expect(instructions.PLP.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`PLP`: argument == "no"',
    es: '`PLP`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.8"),
});

it("`PLP`: sets the flags with a value from the stack", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.stack.push(0b01000101);
  instructions.PLP.run(cpu);
  expect(cpu.flags).to.include({
    n: false,
    v: true,
    d: false,
    i: true,
    z: false,
    c: true,
  });
})({
  locales: {
    ru: "`PLP`: устанавливает флаги по значению из стека",
    es: "`PLP`: asigna las banderas con un valor de la pila",
  },
  use: ({ id }, book) => id >= book.getId("5a.8"),
});

[
  { instruction: "SEC", flag: "c" },
  { instruction: "SED", flag: "d" },
  { instruction: "SEI", flag: "i" },
].forEach(({ instruction, flag }) => {
  const name = flag.toUpperCase();

  it("`" + instruction + '`: argument == "no"', () => {
    const instructions = mainModule.default.instructions;
    expect(instructions).to.include.key(instruction);
    expect(instructions[instruction]).to.be.an("object");
    expect(instructions[instruction].argument).to.equalN("no", "argument");
  })({
    locales: {
      ru: "`" + instruction + '`: argument == "no"',
      es: "`" + instruction + '`: argument == "no"',
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });

  it("`" + instruction + "`: " + `sets the ~${name}~ flag`, () => {
    const cpu = newCPU();
    const instructions = mainModule.default.instructions;

    cpu.flags[flag] = false;
    instructions[instruction].run(cpu);
    expect(cpu.flags[flag]).to.equalN(true, flag);
  })({
    locales: {
      ru: "`" + instruction + "`: " + `устанавливает флаг ~${name}~`,
      es: "`" + instruction + "`: " + `enciende la bandera ~${name}~`,
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });
});

[
  { instruction: "STA", register: "a" },
  { instruction: "STX", register: "x" },
  { instruction: "STY", register: "y" },
].forEach(({ instruction, register }) => {
  const name = register.toUpperCase();

  it("`" + instruction + '`: argument == "address"', () => {
    const instructions = mainModule.default.instructions;
    expect(instructions).to.include.key(instruction);
    expect(instructions[instruction]).to.be.an("object");
    expect(instructions[instruction].argument).to.equalN("address", "argument");
  })({
    locales: {
      ru: "`" + instruction + '`: argument == "address"',
      es: "`" + instruction + '`: argument == "address"',
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });

  it(
    "`" + instruction + "`: " + `writes [${name}] to the memory address`,
    () => {
      const cpu = newCPU();
      const instructions = mainModule.default.instructions;

      cpu[register].setValue(123);
      instructions[instruction].run(cpu, 0x1349);
      expect(cpu.memory.read(0x1349)).to.equalN(123, "read(...)");
    }
  )({
    locales: {
      ru: "`" + instruction + "`: " + `записывает [${name}] по адресу памяти`,
      es:
        "`" +
        instruction +
        "`: " +
        `escribe [${name}] en la dirección de memoria`,
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });
});

[
  {
    instruction: "TAX",
    sourceRegister: "a",
    targetRegister: "x",
  },
  {
    instruction: "TAY",
    sourceRegister: "a",
    targetRegister: "y",
  },
  {
    instruction: "TSX",
    sourceRegister: "sp",
    targetRegister: "x",
  },
  {
    instruction: "TXA",
    sourceRegister: "x",
    targetRegister: "a",
  },
  {
    instruction: "TXS",
    sourceRegister: "x",
    targetRegister: "sp",
  },
  {
    instruction: "TYA",
    sourceRegister: "y",
    targetRegister: "a",
  },
].forEach(({ instruction, sourceRegister, targetRegister }) => {
  const sourceName = sourceRegister.toUpperCase();
  const targetName = targetRegister.toUpperCase();

  it("`" + instruction + '`: argument == "no"', () => {
    const instructions = mainModule.default.instructions;
    expect(instructions).to.include.key(instruction);
    expect(instructions[instruction]).to.be.an("object");
    expect(instructions[instruction].argument).to.equalN("no", "argument");
  })({
    locales: {
      ru: "`" + instruction + '`: argument == "no"',
      es: "`" + instruction + '`: argument == "no"',
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });

  it(
    "`" +
      instruction +
      "`: " +
      `transfers the value from [${sourceName}] to [${targetName}]`,
    () => {
      const cpu = newCPU();
      const instructions = mainModule.default.instructions;

      cpu[sourceRegister].setValue(123);
      instructions[instruction].run(cpu);
      expect(cpu[targetRegister].getValue()).to.equalN(123, "getValue()");
    }
  )({
    locales: {
      ru:
        "`" +
        instruction +
        "`: " +
        `переносит значение из [${sourceName}] в [${targetName}]`,
      es:
        "`" +
        instruction +
        "`: " +
        `transfiere el valor de [${sourceName}] a [${targetName}]`,
    },
    use: ({ id }, book) => id >= book.getId("5a.8"),
  });

  if (instruction != "TXS") {
    it(
      "`" + instruction + "`: " + `updates the Zero and Negative flags`,
      () => {
        const cpu = newCPU();
        const instructions = mainModule.default.instructions;

        cpu[sourceRegister].setValue(240);
        instructions[instruction].run(cpu);
        expect(cpu.flags.z).to.equalN(false, "z");
        expect(cpu.flags.n).to.equalN(true, "n");

        cpu[sourceRegister].setValue(0);
        instructions[instruction].run(cpu);
        expect(cpu.flags.z).to.equalN(true, "z");
        expect(cpu.flags.n).to.equalN(false, "n");
      }
    )({
      locales: {
        ru:
          "`" +
          instruction +
          "`: " +
          `обновляет флаги нуля и отрицательного результата`,
        es:
          "`" + instruction + "`: " + `actualiza las banderas Zero y Negative`,
      },
      use: ({ id }, book) => id >= book.getId("5a.8"),
    });
  } else {
    it(
      "`" +
        instruction +
        "`: " +
        `does <NOT> update the Zero and Negative flags`,
      () => {
        const cpu = newCPU();
        const instructions = mainModule.default.instructions;

        cpu.flags.z = true;
        cpu.flags.n = true;

        cpu[sourceRegister].setValue(240);
        instructions[instruction].run(cpu);
        expect(cpu.flags.z).to.equalN(true, "z");
        expect(cpu.flags.n).to.equalN(true, "n");

        cpu[sourceRegister].setValue(0);
        instructions[instruction].run(cpu);
        expect(cpu.flags.z).to.equalN(true, "z");
        expect(cpu.flags.n).to.equalN(true, "n");
      }
    )({
      locales: {
        ru:
          "`" +
          instruction +
          "`: " +
          `<НЕ> обновляет флаги нуля и отрицательного результата`,
        es:
          "`" +
          instruction +
          "`: " +
          `<NO> actualiza las banderas Zero y Negative`,
      },
      use: ({ id }, book) => id >= book.getId("5a.8"),
    });
  }
});
