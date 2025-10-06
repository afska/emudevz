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

// 5a.10 Instructions (4/5): Branching

[
  { instruction: "BCC", flag: "c" },
  { instruction: "BNE", flag: "z" },
  { instruction: "BPL", flag: "n" },
  { instruction: "BVC", flag: "v" },
].forEach(({ instruction, flag }) => {
  const name = flag.toUpperCase();

  it("`" + instruction + '`: argument == "address"', () => {
    const instructions = mainModule.default.instructions;
    expect(instructions).to.include.key(instruction);
    expect(instructions[instruction]).to.be.an("object");
    expect(instructions[instruction].argument).to.equalN("address", "argument");
  })({
    locales: {
      es: "`" + instruction + '`: argument == "address"',
    },
    use: ({ id }, book) => id >= book.getId("5a.10"),
  });

  it("`" + instruction + "`: " + `jumps if the ~${name}~ flag is clear`, () => {
    const cpu = newCPU();
    const instructions = mainModule.default.instructions;
    cpu.pc.setValue(0x1000);

    cpu.flags[flag] = false;
    instructions[instruction].run(cpu, 0x2000);
    expect(cpu.pc.getValue()).to.equalHex(0x2000, "getValue()");
    expect(cpu.extraCycles).to.equalN(1, "extraCycles");
  })({
    locales: {
      es:
        "`" +
        instruction +
        "`: " +
        `salta si la bandera ~${name}~ está apagada`,
    },
    use: ({ id }, book) => id >= book.getId("5a.10"),
  });

  it(
    "`" + instruction + "`: " + `doesn't jump if the ~${name}~ flag is set`,
    () => {
      const cpu = newCPU();
      const instructions = mainModule.default.instructions;
      cpu.pc.setValue(0x1000);

      cpu.extraCycles = 3;
      cpu.flags[flag] = true;
      instructions[instruction].run(cpu, 0x2000);
      expect(cpu.pc.getValue()).to.equalHex(0x1000, "getValue()");
      expect(cpu.extraCycles).to.equalN(0, "extraCycles");
    }
  )({
    locales: {
      es:
        "`" +
        instruction +
        "`: " +
        `no salta si la bandera ~${name}~ está encendida`,
    },
    use: ({ id }, book) => id >= book.getId("5a.10"),
  });
});

[
  { instruction: "BCS", flag: "c" },
  { instruction: "BEQ", flag: "z" },
  { instruction: "BMI", flag: "n" },
  { instruction: "BVS", flag: "v" },
].forEach(({ instruction, flag }) => {
  const name = flag.toUpperCase();

  it("`" + instruction + '`: argument == "address"', () => {
    const instructions = mainModule.default.instructions;
    expect(instructions).to.include.key(instruction);
    expect(instructions[instruction]).to.be.an("object");
    expect(instructions[instruction].argument).to.equalN("address", "argument");
  })({
    locales: {
      es: "`" + instruction + '`: argument == "address"',
    },
    use: ({ id }, book) => id >= book.getId("5a.10"),
  });

  it("`" + instruction + "`: " + `jumps if the ~${name}~ flag is set`, () => {
    const cpu = newCPU();
    const instructions = mainModule.default.instructions;
    cpu.pc.setValue(0x1000);

    cpu.flags[flag] = true;
    instructions[instruction].run(cpu, 0x2000);
    expect(cpu.pc.getValue()).to.equalHex(0x2000, "getValue()");
    expect(cpu.extraCycles).to.equalN(1, "extraCycles");
  })({
    locales: {
      es:
        "`" +
        instruction +
        "`: " +
        `salta si la bandera ~${name}~ está encendida`,
    },
    use: ({ id }, book) => id >= book.getId("5a.10"),
  });

  it(
    "`" + instruction + "`: " + `doesn't jump if the ~${name}~ flag is clear`,
    () => {
      const cpu = newCPU();
      const instructions = mainModule.default.instructions;
      cpu.pc.setValue(0x1000);

      cpu.extraCycles = 3;
      cpu.flags[flag] = false;
      instructions[instruction].run(cpu, 0x2000);
      expect(cpu.pc.getValue()).to.equalHex(0x1000, "getValue()");
      expect(cpu.extraCycles).to.equalN(0, "extraCycles");
    }
  )({
    locales: {
      es:
        "`" +
        instruction +
        "`: " +
        `no salta si la bandera ~${name}~ está apagada`,
    },
    use: ({ id }, book) => id >= book.getId("5a.10"),
  });
});

it('`JMP`: argument == "address"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("JMP");
  expect(instructions.JMP).to.be.an("object");
  expect(instructions.JMP.argument).to.equalN("address", "argument");
})({
  locales: {
    es: '`JMP`: argument == "address"',
  },
  use: ({ id }, book) => id >= book.getId("5a.10"),
});

it("`JMP`: jumps to the address", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;
  cpu.pc.setValue(0x1000);

  instructions.JMP.run(cpu, 0x1234);
  expect(cpu.pc.getValue()).to.equalHex(0x1234, "getValue()");
})({
  locales: {
    es: "`JMP`: salta a la dirección",
  },
  use: ({ id }, book) => id >= book.getId("5a.10"),
});

it('`JSR`: argument == "address"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("JSR");
  expect(instructions.JSR).to.be.an("object");
  expect(instructions.JSR.argument).to.equalN("address", "argument");
})({
  locales: {
    es: '`JSR`: argument == "address"',
  },
  use: ({ id }, book) => id >= book.getId("5a.10"),
});

it("`JSR`: pushes [PC] - 1 to the stack and jumps to the address", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;
  cpu.pc.setValue(0xfe31);

  instructions.JSR.run(cpu, 0x1234);
  expect(cpu.stack.pop16()).to.equalHex(0xfe30, "pop16()");
  expect(cpu.pc.getValue()).to.equalHex(0x1234, "getValue()");
})({
  locales: {
    es: "`JSR`: pone [PC] - 1 en la pila y salta a la dirección",
  },
  use: ({ id }, book) => id >= book.getId("5a.10"),
});

it('`RTI`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("RTI");
  expect(instructions.RTI).to.be.an("object");
  expect(instructions.RTI.argument).to.equalN("no", "argument");
})({
  locales: {
    es: '`RTI`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.10"),
});

it("`RTI`: updates the flags and [PC] from the stack", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;
  cpu.pc.setValue(0x1000);

  cpu.stack.push16(0xfe35);
  cpu.stack.push(0b10101000);
  instructions.RTI.run(cpu);
  expect(cpu.flags.getValue()).to.equalBin(0b10101000, "getValue()");
  expect(cpu.pc.getValue()).to.equalHex(0xfe35, "getValue()");
})({
  locales: {
    es: "`RTI`: actualiza las banderas y [PC] desde la pila",
  },
  use: ({ id }, book) => id >= book.getId("5a.10"),
});

it('`RTS`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("RTS");
  expect(instructions.RTS).to.be.an("object");
  expect(instructions.RTS.argument).to.equalN("no", "argument");
})({
  locales: {
    es: '`RTS`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.10"),
});

it("`RTS`: updates [PC] from a value in the stack + 1", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;
  cpu.pc.setValue(0x1000);

  cpu.stack.push16(0xfe35);
  instructions.RTS.run(cpu);
  expect(cpu.pc.getValue()).to.equalHex(0xfe36, "getValue()");
})({
  locales: {
    es: "`RTS`: actualiza [PC] desde un valor en la pila + 1",
  },
  use: ({ id }, book) => id >= book.getId("5a.10"),
});
