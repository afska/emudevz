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
    es:
      "el archivo `/code/index.js` exporta <un objeto> que contiene el objeto `instructions`",
    fr: "le fichier `/code/index.js` exporte <un objet> contenant l'objet `instructions`",
    ru:
      "файл `/code/index.js` экспортирует <объект>, содержащий объект `instructions`",
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
    es: "cada miembro del objeto `instructions` tiene un `id`",
    fr: "chaque membre de l'objet `instructions` a un `id`",
    ru: "каждый элемент объекта `instructions` содержит `id`",
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
    es: '`ADC`: argument == "value"',
    fr: '`ADC`: argument == "value"',
    ru: '`ADC`: argument == "value"',
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
    es: "`ADC`: suma el valor al Acumulador",
    fr: "`ADC` : ajoute la valeur à l'Accumulateur",
    ru: "`ADC`: прибавляет значение к аккумулятору",
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
    es: "`ADC`: suma el bit de Carry",
    fr: "`ADC` : ajoute le bit de Carry",
    ru: "`ADC`: прибавляет бит переноса",
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
    es: "`ADC`: actualiza las banderas Zero y Negative",
    fr: "`ADC` : met à jour les Zero et Negative Flags",
    ru: "`ADC`: обновляет флаги нуля и отрицательного результата",
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
    es: "`ADC`: actualiza las banderas Carry y Overflow",
    fr: "`ADC` : met à jour les Carry et Overflow Flags",
    ru: "`ADC`: обновляет флаги переноса и переполнения",
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
    es: '`ASL`: argument == "address"',
    fr: '`ASL`: argument == "address"',
    ru: '`ASL`: argument == "address"',
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
    es: "`ASL`: multiplica el valor por 2",
    fr: "`ASL` : multiplie la valeur par 2",
    ru: "`ASL`: умножает значение на 2",
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
    es: "`ASL`: llena la Bandera Carry con el bit 7",
    fr: "`ASL` : place le bit 7 dans le Carry Flag",
    ru: "`ASL`: записывает бит 7 во флаг переноса",
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
    es: "`ASL`: actualiza las banderas Zero y Negative",
    fr: "`ASL` : met à jour les Zero et Negative Flags",
    ru: "`ASL`: обновляет флаги нуля и отрицательного результата",
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
    es: "`ASL`: da la vuelta a 8 bits",
    fr: "`ASL` : boucle sur 8 bits",
    ru: "`ASL`: сохраняет только младшие 8 бит результата",
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
    es: '`ASLa`: argument == "no"',
    fr: '`ASLa`: argument == "no"',
    ru: '`ASLa`: argument == "no"',
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
    es: "`ASLa`: multiplica [A] por 2",
    fr: "`ASLa` : multiplie [A] par 2",
    ru: "`ASLa`: умножает [A] на 2",
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
    es: "`ASLa`: llena la Bandera Carry con el bit 7",
    fr: "`ASLa` : place le bit 7 dans le Carry Flag",
    ru: "`ASLa`: записывает бит 7 во флаг переноса",
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
    es: "`ASLa`: actualiza las banderas Zero y Negative",
    fr: "`ASLa` : met à jour les Zero et Negative Flags",
    ru: "`ASLa`: обновляет флаги нуля и отрицательного результата",
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
    es: "`ASLa`: da la vuelta a 8 bits",
    fr: "`ASLa` : boucle sur 8 bits",
    ru: "`ASLa`: сохраняет только младшие 8 бит результата",
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
    es: '`DEC`: argument == "address"',
    fr: '`DEC`: argument == "address"',
    ru: '`DEC`: argument == "address"',
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
    es: "`DEC`: decrementa el valor",
    fr: "`DEC` : décrémente la valeur",
    ru: "`DEC`: уменьшает значение на 1",
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
    es: "`DEC`: actualiza la Bandera Zero",
    fr: "`DEC` : met à jour le Zero Flag",
    ru: "`DEC`: обновляет флаг нуля",
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
    es: "`DEC`: actualiza la Bandera Negative",
    fr: "`DEC` : met à jour le Negative Flag",
    ru: "`DEC`: обновляет флаг отрицательного результата",
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
    es: '`INC`: argument == "address"',
    fr: '`INC`: argument == "address"',
    ru: '`INC`: argument == "address"',
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
    es: "`INC`: incrementa el valor en memoria",
    fr: "`INC` : incrémente la valeur en mémoire",
    ru: "`INC`: увеличивает значение в памяти на 1",
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
    es: "`INC`: actualiza la Bandera Zero",
    fr: "`INC` : met à jour le Zero Flag",
    ru: "`INC`: устанавливает флаг нуля",
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
    es: "`INC`: actualiza la Bandera Negative",
    fr: "`INC` : met à jour le Negative Flag",
    ru: "`INC`: устанавливает флаг отрицательного результата",
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
    es: '`DEX`: argument == "no"',
    fr: '`DEX`: argument == "no"',
    ru: '`DEX`: argument == "no"',
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
    es: "`DEX`: decrementa el registro [X] y actualiza las banderas",
    fr: "`DEX` : décrémente le registre [X] et met à jour les flags",
    ru: "`DEX`: уменьшает регистр [X] на 1 и обновляет флаги",
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
    es: '`DEY`: argument == "no"',
    fr: '`DEY`: argument == "no"',
    ru: '`DEY`: argument == "no"',
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
    es: "`DEY`: decrementa el registro [Y] y actualiza las banderas",
    fr: "`DEY` : décrémente le registre [Y] et met à jour les flags",
    ru: "`DEY`: уменьшает регистр [Y] на 1 и обновляет флаги",
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
    es: '`INX`: argument == "no"',
    fr: '`INX`: argument == "no"',
    ru: '`INX`: argument == "no"',
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
    es: "`INX`: incrementa el registro [X] y actualiza las banderas",
    fr: "`INX` : incrémente le registre [X] et met à jour les flags",
    ru: "`INX`: увеличивает регистр [X] на 1 и обновляет флаги",
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
    es: '`INY`: argument == "no"',
    fr: '`INY`: argument == "no"',
    ru: '`INY`: argument == "no"',
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
    es: "`INY`: incrementa el registro [Y] y actualiza las banderas",
    fr: "`INY` : incrémente le registre [Y] et met à jour les flags",
    ru: "`INY`: увеличивает регистр [Y] на 1 и обновляет флаги",
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
    es: '`LSR`: argument == "address"',
    fr: '`LSR`: argument == "address"',
    ru: '`LSR`: argument == "address"',
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
    es: "`LSR`: divide el valor entre 2",
    fr: "`LSR` : divise la valeur par 2",
    ru: "`LSR`: делит значение на 2",
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
    es: "`LSR`: llena la Bandera Carry con el bit 0",
    fr: "`LSR` : place le bit 0 dans le Carry Flag",
    ru: "`LSR`: записывает бит 0 во флаг переноса",
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
    es: "`LSR`: actualiza las banderas Zero y Negative",
    fr: "`LSR` : met à jour les Zero et Negative Flags",
    ru: "`LSR`: обновляет флаги нуля и отрицательного результата",
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
    es: '`LSRa`: argument == "no"',
    fr: '`LSRa`: argument == "no"',
    ru: '`LSRa`: argument == "no"',
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
    es: "`LSRa`: divide [A] entre 2",
    fr: "`LSRa` : divise [A] par 2",
    ru: "`LSRa`: делит [A] на 2",
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
    es: "`LSRa`: llena la Bandera Carry con el bit 0",
    fr: "`LSRa` : place le bit 0 dans le Carry Flag",
    ru: "`LSRa`: записывает бит 0 во флаг переноса",
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
    es: "`LSRa`: actualiza las banderas Zero y Negative",
    fr: "`LSRa` : met à jour les Zero et Negative Flags",
    ru: "`LSRa`: обновляет флаги нуля и отрицательного результата",
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
    es: '`ROL`: argument == "address"',
    fr: '`ROL`: argument == "address"',
    ru: '`ROL`: argument == "address"',
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
    es: "`ROL`: multiplica el valor por 2",
    fr: "`ROL` : multiplie la valeur par 2",
    ru: "`ROL`: умножает значение на 2",
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
    es: "`ROL`: llena la Bandera Carry con el bit 7",
    fr: "`ROL` : place le bit 7 dans le Carry Flag",
    ru: "`ROL`: записывает бит 7 во флаг переноса",
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
    es: "`ROL`: llena el bit 0 con la Bandera Carry",
    fr: "`ROL` : place le Carry Flag dans le bit 0",
    ru: "`ROL`: записывает флаг переноса в бит 0",
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
    es: "`ROL`: actualiza las banderas Zero y Negative",
    fr: "`ROL` : met à jour les Zero et Negative Flags",
    ru: "`ROL`: обновляет флаги нуля и отрицательного результата",
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
    es: "`ROL`: da la vuelta a 8 bits",
    fr: "`ROL` : boucle sur 8 bits",
    ru: "`ROL`: сохраняет только младшие 8 бит результата",
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
    es: '`ROLa`: argument == "no"',
    fr: '`ROLa`: argument == "no"',
    ru: '`ROLa`: argument == "no"',
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
    es: "`ROLa`: multiplica [A] por 2",
    fr: "`ROLa` : multiplie [A] par 2",
    ru: "`ROLa`: умножает [A] на 2",
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
    es: "`ROLa`: llena la Bandera Carry con el bit 7",
    fr: "`ROLa` : place le bit 7 dans le Carry Flag",
    ru: "`ROLa`: записывает бит 7 во флаг переноса",
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
    es: "`ROLa`: llena el bit 0 con la Bandera Carry",
    fr: "`ROLa` : place le Carry Flag dans le bit 0",
    ru: "`ROLa`: записывает флаг переноса в бит 0",
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
    es: "`ROLa`: actualiza las banderas Zero y Negative",
    fr: "`ROLa` : met à jour les Zero et Negative Flags",
    ru: "`ROLa`: обновляет флаги нуля и отрицательного результата",
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
    es: "`ROLa`: da la vuelta a 8 bits",
    fr: "`ROLa` : boucle sur 8 bits",
    ru: "`ROLa`: сохраняет только младшие 8 бит результата",
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
    es: '`ROR`: argument == "address"',
    fr: '`ROR`: argument == "address"',
    ru: '`ROR`: argument == "address"',
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
    es: "`ROR`: divide el valor entre 2",
    fr: "`ROR` : divise la valeur par 2",
    ru: "`ROR`: делит значение на 2",
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
    es: "`ROR`: llena la Bandera Carry con el bit 0",
    fr: "`ROR` : place le bit 0 dans le Carry Flag",
    ru: "`ROR`: записывает бит 0 во флаг переноса",
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
    es: "`ROR`: llena el bit 7 con la Bandera Carry",
    fr: "`ROR` : place le Carry Flag dans le bit 7",
    ru: "`ROR`: записывает флаг переноса в бит 7",
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
    es: "`ROR`: actualiza las banderas Zero y Negative",
    fr: "`ROR` : met à jour les Zero et Negative Flags",
    ru: "`ROR`: обновляет флаги нуля и отрицательного результата",
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
    es: '`RORa`: argument == "no"',
    fr: '`RORa`: argument == "no"',
    ru: '`RORa`: argument == "no"',
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
    es: "`RORa`: divide [A] entre 2",
    fr: "`RORa` : divise [A] par 2",
    ru: "`RORa`: делит [A] на 2",
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
    es: "`RORa`: llena la Bandera Carry con el bit 0",
    fr: "`RORa` : place le bit 0 dans le Carry Flag",
    ru: "`RORa`: записывает бит 0 во флаг переноса",
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
    es: "`RORa`: llena el bit 7 con la Bandera Carry",
    fr: "`RORa` : place le Carry Flag dans le bit 7",
    ru: "`RORa`: записывает флаг переноса в бит 7",
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
    es: "`RORa`: actualiza las banderas Zero y Negative",
    fr: "`RORa` : met à jour les Zero et Negative Flags",
    ru: "`RORa`: обновляет флаги нуля и отрицательного результата",
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
    es: '`SBC`: argument == "value"',
    fr: '`SBC`: argument == "value"',
    ru: '`SBC`: argument == "value"',
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
    es: "`SBC`: resta el valor del Acumulador - 1 cuando ~C~ está apagada",
    fr: "`SBC` : soustrait la valeur de l'Accumulateur - 1 quand ~C~ est éteint",
    ru: "`SBC`: вычитает значение из аккумулятора и ещё 1, если ~C~ сброшен",
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
    es: "`SBC`: resta el valor del Acumulador - 0 cuando ~C~ está encendida",
    fr: "`SBC` : soustrait la valeur de l'Accumulateur - 0 quand ~C~ est allumé",
    ru:
      "`SBC`: вычитает значение из аккумулятора без дополнительного вычитания, если ~C~ установлен",
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
    es: "`SBC`: actualiza las banderas Zero y Negative",
    fr: "`SBC` : met à jour les Zero et Negative Flags",
    ru: "`SBC`: обновляет флаги нуля и отрицательного результата",
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
    es: "`SBC`: actualiza las banderas Carry y Overflow",
    fr: "`SBC` : met à jour les Carry et Overflow Flags",
    ru: "`SBC`: обновляет флаги переноса и переполнения",
  },
  use: ({ id }, book) => id >= book.getId("5a.7"),
});
