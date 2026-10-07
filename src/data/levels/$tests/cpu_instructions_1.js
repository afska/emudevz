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

// 5a.7 Instructions (1/5): Arithmetic

it("the file `/code/index.js` exports <an object> containing the `instructions` object", () => {
  expect(mainModule.default).to.be.an("object");
  expect(mainModule.default).to.include.key("instructions");
  expect(mainModule.default.instructions).to.be.an("object");
})({
  locales: {
    ru:
      "файл `/code/index.js` экспортирует <объект>, содержащий объект `instructions`",
    es:
      "el archivo `/code/index.js` exporta <un objeto> que contiene el objeto `instructions`",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("every member of the `instructions` object has an `id`", () => {
  const instructions = mainModule.default.instructions;

  for (let key in instructions) {
    expect(instructions[key]).to.include.key("id");
    expect(instructions[key].id).to.equalN(key, "id");
  }
})({
  locales: {
    ru: "каждый элемент объекта `instructions` содержит `id`",
    es: "cada miembro del objeto `instructions` tiene un `id`",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`ADC`: argument == "value"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("ADC");
  expect(instructions.ADC).to.be.an("object");
  expect(instructions.ADC.argument).to.equalN("value", "argument");
})({
  locales: {
    ru: '`ADC`: argument == "value"',
    es: '`ADC`: argument == "value"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ADC`: adds the value to the Accumulator", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(20);
  instructions.ADC.run(cpu, 5);
  expect(cpu.a.getValue()).to.equalN(25, "getValue()");
})({
  locales: {
    ru: "`ADC`: прибавляет значение к аккумулятору",
    es: "`ADC`: suma el valor al Acumulador",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ADC`: adds the Carry bit", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(20);
  cpu.flags.c = true;
  instructions.ADC.run(cpu, 5);
  expect(cpu.a.getValue()).to.equalN(26, "getValue()");
})({
  locales: {
    ru: "`ADC`: прибавляет бит переноса",
    es: "`ADC`: suma el bit de Carry",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ADC`: updates the Zero and Negative flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(50);
  instructions.ADC.run(cpu, 120);
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");

  instructions.ADC.run(cpu, 86);
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`ADC`: обновляет флаги нуля и отрицательного результата",
    es: "`ADC`: actualiza las banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ADC`: updates the Carry and Overflow flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  // no carry, no overflow
  cpu.a.setValue(50);
  instructions.ADC.run(cpu, 10);
  expect(cpu.a.getValue()).to.equalN(60, "getValue()");
  expect(cpu.flags.c).to.equalN(false, "c");
  expect(cpu.flags.v).to.equalN(false, "v");

  // positive (60) + positive (75) = negative (-121) => overflow
  cpu.flags.c = false;
  instructions.ADC.run(cpu, 75);
  expect(cpu.a.getValue()).to.equalN(135, "getValue()"); // -121
  expect(cpu.flags.c).to.equalN(false, "c");
  expect(cpu.flags.v).to.equalN(true, "v");

  // result is over 255 => carry
  cpu.flags.c = false;
  instructions.ADC.run(cpu, 122);
  expect(cpu.a.getValue()).to.equalN(1, "getValue()"); // -121 + 122
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.v).to.equalN(false, "v");

  // negative (-60) + negative (-80) = positive (116) => overflow
  cpu.a.setValue(byte.toU8(-60));
  cpu.flags.c = false;
  instructions.ADC.run(cpu, byte.toU8(-80));
  expect(cpu.a.getValue()).to.equalN(116, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c"); // 196 + 176 = 372 > 255
  expect(cpu.flags.v).to.equalN(true, "v");

  // carry-in can be the only reason for carry out
  cpu.a.setValue(255);
  cpu.flags.c = true;
  instructions.ADC.run(cpu, 0);
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.v).to.equalN(false, "v");
})({
  locales: {
    ru: "`ADC`: обновляет флаги переноса и переполнения",
    es: "`ADC`: actualiza las banderas Carry y Overflow",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`ASL`: argument == "address"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("ASL");
  expect(instructions.ASL).to.be.an("object");
  expect(instructions.ASL.argument).to.equalN("address", "argument");
})({
  locales: {
    ru: '`ASL`: argument == "address"',
    es: '`ASL`: argument == "address"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ASL`: multiplies the value by 2", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 12);
  instructions.ASL.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalN(24, "read(...)");
  expect(cpu.flags.c).to.equalN(false, "c");
})({
  locales: {
    ru: "`ASL`: умножает значение на 2",
    es: "`ASL`: multiplica el valor por 2",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ASL`: fills the Carry Flag with bit 7", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 0b11000000);
  instructions.ASL.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalBin(0b10000000, "read(...)");
  expect(cpu.flags.c).to.equalN(true, "c");
})({
  locales: {
    ru: "`ASL`: записывает бит 7 во флаг переноса",
    es: "`ASL`: llena la Bandera Carry con el bit 7",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ASL`: updates the Zero and Negative flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 0b11000000);
  instructions.ASL.run(cpu, 0x1234);
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");

  cpu.memory.write(0x1234, 0);
  instructions.ASL.run(cpu, 0x1234);
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`ASL`: обновляет флаги нуля и отрицательного результата",
    es: "`ASL`: actualiza las banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ASL`: wraps around to 8 bits", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 0b10000000);
  instructions.ASL.run(cpu, 0x1234);

  expect(cpu.memory.read(0x1234)).to.equalBin(0b00000000, "read(...)");
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`ASL`: сохраняет только младшие 8 бит результата",
    es: "`ASL`: da la vuelta a 8 bits",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`ASLa`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("ASLa");
  expect(instructions.ASLa).to.be.an("object");
  expect(instructions.ASLa.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`ASLa`: argument == "no"',
    es: '`ASLa`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ASLa`: multiplies [A] by 2", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(12);
  instructions.ASLa.run(cpu);
  expect(cpu.a.getValue()).to.equalN(24, "getValue()");
  expect(cpu.flags.c).to.equalN(false, "c");
})({
  locales: {
    ru: "`ASLa`: умножает [A] на 2",
    es: "`ASLa`: multiplica [A] por 2",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ASLa`: fills the Carry Flag with bit 7", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(0b11000000);
  instructions.ASLa.run(cpu);
  expect(cpu.a.getValue()).to.equalBin(0b10000000, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c");
})({
  locales: {
    ru: "`ASLa`: записывает бит 7 во флаг переноса",
    es: "`ASLa`: llena la Bandera Carry con el bit 7",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ASLa`: updates the Zero and Negative flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(0b11000000);
  instructions.ASLa.run(cpu);
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");

  cpu.a.setValue(0);
  instructions.ASLa.run(cpu);
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`ASLa`: обновляет флаги нуля и отрицательного результата",
    es: "`ASLa`: actualiza las banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ASLa`: wraps around to 8 bits", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(0b10000000);
  instructions.ASLa.run(cpu);

  expect(cpu.a.getValue()).to.equalBin(0b00000000, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`ASLa`: сохраняет только младшие 8 бит результата",
    es: "`ASLa`: da la vuelta a 8 bits",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`DEC`: argument == "address"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("DEC");
  expect(instructions.DEC).to.be.an("object");
  expect(instructions.DEC.argument).to.equalN("address", "argument");
})({
  locales: {
    ru: '`DEC`: argument == "address"',
    es: '`DEC`: argument == "address"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`DEC`: decrements the value", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 9);
  instructions.DEC.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalN(8, "read(...)");
})({
  locales: {
    ru: "`DEC`: уменьшает значение на 1",
    es: "`DEC`: decrementa el valor",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`DEC`: updates the Zero Flag", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 1);
  instructions.DEC.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalN(0, "read(...)");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`DEC`: обновляет флаг нуля",
    es: "`DEC`: actualiza la Bandera Zero",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`DEC`: updates the Negative Flag", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 0);
  instructions.DEC.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalN(255, "read(...)");
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");
})({
  locales: {
    ru: "`DEC`: обновляет флаг отрицательного результата",
    es: "`DEC`: actualiza la Bandera Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`INC`: argument == "address"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("INC");
  expect(instructions.INC).to.be.an("object");
  expect(instructions.INC.argument).to.equalN("address", "argument");
})({
  locales: {
    ru: '`INC`: argument == "address"',
    es: '`INC`: argument == "address"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`INC`: increments the value in memory", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 8);
  instructions.INC.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalN(9, "read(...)");
})({
  locales: {
    ru: "`INC`: увеличивает значение в памяти на 1",
    es: "`INC`: incrementa el valor en memoria",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`INC`: sets the Zero Flag", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 255);
  instructions.INC.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalN(0, "read(...)");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`INC`: устанавливает флаг нуля",
    es: "`INC`: actualiza la Bandera Zero",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`INC`: sets the Negative Flag", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 244);
  instructions.INC.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalN(245, "read(...)");
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");
})({
  locales: {
    ru: "`INC`: устанавливает флаг отрицательного результата",
    es: "`INC`: actualiza la Bandera Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`DEX`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("DEX");
  expect(instructions.DEX).to.be.an("object");
  expect(instructions.DEX.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`DEX`: argument == "no"',
    es: '`DEX`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`DEX`: decrements the [X] register and updates the flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.x.setValue(1);
  instructions.DEX.run(cpu);

  expect(cpu.x.getValue()).to.equalN(0, "getValue()");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");

  cpu.x.setValue(0);
  instructions.DEX.run(cpu);

  expect(cpu.x.getValue()).to.equalN(255, "getValue()");
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");
})({
  locales: {
    ru: "`DEX`: уменьшает регистр [X] на 1 и обновляет флаги",
    es: "`DEX`: decrementa el registro [X] y actualiza las banderas",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`DEY`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("DEY");
  expect(instructions.DEY).to.be.an("object");
  expect(instructions.DEY.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`DEY`: argument == "no"',
    es: '`DEY`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`DEY`: decrements the [Y] register and updates the flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.y.setValue(1);
  instructions.DEY.run(cpu);

  expect(cpu.y.getValue()).to.equalN(0, "getValue()");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");

  cpu.y.setValue(0);
  instructions.DEY.run(cpu);

  expect(cpu.y.getValue()).to.equalN(255, "getValue()");
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");
})({
  locales: {
    ru: "`DEY`: уменьшает регистр [Y] на 1 и обновляет флаги",
    es: "`DEY`: decrementa el registro [Y] y actualiza las banderas",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`INX`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("INX");
  expect(instructions.INX).to.be.an("object");
  expect(instructions.INX.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`INX`: argument == "no"',
    es: '`INX`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`INX`: increments the [X] register and updates the flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.x.setValue(255);
  instructions.INX.run(cpu);

  expect(cpu.x.getValue()).to.equalN(0, "getValue()");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");

  cpu.x.setValue(244);
  instructions.INX.run(cpu);

  expect(cpu.x.getValue()).to.equalN(245, "getValue()");
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");
})({
  locales: {
    ru: "`INX`: увеличивает регистр [X] на 1 и обновляет флаги",
    es: "`INX`: incrementa el registro [X] y actualiza las banderas",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`INY`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("INY");
  expect(instructions.INY).to.be.an("object");
  expect(instructions.INY.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`INY`: argument == "no"',
    es: '`INY`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`INY`: increments the [Y] register and updates the flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.y.setValue(255);
  instructions.INY.run(cpu);

  expect(cpu.y.getValue()).to.equalN(0, "getValue()");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");

  cpu.y.setValue(244);
  instructions.INY.run(cpu);

  expect(cpu.y.getValue()).to.equalN(245, "getValue()");
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");
})({
  locales: {
    ru: "`INY`: увеличивает регистр [Y] на 1 и обновляет флаги",
    es: "`INY`: incrementa el registro [Y] y actualiza las banderas",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`LSR`: argument == "address"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("LSR");
  expect(instructions.LSR).to.be.an("object");
  expect(instructions.LSR.argument).to.equalN("address", "argument");
})({
  locales: {
    ru: '`LSR`: argument == "address"',
    es: '`LSR`: argument == "address"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`LSR`: divides the value by 2", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 128);
  instructions.LSR.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalN(64, "read(...)");
  expect(cpu.flags.c).to.equalN(false, "c");
})({
  locales: {
    ru: "`LSR`: делит значение на 2",
    es: "`LSR`: divide el valor entre 2",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`LSR`: fills the Carry Flag with bit 0", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 0b11000001);
  instructions.LSR.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalBin(0b01100000, "read(...)");
  expect(cpu.flags.c).to.equalN(true, "c");
})({
  locales: {
    ru: "`LSR`: записывает бит 0 во флаг переноса",
    es: "`LSR`: llena la Bandera Carry con el bit 0",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`LSR`: updates the Zero and Negative flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 0b11000000);
  instructions.LSR.run(cpu, 0x1234);
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(false, "n");

  cpu.memory.write(0x1234, 0);
  instructions.LSR.run(cpu, 0x1234);
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`LSR`: обновляет флаги нуля и отрицательного результата",
    es: "`LSR`: actualiza las banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`LSRa`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("LSRa");
  expect(instructions.LSRa).to.be.an("object");
  expect(instructions.LSRa.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`LSRa`: argument == "no"',
    es: '`LSRa`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`LSRa`: divides [A] by 2", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(128);
  instructions.LSRa.run(cpu);
  expect(cpu.a.getValue()).to.equalN(64, "getValue()");
  expect(cpu.flags.c).to.equalN(false, "c");
})({
  locales: {
    ru: "`LSRa`: делит [A] на 2",
    es: "`LSRa`: divide [A] entre 2",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`LSRa`: fills the Carry Flag with bit 0", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(0b11000001);
  instructions.LSRa.run(cpu);
  expect(cpu.a.getValue()).to.equalBin(0b01100000, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c");
})({
  locales: {
    ru: "`LSRa`: записывает бит 0 во флаг переноса",
    es: "`LSRa`: llena la Bandera Carry con el bit 0",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`LSRa`: updates the Zero and Negative flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(0b11000000);
  instructions.LSRa.run(cpu);
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(false, "n");

  cpu.a.setValue(0);
  instructions.LSRa.run(cpu);
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`LSRa`: обновляет флаги нуля и отрицательного результата",
    es: "`LSRa`: actualiza las banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`ROL`: argument == "address"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("ROL");
  expect(instructions.ROL).to.be.an("object");
  expect(instructions.ROL.argument).to.equalN("address", "argument");
})({
  locales: {
    ru: '`ROL`: argument == "address"',
    es: '`ROL`: argument == "address"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROL`: multiplies the value by 2", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 12);
  instructions.ROL.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalN(24, "read(...)");
})({
  locales: {
    ru: "`ROL`: умножает значение на 2",
    es: "`ROL`: multiplica el valor por 2",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROL`: fills the Carry Flag with bit 7", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 0b10100000);
  instructions.ROL.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalBin(0b01000000, "read(...)");
  expect(cpu.flags.c).to.equalN(true, "c");
})({
  locales: {
    ru: "`ROL`: записывает бит 7 во флаг переноса",
    es: "`ROL`: llena la Bandera Carry con el bit 7",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROL`: sets the bit 0 with the Carry Flag", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.flags.c = true;
  cpu.memory.write(0x1234, 0b10100000);
  instructions.ROL.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalBin(0b01000001, "read(...)");
})({
  locales: {
    ru: "`ROL`: записывает флаг переноса в бит 0",
    es: "`ROL`: llena el bit 0 con la Bandera Carry",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROL`: updates the Zero and Negative flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 0b11000000);
  instructions.ROL.run(cpu, 0x1234);
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");

  cpu.flags.c = false;

  cpu.memory.write(0x1234, 0);
  instructions.ROL.run(cpu, 0x1234);
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`ROL`: обновляет флаги нуля и отрицательного результата",
    es: "`ROL`: actualiza las banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROL`: wraps around to 8 bits", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 0b10000000);
  instructions.ROL.run(cpu, 0x1234);

  expect(cpu.memory.read(0x1234)).to.equalBin(0b00000000, "read(...)");
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`ROL`: сохраняет только младшие 8 бит результата",
    es: "`ROL`: da la vuelta a 8 bits",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`ROLa`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("ROLa");
  expect(instructions.ROLa).to.be.an("object");
  expect(instructions.ROLa.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`ROLa`: argument == "no"',
    es: '`ROLa`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROLa`: multiplies [A] by 2", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(12);
  instructions.ROLa.run(cpu);
  expect(cpu.a.getValue()).to.equalN(24, "getValue()");
})({
  locales: {
    ru: "`ROLa`: умножает [A] на 2",
    es: "`ROLa`: multiplica [A] por 2",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROLa`: fills the Carry Flag with bit 7", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(0b10100000);
  instructions.ROLa.run(cpu);
  expect(cpu.a.getValue()).to.equalBin(0b01000000, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c");
})({
  locales: {
    ru: "`ROLa`: записывает бит 7 во флаг переноса",
    es: "`ROLa`: llena la Bandera Carry con el bit 7",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROLa`: sets the bit 0 with the Carry Flag", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.flags.c = true;
  cpu.a.setValue(0b10100000);
  instructions.ROLa.run(cpu);
  expect(cpu.a.getValue()).to.equalBin(0b01000001, "getValue()");
})({
  locales: {
    ru: "`ROLa`: записывает флаг переноса в бит 0",
    es: "`ROLa`: llena el bit 0 con la Bandera Carry",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROLa`: updates the Zero and Negative flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(0b11000000);
  instructions.ROLa.run(cpu);
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");

  cpu.flags.c = false;

  cpu.a.setValue(0);
  instructions.ROLa.run(cpu);
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`ROLa`: обновляет флаги нуля и отрицательного результата",
    es: "`ROLa`: actualiza las banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROLa`: wraps around to 8 bits", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(0b10000000);
  instructions.ROLa.run(cpu);

  expect(cpu.a.getValue()).to.equalBin(0b00000000, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`ROLa`: сохраняет только младшие 8 бит результата",
    es: "`ROLa`: da la vuelta a 8 bits",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`ROR`: argument == "address"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("ROR");
  expect(instructions.ROR).to.be.an("object");
  expect(instructions.ROR.argument).to.equalN("address", "argument");
})({
  locales: {
    ru: '`ROR`: argument == "address"',
    es: '`ROR`: argument == "address"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROR`: divides the value by 2", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 24);
  instructions.ROR.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalN(12, "read(...)");
})({
  locales: {
    ru: "`ROR`: делит значение на 2",
    es: "`ROR`: divide el valor entre 2",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROR`: fills the Carry Flag with bit 0", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.memory.write(0x1234, 0b00000101);
  instructions.ROR.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalBin(0b00000010, "read(...)");
  expect(cpu.flags.c).to.equalN(true, "c");
})({
  locales: {
    ru: "`ROR`: записывает бит 0 во флаг переноса",
    es: "`ROR`: llena la Bandera Carry con el bit 0",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROR`: sets the bit 7 with the Carry Flag", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.flags.c = true;
  cpu.memory.write(0x1234, 0b00000101);
  instructions.ROR.run(cpu, 0x1234);
  expect(cpu.memory.read(0x1234)).to.equalBin(0b10000010, "read(...)");
})({
  locales: {
    ru: "`ROR`: записывает флаг переноса в бит 7",
    es: "`ROR`: llena el bit 7 con la Bandera Carry",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`ROR`: updates the Zero and Negative flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.flags.c = true;
  cpu.memory.write(0x1234, 0b11000000);
  instructions.ROR.run(cpu, 0x1234);
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");

  cpu.flags.c = false;

  cpu.memory.write(0x1234, 0);
  instructions.ROR.run(cpu, 0x1234);
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`ROR`: обновляет флаги нуля и отрицательного результата",
    es: "`ROR`: actualiza las banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`RORa`: argument == "no"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("RORa");
  expect(instructions.RORa).to.be.an("object");
  expect(instructions.RORa.argument).to.equalN("no", "argument");
})({
  locales: {
    ru: '`RORa`: argument == "no"',
    es: '`RORa`: argument == "no"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`RORa`: divides [A] by 2", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(24);
  instructions.RORa.run(cpu);
  expect(cpu.a.getValue()).to.equalN(12, "getValue()");
})({
  locales: {
    ru: "`RORa`: делит [A] на 2",
    es: "`RORa`: divide [A] entre 2",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`RORa`: fills the Carry Flag with bit 0", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(0b00000101);
  instructions.RORa.run(cpu);
  expect(cpu.a.getValue()).to.equalBin(0b00000010, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c");
})({
  locales: {
    ru: "`RORa`: записывает бит 0 во флаг переноса",
    es: "`RORa`: llena la Bandera Carry con el bit 0",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`RORa`: sets the bit 7 with the Carry Flag", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.flags.c = true;
  cpu.a.setValue(0b00000101);
  instructions.RORa.run(cpu);
  expect(cpu.a.getValue()).to.equalBin(0b10000010, "getValue()");
})({
  locales: {
    ru: "`RORa`: записывает флаг переноса в бит 7",
    es: "`RORa`: llena el bit 7 con la Bandera Carry",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`RORa`: updates the Zero and Negative flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.flags.c = true;
  cpu.a.setValue(0b11000000);
  instructions.RORa.run(cpu);
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");

  cpu.flags.c = false;

  cpu.a.setValue(0);
  instructions.RORa.run(cpu);
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`RORa`: обновляет флаги нуля и отрицательного результата",
    es: "`RORa`: actualiza las banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it('`SBC`: argument == "value"', () => {
  const instructions = mainModule.default.instructions;
  expect(instructions).to.include.key("SBC");
  expect(instructions.SBC).to.be.an("object");
  expect(instructions.SBC.argument).to.equalN("value", "argument");
})({
  locales: {
    ru: '`SBC`: argument == "value"',
    es: '`SBC`: argument == "value"',
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`SBC`: subtracts the value from the Accumulator - 1 when ~C~ is clear", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(20);
  instructions.SBC.run(cpu, 5);
  expect(cpu.a.getValue()).to.equalN(14, "getValue()");
})({
  locales: {
    ru: "`SBC`: вычитает значение из аккумулятора и ещё 1, если ~C~ сброшен",
    es: "`SBC`: resta el valor del Acumulador - 1 cuando ~C~ está apagada",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`SBC`: subtracts the value from the Accumulator - 0 when ~C~ is set", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(20);
  cpu.flags.c = true;
  instructions.SBC.run(cpu, 5);
  expect(cpu.a.getValue()).to.equalN(15, "getValue()");
})({
  locales: {
    ru:
      "`SBC`: вычитает значение из аккумулятора без дополнительного вычитания, если ~C~ установлен",
    es: "`SBC`: resta el valor del Acumulador - 0 cuando ~C~ está encendida",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`SBC`: updates the Zero and Negative flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  cpu.a.setValue(20);
  instructions.SBC.run(cpu, 30);
  expect(cpu.flags.z).to.equalN(false, "z");
  expect(cpu.flags.n).to.equalN(true, "n");

  cpu.a.setValue(0);
  cpu.flags.c = true;
  instructions.SBC.run(cpu, 0);
  expect(cpu.flags.z).to.equalN(true, "z");
  expect(cpu.flags.n).to.equalN(false, "n");
})({
  locales: {
    ru: "`SBC`: обновляет флаги нуля и отрицательного результата",
    es: "`SBC`: actualiza las banderas Zero y Negative",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});

it("`SBC`: updates the Carry and Overflow flags", () => {
  const cpu = newCPU();
  const instructions = mainModule.default.instructions;

  // no carry, no overflow
  cpu.a.setValue(50);
  instructions.SBC.run(cpu, 10);
  expect(cpu.a.getValue()).to.equalN(39, "getValue()"); // 50 - 10 - 1
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.v).to.equalN(false, "v");

  // positive (40) - negative (-100) = negative (-116) => overflow
  cpu.a.setValue(40);
  cpu.flags.c = true;
  instructions.SBC.run(cpu, byte.toU8(-100));
  expect(cpu.a.getValue()).to.equalN(140, "getValue()"); // -116
  expect(cpu.flags.c).to.equalN(false, "c"); // borrow!
  //   v
  //   00101000 (40)
  // - 10011100 (-100)
  //   ^
  expect(cpu.flags.v).to.equalN(true, "v");

  // negative (-40) - positive (100) = positive (116) => overflow
  cpu.a.setValue(byte.toU8(-40));
  cpu.flags.c = true;
  instructions.SBC.run(cpu, 100);
  expect(cpu.a.getValue()).to.equalN(116, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c"); // no borrow
  expect(cpu.flags.v).to.equalN(true, "v");

  // no borrow even if result has bit 7 set (C must stay 1)
  cpu.a.setValue(0x80);
  cpu.flags.c = true;
  instructions.SBC.run(cpu, 0);
  expect(cpu.a.getValue()).to.equalHex(0x80, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.v).to.equalN(false, "v");

  // if A == value with C=1 => result 0, no borrow
  cpu.a.setValue(0x10);
  cpu.flags.c = true;
  instructions.SBC.run(cpu, 0x10);
  expect(cpu.a.getValue()).to.equalN(0, "getValue()");
  expect(cpu.flags.c).to.equalN(true, "c");
  expect(cpu.flags.v).to.equalN(false, "v");

  // if A == value with C=0 => result 0xFF, borrow
  cpu.a.setValue(0x10);
  cpu.flags.c = false;
  instructions.SBC.run(cpu, 0x10);
  expect(cpu.a.getValue()).to.equalHex(0xff, "getValue()");
  expect(cpu.flags.c).to.equalN(false, "c");
  expect(cpu.flags.v).to.equalN(false, "v");

  // 0 - (-128) with C=1 => overflow
  cpu.a.setValue(0);
  cpu.flags.c = true;
  instructions.SBC.run(cpu, 0x80);
  expect(cpu.a.getValue()).to.equalHex(0x80, "getValue()");
  expect(cpu.flags.c).to.equalN(false, "c");
  expect(cpu.flags.v).to.equalN(true, "v");
})({
  locales: {
    ru: "`SBC`: обновляет флаги переноса и переполнения",
    es: "`SBC`: actualiza las banderas Carry y Overflow",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});
