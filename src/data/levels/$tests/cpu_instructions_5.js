const { EmulatorBuilder, testHelpers, evaluate, byte } = $;

const KB = 1024;

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

// 5a.11 Instructions (5/5): System (interrupts)

it("the CPU can handle <RESET> interrupts", () => {
  // set up read16(0xfffc) => 0x3125
  const prg = [];
  const vectorIndex = 16 * KB - (0x10000 - 0xfffc);
  prg[vectorIndex] = 0x25;
  prg[vectorIndex + 1] = 0x31;

  const cpu = newCPU(prg);
  cpu.cycle = 8;
  cpu.pc.setValue(0x1234);
  cpu.flags.setValue(0);

  const returnValue = cpu.interrupt({
    id: "RESET",
    vector: 0xfffc,
  });

  expect(cpu.stack.pop()).to.equalBin(0b00100000, "pop()");
  expect(cpu.stack.pop16()).to.equalHex(0x1234, "pop16()");
  expect(cpu.cycle).to.equalN(15, "cycle");
  expect(cpu.flags.i).to.equalN(true, "i");
  expect(cpu.pc.getValue()).to.equalHex(0x3125, "getValue()");
  expect(returnValue).to.equalN(7, "interrupt(...)");
})({
  locales: {
    es: "la CPU puede manejar interrupciones <RESET>",
  },
  use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("the CPU can handle NMI interrupts", () => {
  // set up read16(0xfffa) => 0x3125
  const prg = [];
  const vectorIndex = 16 * KB - (0x10000 - 0xfffa);
  prg[vectorIndex] = 0x25;
  prg[vectorIndex + 1] = 0x31;

  const cpu = newCPU(prg);
  cpu.cycle = 8;
  cpu.pc.setValue(0x1234);
  cpu.flags.setValue(0);

  cpu.flags.i = true;
  const returnValue = cpu.interrupt({
    id: "NMI",
    vector: 0xfffa,
  });

  expect(cpu.stack.pop()).to.equalBin(0b00100100, "pop()");
  expect(cpu.stack.pop16()).to.equalHex(0x1234, "pop16()");
  expect(cpu.cycle).to.equalN(15, "cycle");
  expect(cpu.flags.i).to.equalN(true, "i");
  expect(cpu.pc.getValue()).to.equalHex(0x3125, "getValue()");
  expect(returnValue).to.equalN(7, "interrupt(...)");
})({
  locales: {
    es: "la CPU puede manejar interrupciones NMI",
  },
  use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("the CPU can handle <IRQ> interrupts", () => {
  // set up read16(0xfffe) => 0x3125
  const prg = [];
  const vectorIndex = 16 * KB - (0x10000 - 0xfffe);
  prg[vectorIndex] = 0x25;
  prg[vectorIndex + 1] = 0x31;

  const cpu = newCPU(prg);
  cpu.cycle = 8;
  cpu.pc.setValue(0x1234);
  cpu.flags.setValue(0);

  const returnValue = cpu.interrupt({
    id: "IRQ",
    vector: 0xfffe,
  });

  expect(cpu.stack.pop()).to.equalBin(0b00100000, "pop()");
  expect(cpu.stack.pop16()).to.equalHex(0x1234, "pop16()");
  expect(cpu.cycle).to.equalN(15, "cycle");
  expect(cpu.flags.i).to.equalN(true, "i");
  expect(cpu.pc.getValue()).to.equalHex(0x3125, "getValue()");
  expect(returnValue).to.equalN(7, "interrupt(...)");
})({
  locales: {
    es: "la CPU puede manejar interrupciones <IRQ>",
  },
  use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("the CPU ignores <IRQ> interrupts if the ~I~ flag is set", () => {
  // set up read16(0xfffe) => 0x3125
  const prg = [];
  const vectorIndex = 16 * KB - (0x10000 - 0xfffe);
  prg[vectorIndex] = 0x25;
  prg[vectorIndex + 1] = 0x31;

  const cpu = newCPU(prg);
  cpu.cycle = 8;
  cpu.pc.setValue(0x1234);
  cpu.flags.setValue(0);
  const sp = cpu.sp.getValue();

  cpu.flags.i = true;
  const returnValue = cpu.interrupt({
    id: "IRQ",
    vector: 0xfffe,
  });

  expect(cpu.sp.getValue()).to.equalHex(sp, "getValue()");
  expect(cpu.flags.i).to.equalN(true, "i");
  expect(cpu.pc.getValue()).to.equalHex(0x1234, "getValue()");
  expect(cpu.cycle).to.equalN(8, "cycle");
  expect(returnValue).to.equalN(0, "interrupt(...)");
})({
  locales: {
    es: "la CPU ignora interrupciones <IRQ> si la bandera ~I~ está encendida",
  },
  use: ({ id }, book) => id >= book.getId("5a.11"),
});

it('`BRK`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("BRK");
  expect(instructions.BRK).to.be.an("object");
  expect(instructions.BRK.argument).to.equalN("no", "argument");
})({
  locales: {
    es: '`BRK`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("`BRK`: increments [PC] and triggers a <BRK> interrupt (bit 4 from flags should be on)", () => {
  // set up read16(0xfffe) => 0x3125
  const prg = [];
  const vectorIndex = 16 * KB - (0x10000 - 0xfffe);
  prg[vectorIndex] = 0x25;
  prg[vectorIndex + 1] = 0x31;

  const cpu = newCPU(prg);
  const instructions = mainModule.default.instructions;
  cpu.cycle = 8;
  cpu.pc.setValue(0x1234);
  cpu.flags.setValue(0);

  instructions.BRK.run(cpu);

  expect(cpu.stack.pop()).to.equalBin(0b00110000, "pop()");
  expect(cpu.stack.pop16()).to.equalHex(0x1235, "pop16()");
  expect(cpu.flags.i).to.equalN(true, "i");
  expect(cpu.pc.getValue()).to.equalHex(0x3125, "getValue()");
})({
  locales: {
    es:
      "`BRK`: incrementa [PC] y dispara una interrupción <BRK> (el bit 4 de las banderas debería estar encendido)",
  },
  use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("`BRK`: works even if the ~I~ flag is set", () => {
  // set up read16(0xfffe) => 0x3125
  const prg = [];
  const vectorIndex = 16 * KB - (0x10000 - 0xfffe);
  prg[vectorIndex] = 0x25;
  prg[vectorIndex + 1] = 0x31;

  const cpu = newCPU(prg);
  const instructions = mainModule.default.instructions;
  cpu.cycle = 8;
  cpu.pc.setValue(0x1234);
  cpu.flags.setValue(0);
  cpu.flags.i = true;

  instructions.BRK.run(cpu);

  expect(cpu.pc.getValue()).to.equalHex(0x3125, "getValue()");
})({
  locales: {
    es: "`BRK`: funciona incluso cuando la bandera ~I~ está encendida",
  },
  use: ({ id }, book) => id >= book.getId("5a.11"),
});

it('`NOP`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("NOP");
  expect(instructions.NOP).to.be.an("object");
  expect(instructions.NOP.argument).to.equalN("no", "argument");
})({
  locales: {
    es: '`NOP`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("`NOP`: implements `run(...)` as an empty function", () => {
  const instructions = mainModule.default.instructions;
  expect(instructions.NOP).to.respondTo("run");
  expect(instructions.NOP.run.toString().replace(/\s/g, "")).to.equalN(
    "run(){}",
    "run"
  );
})({
  locales: {
    es: "`NOP`: implementa `run(...)` como una función vacía",
  },
  use: ({ id }, book) => id >= book.getId("5a.11"),
});
