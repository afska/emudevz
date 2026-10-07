const { evaluate, testHelpers, byte, lodash: _ } = $;
const { toHex } = testHelpers;

let mainModule, Console;
before(async () => {
  mainModule = await evaluate();
});

const dummyPpu = {};
const dummyControllers = [
  {
    onRead: () => 0,
    onWrite: () => {},
  },
  {
    onRead: () => 0,
    onWrite: () => {},
  },
];
const dummyMapper = {
  cpuRead: () => 0,
  cpuWrite: () => {},
  ppuRead: () => 0,
  ppuWrite: () => {},
  tick: () => {},
};
const noop = () => {};

// 5c.1 New APU

it("the file `/code/index.js` exports <an object> containing the `APU` class", () => {
  expect(mainModule.default).to.be.an("object");
  expect(mainModule.default).to.include.key("APU");
  expect(mainModule.default.APU).to.be.a.class;
})({
  locales: {
    ru: "файл `/code/index.js` экспортирует <объект>, содержащий класс `APU`",
    es:
      "el archivo `/code/index.js` exporta <un objeto> que contiene la clase `APU`",
  },
  use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("receives and saves the `cpu` property", () => {
  const APU = mainModule.default.APU;
  const cpu = {};
  const apu = new APU(cpu);
  expect(apu).to.include.key("cpu");
  expect(apu.cpu).to.equalN(cpu, "cpu");
})({
  locales: {
    ru: "принимает и сохраняет свойство `cpu`",
    es: "recibe y guarda una propiedad `cpu`",
  },
  use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("initializes the <counters>", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu).to.include.key("sampleCounter");
  expect(apu).to.include.key("sample");

  expect(apu.sampleCounter).to.equalN(0, "sampleCounter");
  expect(apu.sample).to.equalN(0, "sample");
})({
  locales: {
    ru: "инициализирует <счётчики>",
    es: "inicializa los <contadores>",
  },
  use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("increments the <sample counter> on every `step(...)` call", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  expect(apu).to.respondTo("step");

  for (let i = 0; i < 5; i++) {
    apu.step(() => {});
    expect(apu.sampleCounter).to.equalN(i + 1, "sampleCounter");
  }
})({
  locales: {
    ru: "увеличивает <счётчик отсчётов> при каждом вызове `step(...)`",
    es: "incrementa el <contador de samples> en cada llamada a `step(...)`",
  },
  use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("generates a new sample for every 20 `step(...)` calls", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  expect(apu).to.respondTo("step");
  const onSample = sinon.spy();

  apu.sample = 15;

  for (let i = 0; i < 19; i++) {
    apu.step(onSample);

    expect(apu.sampleCounter).to.equalN(i + 1, "sampleCounter");
    expect(onSample).to.not.have.been.called;
  }

  apu.step(onSample);
  expect(apu.sampleCounter).to.equalN(0, "sampleCounter");
  expect(onSample).to.have.been.calledWith(apu.sample);
})({
  locales: {
    ru: "создаёт новый отсчёт каждые 20 вызовов `step(...)`",
    es: "genera un nuevo sample por cada 20 llamadas a `step(...)`",
  },
  use: ({ id }, book) => id >= book.getId("5c.1"),
});

// 5c.4 Audio Registers

it("includes a `registers` property with 21 audio registers", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu).to.include.key("registers");
  expect(apu.registers, "registers").to.be.an("object");
  expect(apu.registers).to.respondTo("read");
  expect(apu.registers).to.respondTo("write");

  const checkRegister = (key, address, read = true, write = true) => {
    const register = _.get(apu.registers, key);
    const name = `apu.registers.${key}`;

    expect(register, name).to.be.an("object");
    expect(register.apu, name + ".apu").to.equalN(apu);
    expect(register, name).to.respondTo("onLoad");
    expect(register, name).to.respondTo("onRead");
    expect(register, name).to.respondTo("onWrite");
    expect(register, name).to.respondTo("setValue");
    expect(register, name).to.include.key("value");
    register.onRead = sinon.spy();
    register.onWrite = sinon.spy();

    apu.registers.read(address);
    apu.registers.write(address, 123);

    if (read) {
      expect(register.onRead, name + ".onRead()").to.have.been.calledOnce;
    } else {
      expect(register.onRead, name + ".onRead()").to.not.have.been.called;
    }

    if (write) {
      expect(register.onWrite, name + ".onWrite(...)").to.have.been.calledWith(
        123
      );
    } else {
      expect(register.onWrite, name + ".onWrite(...)").to.not.have.been.called;
    }
  };

  checkRegister("pulses[0].control", 0x4000);
  checkRegister("pulses[0].sweep", 0x4001);
  checkRegister("pulses[0].timerLow", 0x4002);
  checkRegister("pulses[0].timerHighLCL", 0x4003);
  checkRegister("pulses[1].control", 0x4004);
  checkRegister("pulses[1].sweep", 0x4005);
  checkRegister("pulses[1].timerLow", 0x4006);
  checkRegister("pulses[1].timerHighLCL", 0x4007);
  checkRegister("triangle.lengthControl", 0x4008);
  checkRegister("triangle.timerLow", 0x400a);
  checkRegister("triangle.timerHighLCL", 0x400b);
  checkRegister("noise.control", 0x400c);
  checkRegister("noise.form", 0x400e);
  checkRegister("noise.lcl", 0x400f);
  checkRegister("dmc.control", 0x4010);
  checkRegister("dmc.load", 0x4011);
  checkRegister("dmc.sampleAddress", 0x4012);
  checkRegister("dmc.sampleLength", 0x4013);
  checkRegister("apuStatus", 0x4015, true, false);
  checkRegister("apuControl", 0x4015, false, true);
  checkRegister("apuFrameCounter", 0x4017);
})({
  locales: {
    ru: "содержит свойство `registers` с 21 звуковым регистром",
    es: "incluye una propiedad `registers` con 21 registros de audio",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("connects the audio registers to CPU memory (<reads>)", () => {
  const CPUMemory = mainModule.default.CPUMemory;
  const cpuMemory = new CPUMemory();
  const cpu = { memory: cpuMemory };
  const APU = mainModule.default.APU;
  const apu = new APU(cpu);
  cpuMemory.onLoad(dummyPpu, apu, dummyMapper, dummyControllers);

  const checkRegister = (key, address, shouldBeAccessed = true) => {
    const register = _.get(apu.registers, key);
    expect(register, `apu.registers.${key}`).to.be.an("object");

    if (shouldBeAccessed) {
      const returnValue = 100 + address;
      register.onRead = sinon.stub().returns(returnValue);

      const result = cpuMemory.read(address);

      expect(register.onRead, `apu.registers.${key}.onRead`).to.have.been
        .calledOnce;

      try {
        expect(result).to.equal(returnValue);
      } catch (e) {
        throw new Error(
          `\`cpuMemory.read(${toHex(
            address
          )})\` did call \`${key}.onRead()\`, but it didn't return the value that the register provided.`
        );
      }
    } else {
      register.onRead = sinon.spy();

      cpuMemory.read(address);

      expect(register.onRead, `apu.registers.${key}.onRead`).to.not.have.been
        .called;
    }
  };

  checkRegister("pulses[0].control", 0x4000);
  checkRegister("pulses[0].sweep", 0x4001);
  checkRegister("pulses[0].timerLow", 0x4002);
  checkRegister("pulses[0].timerHighLCL", 0x4003);
  checkRegister("pulses[1].control", 0x4004);
  checkRegister("pulses[1].sweep", 0x4005);
  checkRegister("pulses[1].timerLow", 0x4006);
  checkRegister("pulses[1].timerHighLCL", 0x4007);
  checkRegister("triangle.lengthControl", 0x4008);
  checkRegister("triangle.timerLow", 0x400a);
  checkRegister("triangle.timerHighLCL", 0x400b);
  checkRegister("noise.control", 0x400c);
  checkRegister("noise.form", 0x400e);
  checkRegister("noise.lcl", 0x400f);
  checkRegister("dmc.control", 0x4010);
  checkRegister("dmc.load", 0x4011);
  checkRegister("dmc.sampleAddress", 0x4012);
  checkRegister("dmc.sampleLength", 0x4013);
  checkRegister("apuStatus", 0x4015);
  checkRegister("apuControl", 0x4015, false);
  checkRegister("apuFrameCounter", 0x4017, false);
})({
  locales: {
    ru: "подключает звуковые регистры к памяти CPU (<чтение>)",
    es: "conecta los registros de audio con la memoria de CPU (<lecturas>)",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("connects the audio registers to CPU memory (<writes>)", () => {
  const CPUMemory = mainModule.default.CPUMemory;
  const cpuMemory = new CPUMemory();
  const cpu = { memory: cpuMemory };
  const APU = mainModule.default.APU;
  const apu = new APU(cpu);
  cpuMemory.onLoad(dummyPpu, apu, dummyMapper, dummyControllers);

  const checkRegister = (key, address, shouldBeAccessed = true) => {
    const register = _.get(apu.registers, key);
    expect(register, `apu.registers.${key}`).to.be.an("object");
    register.onWrite = sinon.spy();

    cpuMemory.write(address, 123);

    if (shouldBeAccessed) {
      expect(
        register.onWrite,
        `apu.registers.${key}.onWrite`
      ).to.have.been.calledWith(123);
    } else {
      expect(register.onWrite, `apu.registers.${key}.onWrite`).to.not.have.been
        .called;
    }
  };

  checkRegister("pulses[0].control", 0x4000);
  checkRegister("pulses[0].sweep", 0x4001);
  checkRegister("pulses[0].timerLow", 0x4002);
  checkRegister("pulses[0].timerHighLCL", 0x4003);
  checkRegister("pulses[1].control", 0x4004);
  checkRegister("pulses[1].sweep", 0x4005);
  checkRegister("pulses[1].timerLow", 0x4006);
  checkRegister("pulses[1].timerHighLCL", 0x4007);
  checkRegister("triangle.lengthControl", 0x4008);
  checkRegister("triangle.timerLow", 0x400a);
  checkRegister("triangle.timerHighLCL", 0x400b);
  checkRegister("noise.control", 0x400c);
  checkRegister("noise.form", 0x400e);
  checkRegister("noise.lcl", 0x400f);
  checkRegister("dmc.control", 0x4010);
  checkRegister("dmc.load", 0x4011);
  checkRegister("dmc.sampleAddress", 0x4012);
  checkRegister("dmc.sampleLength", 0x4013);
  checkRegister("apuStatus", 0x4015, false);
  checkRegister("apuControl", 0x4015);
  checkRegister("apuFrameCounter", 0x4017);
})({
  locales: {
    ru: "подключает звуковые регистры к памяти CPU (<запись>)",
    es: "conecta los registros de audio con la memoria de CPU (<escrituras>)",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("except `APUStatus`, all registers are <write only>", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  [
    ...Object.values(apu.registers.pulses[0]),
    ...Object.values(apu.registers.pulses[1]),
    ...Object.values(apu.registers.triangle),
    ...Object.values(apu.registers.noise),
    ...Object.values(apu.registers.dmc),
    apu.registers.apuControl,
    apu.registers.apuFrameCounter,
  ].forEach((register) => {
    register.onWrite(byte.random());
    expect(register.onRead()).to.equalN(0, "onRead()");
  });
})({
  locales: {
    ru: "все регистры, кроме `APUStatus`, доступны <только для записи>",
    es: "excepto `APUStatus`, todos los registros son <solo escritura>",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`PulseControl`: writes `volumeOrEnvelopePeriod` (bits ~0-3~)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  [
    ["pulse1Control", apu.registers.pulses[0].control],
    ["pulse2Control", apu.registers.pulses[1].control],
  ].forEach(([name, register]) => {
    const key = `${name}.volumeOrEnvelopePeriod`;

    register.onWrite(0b10100000);
    expect(register.volumeOrEnvelopePeriod).to.equalN(0, key);
    register.onWrite(0b10100001);
    expect(register.volumeOrEnvelopePeriod).to.equalN(1, key);
    register.onWrite(0b10100110);
    expect(register.volumeOrEnvelopePeriod).to.equalN(6, key);
    register.onWrite(0b10101111);
    expect(register.volumeOrEnvelopePeriod).to.equalN(15, key);
  });
})({
  locales: {
    ru: "`PulseControl`: записывает `volumeOrEnvelopePeriod` (биты ~0-3~)",
    es: "`PulseControl`: escribe `volumeOrEnvelopePeriod` (bits ~0-3~)",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`PulseControl`: writes `constantVolume` (bit 4)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  [
    ["pulse1Control", apu.registers.pulses[0].control],
    ["pulse2Control", apu.registers.pulses[1].control],
  ].forEach(([name, register]) => {
    const key = `${name}.constantVolume`;

    register.onWrite(0b10100011);
    expect(register.constantVolume).to.equalN(0, key);
    register.onWrite(0b10110011);
    expect(register.constantVolume).to.equalN(1, key);
  });
})({
  locales: {
    ru: "`PulseControl`: записывает `constantVolume` (бит 4)",
    es: "`PulseControl`: escribe `constantVolume` (bit 4)",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`PulseControl`: writes `envelopeLoopOrLengthCounterHalt` (bit 5)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  [
    ["pulse1Control", apu.registers.pulses[0].control],
    ["pulse2Control", apu.registers.pulses[1].control],
  ].forEach(([name, register]) => {
    const key = `${name}.envelopeLoopOrLengthCounterHalt`;

    register.onWrite(0b10000011);
    expect(register.envelopeLoopOrLengthCounterHalt).to.equalN(0, key);
    register.onWrite(0b10100011);
    expect(register.envelopeLoopOrLengthCounterHalt).to.equalN(1, key);
  });
})({
  locales: {
    ru: "`PulseControl`: записывает `envelopeLoopOrLengthCounterHalt` (бит 5)",
    es: "`PulseControl`: escribe `envelopeLoopOrLengthCounterHalt` (bit 5)",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`PulseControl`: writes `dutyCycleId` (bits ~6-7~)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  [
    ["pulse1Control", apu.registers.pulses[0].control],
    ["pulse2Control", apu.registers.pulses[1].control],
  ].forEach(([name, register]) => {
    const key = `${name}.dutyCycleId`;

    register.onWrite(0b00000011);
    expect(register.dutyCycleId).to.equalN(0, key);
    register.onWrite(0b01000011);
    expect(register.dutyCycleId).to.equalN(1, key);
    register.onWrite(0b10000011);
    expect(register.dutyCycleId).to.equalN(2, key);
    register.onWrite(0b11000011);
    expect(register.dutyCycleId).to.equalN(3, key);
  });
})({
  locales: {
    ru: "`PulseControl`: записывает `dutyCycleId` (биты ~6-7~)",
    es: "`PulseControl`: escribe `dutyCycleId` (bits ~6-7~)",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`TriangleTimerLow`: writes the value", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const triangleTimerLow = apu.registers.triangle.timerLow;
  triangleTimerLow.onWrite(129);
  expect(triangleTimerLow.value).to.equalN(129, "triangle.timerLow.value");
})({
  locales: {
    ru: "`TriangleTimerLow`: записывает значение",
    es: "`TriangleTimerLow`: escribe el valor",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`DMCControl`: writes `dpcmPeriodId` (bits ~0-3~)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const dmcControl = apu.registers.dmc.control;

  dmcControl.onWrite(0b10100000);
  expect(dmcControl.dpcmPeriodId).to.equalN(0, "dmc.control.dpcmPeriodId");
  dmcControl.onWrite(0b10100001);
  expect(dmcControl.dpcmPeriodId).to.equalN(1, "dmc.control.dpcmPeriodId");
  dmcControl.onWrite(0b10100110);
  expect(dmcControl.dpcmPeriodId).to.equalN(6, "dmc.control.dpcmPeriodId");
  dmcControl.onWrite(0b10101111);
  expect(dmcControl.dpcmPeriodId).to.equalN(15, "dmc.control.dpcmPeriodId");
})({
  locales: {
    ru: "`DMCControl`: записывает `dpcmPeriodId` (биты ~0-3~)",
    es: "`DMCControl`: escribe `dpcmPeriodId` (bits ~0-3~)",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`DMCControl`: writes `loop` (bit 6)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const dmcControl = apu.registers.dmc.control;

  dmcControl.onWrite(0b10000011);
  expect(dmcControl.loop).to.equalN(0, "dmc.control.loop");
  dmcControl.onWrite(0b11000011);
  expect(dmcControl.loop).to.equalN(1, "dmc.control.loop");
})({
  locales: {
    ru: "`DMCControl`: записывает `loop` (бит 6)",
    es: "`DMCControl`: escribe `loop` (bit 6)",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`DMCSampleAddress`: writes the value", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const dmcSampleAddress = apu.registers.dmc.sampleAddress;
  dmcSampleAddress.onWrite(135);
  expect(dmcSampleAddress.value).to.equalN(135, "dmc.sampleAddress.value");
})({
  locales: {
    ru: "`DMCSampleAddress`: записывает значение",
    es: "`DMCSampleAddress`: escribe el valor",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`DMCSampleLength`: writes the value", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const dmcSampleLength = apu.registers.dmc.sampleLength;
  dmcSampleLength.onWrite(172);
  expect(dmcSampleLength.value).to.equalN(172, "dmc.sampleLength.value");
})({
  locales: {
    ru: "`DMCSampleLength`: записывает значение",
    es: "`DMCSampleLength`: escribe el valor",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`APUControl`: writes the <channel enable> fields (bits ~0-4~)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const register = apu.registers.apuControl;

  register.onWrite(0b10100);
  expect(register.enablePulse1).to.equalN(0, "enablePulse1");
  expect(register.enablePulse2).to.equalN(0, "enablePulse2");
  expect(register.enableTriangle).to.equalN(1, "enableTriangle");
  expect(register.enableNoise).to.equalN(0, "enableNoise");
  expect(register.enableDMC).to.equalN(1, "enableDMC");

  register.onWrite(0b01001);
  expect(register.enablePulse1).to.equalN(1, "enablePulse1");
  expect(register.enablePulse2).to.equalN(0, "enablePulse2");
  expect(register.enableTriangle).to.equalN(0, "enableTriangle");
  expect(register.enableNoise).to.equalN(1, "enableNoise");
  expect(register.enableDMC).to.equalN(0, "enableDMC");

  register.onWrite(0b11010);
  expect(register.enablePulse1).to.equalN(0, "enablePulse1");
  expect(register.enablePulse2).to.equalN(1, "enablePulse2");
  expect(register.enableTriangle).to.equalN(0, "enableTriangle");
  expect(register.enableNoise).to.equalN(1, "enableNoise");
  expect(register.enableDMC).to.equalN(1, "enableDMC");

  register.onWrite(0b11111);
  expect(register.enablePulse1).to.equalN(1, "enablePulse1");
  expect(register.enablePulse2).to.equalN(1, "enablePulse2");
  expect(register.enableTriangle).to.equalN(1, "enableTriangle");
  expect(register.enableNoise).to.equalN(1, "enableNoise");
  expect(register.enableDMC).to.equalN(1, "enableDMC");
})({
  locales: {
    ru: "`APUControl`: записывает поля <включения каналов> (биты ~0-4~)",
    es:
      "`APUControl`: escribe los campos de <habilitación de canales> (bits ~0-4~)",
  },
  use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`APUStatus`: reads return 0 (for now)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const control = apu.registers.apuControl;

  control.onWrite(0b10100);
  expect(apu.registers.apuStatus.onRead()).to.equalN(0, "onRead()");

  control.onWrite(0b01001);
  expect(apu.registers.apuStatus.onRead()).to.equalN(0, "onRead()");

  control.onWrite(0b11010);
  expect(apu.registers.apuStatus.onRead()).to.equalN(0, "onRead()");

  control.onWrite(0b11111);
  expect(apu.registers.apuStatus.onRead()).to.equalN(0, "onRead()");
})({
  locales: {
    ru: "`APUStatus`: чтение возвращает 0 (пока)",
    es: "`APUStatus`: las lecturas retornan 0 (por ahora)",
  },
  use: ({ id }, book) => id >= book.getId("5c.4") && id < book.getId("5c.19"),
});

// 5c.5 Pulse Channels (1/5): Channel setup

it("has `PulseChannel` instances", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels, "channels").to.be.an("object");
  expect(apu.channels.pulses, "pulses").to.be.an("array");
  expect(apu.channels.pulses.length).to.equalN(2, "pulses.length");

  for (let i = 0; i < 2; i++) {
    expect(apu.channels.pulses[i], `pulses[${i}]`).to.be.an("object");
    expect(apu.channels.pulses[i].constructor, `pulses[${i}].constructor`).to.be
      .a.class;
  }

  const pulse1Class = apu.channels.pulses[0].constructor;
  const pulse2Class = apu.channels.pulses[1].constructor;
  expect(pulse1Class).to.equalN(pulse2Class, "class");
  expect(apu.channels.pulses[0]).to.not.equalN(
    apu.channels.pulses[1],
    "instance"
  );
})({
  locales: {
    ru: "содержит экземпляры `PulseChannel`",
    es: "tiene instancias de `PulseChannel`",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has an `apu` reference", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++)
    expect(apu.channels.pulses[i].apu).to.equalN(apu, `[${i}].apu`);
})({
  locales: {
    ru: "`PulseChannel`: содержит ссылку `apu`",
    es: "`PulseChannel`: tiene una referencia `apu`",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has an `id`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++)
    expect(apu.channels.pulses[i].id).to.equalN(i, `[${i}].id`);
})({
  locales: {
    ru: "`PulseChannel`: содержит `id`",
    es: "`PulseChannel`: tiene un `id`",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has an `enableFlagName`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const pulse1FlagName = apu.channels.pulses[0].enableFlagName;
  const pulse2FlagName = apu.channels.pulses[1].enableFlagName;
  expect(pulse1FlagName).to.equalN("enablePulse1", "enableFlagName");
  expect(pulse2FlagName).to.equalN("enablePulse2", "enableFlagName");
})({
  locales: {
    ru: "`PulseChannel`: содержит `enableFlagName`",
    es: "`PulseChannel`: tiene un `enableFlagName`",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has a `timer` initialized at 0", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++)
    expect(apu.channels.pulses[i].timer).to.equalN(0, "`[${i}].timer`");
})({
  locales: {
    ru: "`PulseChannel`: содержит `timer` с начальным значением 0",
    es: "`PulseChannel`: tiene un `timer` inicializado en 0",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has a `registers` property, pointing to the audio registers", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++)
    expect(apu.channels.pulses[i].registers).to.equalN(
      apu.registers.pulses[i],
      `[${i}].registers`
    );
})({
  locales: {
    ru:
      "`PulseChannel`: содержит свойство `registers`, указывающее на звуковые регистры",
    es:
      "`PulseChannel`: tiene una propiedad `registers`, apuntando a los registros de audio",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has an `isEnabled()` method that returns whether the channel is <enabled> or not in APUControl", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.pulses[0]).to.respondTo("isEnabled");
  expect(apu.channels.pulses[1]).to.respondTo("isEnabled");

  apu.registers.apuControl.onWrite(0b00);
  expect(apu.channels.pulses[0].isEnabled()).to.equalN(false, "isEnabled()");
  expect(apu.channels.pulses[1].isEnabled()).to.equalN(false, "isEnabled()");

  apu.registers.apuControl.onWrite(0b01);
  expect(apu.channels.pulses[0].isEnabled()).to.equalN(true, "isEnabled()");
  expect(apu.channels.pulses[1].isEnabled()).to.equalN(false, "isEnabled()");

  apu.registers.apuControl.onWrite(0b10);
  expect(apu.channels.pulses[0].isEnabled()).to.equalN(false, "isEnabled()");
  expect(apu.channels.pulses[1].isEnabled()).to.equalN(true, "isEnabled()");

  apu.registers.apuControl.onWrite(0b11);
  expect(apu.channels.pulses[0].isEnabled()).to.equalN(true, "isEnabled()");
  expect(apu.channels.pulses[1].isEnabled()).to.equalN(true, "isEnabled()");
})({
  locales: {
    ru:
      "`PulseChannel`: содержит метод `isEnabled()`, который возвращает, <включён> ли канал в APUControl",
    es:
      "`PulseChannel`: tiene un método `isEnabled()` que retorna si el canal está <activo> o no en APUControl",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has a `sample()` method that <returns a number>", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    expect(apu.channels.pulses[i]).to.respondTo("sample");
    expect(apu.channels.pulses[i].sample()).to.be.a("number");
  }
})({
  locales: {
    ru: "`PulseChannel`: содержит метод `sample()`, который <возвращает число>",
    es: "`PulseChannel`: tiene un método `sample()` que <retorna un número>",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: `updateTimer()` updates `timer` based on PulseTimerLow and PulseTimerHighLCL", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.registers.pulses[0].timerLow.onWrite(251);
  apu.registers.pulses[0].timerHighLCL.onWrite(1);

  apu.registers.pulses[1].timerLow.onWrite(196);
  apu.registers.pulses[1].timerHighLCL.onWrite(2);

  expect(apu.channels.pulses[0]).to.respondTo("updateTimer");
  apu.channels.pulses[0].updateTimer();
  expect(apu.channels.pulses[0].timer).to.equalN(507, "timer");
  expect(apu.channels.pulses[1]).to.respondTo("updateTimer");
  apu.channels.pulses[1].updateTimer();
  expect(apu.channels.pulses[1].timer).to.equalN(708, "timer");
})({
  locales: {
    ru:
      "`PulseChannel`: `updateTimer()` обновляет `timer` по PulseTimerLow и PulseTimerHighLCL",
    es:
      "`PulseChannel`: `updateTimer()` actualiza `timer` basado en PulseTimerLow y PulseTimerHighLCL",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: `step()` calls `updateTimer()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    apu.channels.pulses[i].updateTimer = sinon.spy();
    expect(apu.channels.pulses[i]).to.respondTo("step");
    apu.channels.pulses[i].step();
    expect(apu.channels.pulses[i].updateTimer).to.have.been.called;
  }
})({
  locales: {
    ru: "`PulseChannel`: `step()` вызывает `updateTimer()`",
    es: "`PulseChannel`: `step()` llama a `updateTimer()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("calls Pulse Channels' `step()` method on every APU `step(...)` call", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    apu.channels.pulses[i].step = sinon.spy();
  }

  apu.step(() => {});

  for (let i = 0; i < 2; i++) {
    expect(apu.channels.pulses[i].step).to.have.been.called;
  }
})({
  locales: {
    ru:
      "вызывает метод `step()` импульсных каналов при каждом вызове `step(...)` APU",
    es:
      "llama al método `step()` de los Canales Pulso en cada llamado a `step(...)` de la APU",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("for now, new samples are mixed like `(pulse1 + pulse2) * 0.01`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  expect(apu).to.respondTo("step");
  const onSample = sinon.spy();

  apu.channels.pulses[0].sample = () => 2;
  apu.channels.pulses[1].sample = () => 5;

  for (let i = 0; i < 19; i++) {
    apu.step(onSample);
    expect(onSample).to.not.have.been.called;
  }

  apu.step(onSample);
  expect(onSample).to.have.been.calledWith(0.07, 2, 5); // (2 + 5) * 0.01
})({
  locales: {
    ru: "пока новые отсчёты смешиваются по формуле `(pulse1 + pulse2) * 0.01`",
    es:
      "por ahora, los nuevos samples se mezclan como `(pulse1 + pulse2) * 0.01`",
  },
  use: ({ id }, book) => id >= book.getId("5c.5") && id < book.getId("5c.19"),
});

it("`PulseTimerLow`: writes the value and calls `updateTimer()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.pulses[0].updateTimer = sinon.spy();
  apu.channels.pulses[1].updateTimer = sinon.spy();

  apu.registers.write(0x4002, 251); // Pulse1TimerLow
  expect(apu.registers.pulses[0].timerLow.value).to.equalN(251, "value");
  expect(apu.channels.pulses[0].updateTimer, "updateTimer").to.have.been.called;

  apu.registers.write(0x4006, 196); // Pulse2TimerLow
  expect(apu.registers.pulses[1].timerLow.value).to.equalN(196, "value");
  expect(apu.channels.pulses[1].updateTimer, "updateTimer").to.have.been.called;
})({
  locales: {
    ru: "`PulseTimerLow`: записывает значение и вызывает `updateTimer()`",
    es: "`PulseTimerLow`: escribe el valor y llama a `updateTimer()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseTimerHighLCL`: writes `timerHigh` (bits ~0-2~) and calls `updateTimer()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.pulses[0].updateTimer = sinon.spy();
  apu.channels.pulses[1].updateTimer = sinon.spy();

  apu.registers.write(0x4003, 5); // Pulse1TimerHighLCL
  expect(apu.registers.pulses[0].timerHighLCL.timerHigh).to.equalN(
    5,
    "timerHigh"
  );
  expect(apu.channels.pulses[0].updateTimer, "updateTimer").to.have.been.called;

  apu.registers.write(0x4007, 7); // Pulse2TimerHighLCL
  expect(apu.registers.pulses[1].timerHighLCL.timerHigh).to.equalN(
    7,
    "timerHigh"
  );
  expect(apu.channels.pulses[1].updateTimer, "updateTimer").to.have.been.called;
})({
  locales: {
    ru:
      "`PulseTimerHighLCL`: записывает `timerHigh` (биты ~0-2~) и вызывает `updateTimer()`",
    es:
      "`PulseTimerHighLCL`: escribe `timerHigh` (bits ~0-2~) y llama a `updateTimer()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.5"),
});

// 5c.6 Pulse Channels (2/5): Producing pulse waves

it("`PulseChannel`: has an `oscillator` that can <produce> samples", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    expect(apu.channels.pulses[i], `[${i}].oscillator`).to.be.an("object");
    expect(apu.channels.pulses[i].oscillator.frequency).to.equalN(
      0,
      `[${i}].frequency`
    );
    expect(apu.channels.pulses[i].oscillator.dutyCycle).to.equalN(
      0,
      `[${i}].dutyCycle`
    );
    expect(apu.channels.pulses[i].oscillator.volume).to.equalN(
      15,
      `[${i}].volume`
    );
    expect(apu.channels.pulses[i].oscillator).to.respondTo("sample");
  }
})({
  locales: {
    ru:
      "`PulseChannel`: содержит `oscillator`, который умеет <создавать> отсчёты",
    es: "`PulseChannel`: tiene un `oscillator` que puede <producir> samples",
  },
  use: ({ id }, book) => id >= book.getId("5c.6"),
});

it("`PulseChannel`: `sample()` updates the oscillator frequency", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // enable all channels, max volume, length counter halt & load
  apu.registers.apuControl.setValue(0b11111111);
  for (let i = 0; i < 2; i++) {
    apu.registers.pulses[i].control.onWrite(0b00111111);
    apu.registers.pulses[i].timerHighLCL.onWrite(0b11111111);
  }

  apu.channels.pulses[0].timer = 507; // => freq = 220
  apu.channels.pulses[0].sample();
  const pulse1Frequency = Math.floor(
    apu.channels.pulses[0].oscillator.frequency
  );
  expect(pulse1Frequency).to.equalN(220, "frequency");

  apu.channels.pulses[1].timer = 708; // => freq = 157
  apu.channels.pulses[1].sample();
  const pulse2Frequency = Math.floor(
    apu.channels.pulses[1].oscillator.frequency
  );
  expect(pulse2Frequency).to.equalN(157, "frequency");
})({
  locales: {
    ru: "`PulseChannel`: `sample()` обновляет частоту генератора",
    es: "`PulseChannel`: `sample()` actualiza la frecuencia del oscilador",
  },
  use: ({ id }, book) => id >= book.getId("5c.6"),
});

it("`PulseChannel`: `sample()` updates the oscillator duty cycle", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // enable all channels, max volume, length counter halt & load
  apu.registers.apuControl.setValue(0b11111111);
  for (let i = 0; i < 2; i++) {
    apu.registers.pulses[i].control.onWrite(0b00111111);
    apu.registers.pulses[i].timerHighLCL.onWrite(0b11111111);
  }

  for (let i = 0; i < 2; i++) {
    const key = `[${i}].dutyCycle`;

    apu.channels.pulses[i].registers.control.onWrite(0b00000000);
    apu.channels.pulses[i].sample();
    expect(apu.channels.pulses[i].oscillator.dutyCycle).to.equalN(0, key);

    apu.channels.pulses[i].registers.control.onWrite(0b01000000);
    apu.channels.pulses[i].sample();
    expect(apu.channels.pulses[i].oscillator.dutyCycle).to.equalN(1, key);

    apu.channels.pulses[i].registers.control.onWrite(0b10000000);
    apu.channels.pulses[i].sample();
    expect(apu.channels.pulses[i].oscillator.dutyCycle).to.equalN(2, key);

    apu.channels.pulses[i].registers.control.onWrite(0b11000000);
    apu.channels.pulses[i].sample();
    expect(apu.channels.pulses[i].oscillator.dutyCycle).to.equalN(3, key);
  }
})({
  locales: {
    ru:
      "`PulseChannel`: `sample()` обновляет коэффициент заполнения генератора",
    es:
      "`PulseChannel`: `sample()` actualiza el ciclo de trabajo del oscilador",
  },
  use: ({ id }, book) => id >= book.getId("5c.6"),
});

it("`PulseChannel`: `sample()` updates the oscillator volume", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // enable all channels, max volume, length counter halt & load
  apu.registers.apuControl.setValue(0b11111111);
  for (let i = 0; i < 2; i++) {
    apu.registers.pulses[i].control.onWrite(0b00111111);
    apu.registers.pulses[i].timerHighLCL.onWrite(0b11111111);
  }

  apu.channels.pulses[0].registers.control.onWrite(0b00111100);
  apu.channels.pulses[1].registers.control.onWrite(0b00111011);

  apu.channels.pulses[0].sample();
  expect(apu.channels.pulses[0].oscillator.volume).to.equalBin(
    0b1100,
    "volume"
  );

  apu.channels.pulses[1].sample();
  expect(apu.channels.pulses[1].oscillator.volume).to.equalBin(
    0b1011,
    "volume"
  );
})({
  locales: {
    ru: "`PulseChannel`: `sample()` обновляет громкость генератора",
    es: "`PulseChannel`: `sample()` actualiza el volumen del oscilador",
  },
  use: ({ id }, book) => id >= book.getId("5c.6"),
});

it("`PulseChannel`: `sample()` calls `oscillator.sample()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // enable all channels, max volume, length counter halt & load
  apu.registers.apuControl.setValue(0b11111111);
  for (let i = 0; i < 2; i++) {
    apu.registers.pulses[i].control.onWrite(0b00111111);
    apu.registers.pulses[i].timerHighLCL.onWrite(0b11111111);
  }

  const random1 = byte.random();
  const random2 = byte.random();
  apu.channels.pulses[0].oscillator.sample = function () {
    return random1;
  };
  apu.channels.pulses[1].oscillator.sample = function () {
    return random2;
  };

  expect(apu.channels.pulses[0].sample()).to.equalN(random1, "[0].sample()");
  expect(apu.channels.pulses[1].sample()).to.equalN(random2, "[1].sample()");
})({
  locales: {
    ru: "`PulseChannel`: `sample()` вызывает `oscillator.sample()`",
    es: "`PulseChannel`: `sample()` llama a `oscillator.sample()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.6"),
});

// 5c.7 Frame Sequencer

it("`APUFrameCounter`: writes `use5StepSequencer` (bit 7)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const register = apu.registers.apuFrameCounter;

  register.onWrite(0b10000011);
  expect(register.use5StepSequencer).to.equalN(1, "use5StepSequencer");
  register.onWrite(0b00100011);
  expect(register.use5StepSequencer).to.equalN(0, "use5StepSequencer");
})({
  locales: {
    ru: "`APUFrameCounter`: записывает `use5StepSequencer` (бит 7)",
    es: "`APUFrameCounter`: escribe `use5StepSequencer` (bit 7)",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`APUFrameCounter`: writing <resets> the frame sequencer", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const register = apu.registers.apuFrameCounter;

  apu.frameSequencer.counter = 8;
  register.onWrite(0b10000011);
  expect(apu.frameSequencer.counter).to.equalN(0, "counter");
})({
  locales: {
    ru: "`APUFrameCounter`: запись <сбрасывает> секвенсор кадров",
    es: "`APUFrameCounter`: escribir <reinicia> el secuenciador de frames",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`APUFrameCounter`: writing triggers both a quarter frame and a half frame", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const register = apu.registers.apuFrameCounter;

  apu.onQuarterFrameClock = sinon.spy();
  apu.onHalfFrameClock = sinon.spy();

  register.onWrite(0b10000011);

  expect(apu.onQuarterFrameClock, "onQuarterFrameClock").to.have.been
    .calledOnce;
  expect(apu.onHalfFrameClock, "onHalfFrameClock").to.have.been.calledOnce;
})({
  locales: {
    ru: "`APUFrameCounter`: запись вызывает события четверти и половины кадра",
    es:
      "`APUFrameCounter`: escribir dispara tanto un quarter frame como un half frame",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("has a `frameSequencer` property", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.frameSequencer, "frameSequencer").to.be.an("object");
})({
  locales: {
    ru: "содержит свойство `frameSequencer`",
    es: "tiene una propiedad `frameSequencer`",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`FrameSequencer`: has a `counter` property and `reset()`/`step()` methods", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.frameSequencer.counter).to.equalN(0, "counter");
  expect(apu.frameSequencer).to.respondTo("reset");
  expect(apu.frameSequencer).to.respondTo("step");
})({
  locales: {
    ru:
      "`FrameSequencer`: содержит свойство `counter` и методы `reset()`/`step()`",
    es:
      "`FrameSequencer`: tiene una propiedad `counter` y métodos `reset()`/`step()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`FrameSequencer`: `reset()` assigns 0 to `counter`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.frameSequencer.counter = 78;
  apu.frameSequencer.reset();
  expect(apu.frameSequencer.counter).to.equalN(0, "counter");
})({
  locales: {
    ru: "`FrameSequencer`: `reset()` присваивает `counter` значение 0",
    es: "`FrameSequencer`: `reset()` asigna 0 a `counter`",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`FrameSequencer`: `step()` increments `counter`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.frameSequencer.counter = 78;
  apu.frameSequencer.step();
  expect(apu.frameSequencer.counter).to.equalN(79, "counter");
})({
  locales: {
    ru: "`FrameSequencer`: `step()` увеличивает `counter`",
    es: "`FrameSequencer`: `step()` incrementa `counter`",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`FrameSequencer`: on four-step sequences, `step()` triggers quarter frames on cycles 3729, 7457, 11186, 14916", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.onQuarterFrameClock = sinon.spy();
  apu.registers.apuFrameCounter.setValue(0); // 4-step

  for (let i = 0; i < 14917; i++) {
    apu.onQuarterFrameClock.resetHistory();
    apu.frameSequencer.step();
    const newCount = i + 1;
    const isQuarter =
      newCount === 3729 ||
      newCount === 7457 ||
      newCount === 11186 ||
      newCount === 14916;

    const name = `onQuarterFrameClock (counter: ${apu.frameSequencer.counter})`;
    if (isQuarter) {
      expect(apu.onQuarterFrameClock, name).to.have.been.calledOnce;
    } else {
      expect(apu.onQuarterFrameClock, name).to.not.have.been.called;
    }
  }
})({
  locales: {
    ru:
      "`FrameSequencer`: в последовательности из четырёх шагов `step()` вызывает четверти кадра на циклах 3729, 7457, 11186, 14916",
    es:
      "`FrameSequencer`: en secuencias de cuatro pasos, `step()` dispara quarter frames en los ciclos 3729, 7457, 11186, 14916",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`FrameSequencer`: on four-step sequences, `step()` triggers half frames on cycles 7457, 14916", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.onHalfFrameClock = sinon.spy();
  apu.registers.apuFrameCounter.setValue(0); // 4-step

  for (let i = 0; i < 14917; i++) {
    apu.onHalfFrameClock.resetHistory();
    apu.frameSequencer.step();
    const newCount = i + 1;
    const isHalf = newCount === 7457 || newCount === 14916;

    const name = `onHalfFrameClock (counter: ${apu.frameSequencer.counter})`;
    if (isHalf) {
      expect(apu.onHalfFrameClock, name).to.have.been.calledOnce;
    } else {
      expect(apu.onHalfFrameClock, name).to.not.have.been.called;
    }
  }
})({
  locales: {
    ru:
      "`FrameSequencer`: в последовательности из четырёх шагов `step()` вызывает половины кадра на циклах 7457, 14916",
    es:
      "`FrameSequencer`: en secuencias de cuatro pasos, `step()` dispara half frames en los ciclos 7457, 14916",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`FrameSequencer`: on four-step sequences, `step()` resets the counter on cycle 14916", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.registers.apuFrameCounter.setValue(0); // 4-step

  for (let i = 0; i < 14915; i++) {
    apu.frameSequencer.step();
    const newCount = i + 1;
    expect(apu.frameSequencer.counter).to.equalN(newCount, "counter");
  }

  apu.frameSequencer.step();
  expect(apu.frameSequencer.counter).to.equalN(0, "counter");
})({
  locales: {
    ru:
      "`FrameSequencer`: в последовательности из четырёх шагов `step()` сбрасывает счётчик на цикле 14916",
    es:
      "`FrameSequencer`: en secuencias de cuatro pasos, `step()` reinicia el contador en el ciclo 14916",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`FrameSequencer`: on five-step sequences, `step()` triggers quarter frames on cycles 3729, 7457, 11186, 18641", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.onQuarterFrameClock = sinon.spy();
  apu.registers.apuFrameCounter.setValue(0b10000000); // 5-step

  for (let i = 0; i < 18642; i++) {
    apu.onQuarterFrameClock.resetHistory();
    apu.frameSequencer.step();
    const newCount = i + 1;
    const isQuarter =
      newCount === 3729 ||
      newCount === 7457 ||
      newCount === 11186 ||
      newCount === 18641;

    const name = `onQuarterFrameClock (counter: ${apu.frameSequencer.counter})`;
    if (isQuarter) {
      expect(apu.onQuarterFrameClock, name).to.have.been.calledOnce;
    } else {
      expect(apu.onQuarterFrameClock, name).to.not.have.been.called;
    }
  }
})({
  locales: {
    ru:
      "`FrameSequencer`: в последовательности из пяти шагов `step()` вызывает четверти кадра на циклах 3729, 7457, 11186, 18641",
    es:
      "`FrameSequencer`: en secuencias de cinco pasos, `step()` dispara quarter frames en los ciclos 3729, 7457, 11186, 14916",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`FrameSequencer`: on five-step sequences, `step()` triggers half frames on cycles 7457, 18641", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.onHalfFrameClock = sinon.spy();
  apu.registers.apuFrameCounter.setValue(0b10000000); // 5-step

  for (let i = 0; i < 18642; i++) {
    apu.onHalfFrameClock.resetHistory();
    apu.frameSequencer.step();
    const newCount = i + 1;
    const isHalf = newCount === 7457 || newCount === 18641;

    const name = `onHalfFrameClock (counter: ${apu.frameSequencer.counter})`;
    if (isHalf) {
      expect(apu.onHalfFrameClock, name).to.have.been.calledOnce;
    } else {
      expect(apu.onHalfFrameClock, name).to.not.have.been.called;
    }
  }
})({
  locales: {
    ru:
      "`FrameSequencer`: в последовательности из пяти шагов `step()` вызывает половины кадра на циклах 7457, 18641",
    es:
      "`FrameSequencer`: en secuencias de cinco pasos, `step()` dispara half frames en los ciclos 7457, 18641",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`FrameSequencer`: on five-step sequences, `step()` resets the counter on cycle 18641", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.registers.apuFrameCounter.setValue(0b10000000); // 5-step

  for (let i = 0; i < 18640; i++) {
    apu.frameSequencer.step();
    const newCount = i + 1;
    expect(apu.frameSequencer.counter).to.equalN(newCount, "counter");
  }

  apu.frameSequencer.step();
  expect(apu.frameSequencer.counter).to.equalN(0, "counter");
})({
  locales: {
    ru:
      "`FrameSequencer`: в последовательности из пяти шагов `step()` сбрасывает счётчик на цикле 18641",
    es:
      "`FrameSequencer`: en secuencias de cinco pasos, `step()` reinicia el contador en el ciclo 14916",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("has two methods: `onQuarterFrameClock()` and `onHalfFrameClock()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu).to.respondTo("onQuarterFrameClock");
  expect(apu).to.respondTo("onHalfFrameClock");
})({
  locales: {
    ru: "содержит два метода: `onQuarterFrameClock()` и `onHalfFrameClock()`",
    es: "tiene dos métodos: `onQuarterFrameClock()` y `onHalfFrameClock()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("updates the frame sequencer on every `step(...)` call", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 5; i++) {
    apu.frameSequencer.step = sinon.spy();
    apu.step(() => {});
    expect(apu.frameSequencer.step, "frameSequencer.step").to.have.been
      .calledOnce;
  }
})({
  locales: {
    ru: "обновляет секвенсор кадров при каждом вызове `step(...)`",
    es: "actualiza el secuenciador de frames en cada llamada a `step(...)`",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("calls `frameSequencer.step()` <before> calling `onSample(...)`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const onSample = sinon.spy();
  apu.frameSequencer.step = sinon.spy();

  for (let i = 0; i < 19; i++) {
    apu.step(onSample);
    expect(onSample).to.not.have.been.called;
  }
  apu.step(onSample);
  expect(onSample).to.have.been.calledOnce;
  expect(apu.frameSequencer.step, "frameSequencer.step").to.have.been.called;

  const frameStepCall = apu.frameSequencer.step.getCall(19); // (20th call)
  const onSampleCall = onSample.getCall(0);

  if (!frameStepCall.calledBefore(onSampleCall)) {
    throw new Error(
      "`frameSequencer.step()` was not called before `onSample(...)`."
    );
  }
})({
  locales: {
    ru: "вызывает `frameSequencer.step()` <перед> вызовом `onSample(...)`",
    es: "llama a `frameSequencer.step()` <antes> de llamar a `onSample(...)`",
  },
  use: ({ id }, book) => id >= book.getId("5c.7"),
});

// 5c.8 Pulse Channels (3/5): Length counter

it("`PulseChannel`: has a `lengthCounter` property", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    expect(
      apu.channels.pulses[i].lengthCounter,
      `channels.pulses[${i}].lengthCounter`
    ).to.be.an("object");
  }
})({
  locales: {
    ru: "`PulseChannel`: содержит свойство `lengthCounter`",
    es: "`PulseChannel`: tiene una propiedad `lengthCounter`",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: has a `counter` property that starts at 0", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const lengthCounter = apu.channels.pulses[i].lengthCounter;
    expect(lengthCounter.counter).to.equalN(0, `[${i}]::counter`);
  }
})({
  locales: {
    ru: "`LengthCounter`: содержит свойство `counter` с начальным значением 0",
    es: "`LengthCounter`: tiene una propiedad `counter` que empieza en 0",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: `reset()` sets `counter` = 0", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const lengthCounter = apu.channels.pulses[i].lengthCounter;
    expect(lengthCounter).to.respondTo("reset");
    lengthCounter.counter = 2;
    lengthCounter.reset();
    expect(lengthCounter.counter).to.equalN(0, `[${i}]::counter`);
  }
})({
  locales: {
    ru: "`LengthCounter`: `reset()` задаёт `counter` = 0",
    es: "`LengthCounter`: `reset()` asigna `counter` = 0",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: `isActive()` returns whether `counter` is greater than 0", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const lengthCounter = apu.channels.pulses[i].lengthCounter;
    expect(lengthCounter).to.respondTo("isActive");

    lengthCounter.counter = 2;
    expect(lengthCounter.isActive()).to.equalN(true, `[${i}]::isActive()`);

    lengthCounter.counter = 0;
    expect(lengthCounter.isActive()).to.equalN(false, `[${i}]::isActive()`);

    lengthCounter.counter = 1;
    expect(lengthCounter.isActive()).to.equalN(true, `[${i}]::isActive()`);
  }
})({
  locales: {
    ru: "`LengthCounter`: `isActive()` возвращает, больше ли `counter` нуля",
    es: "`LengthCounter`: `isActive()` retorna si `counter` es mayor a 0",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: has a `clock(...)` method", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const lengthCounter = apu.channels.pulses[i].lengthCounter;
    expect(lengthCounter).to.respondTo("clock");
  }
})({
  locales: {
    ru: "`LengthCounter`: содержит метод `clock(...)`",
    es: "`LengthCounter`: tiene un método `clock(...)`",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: calling `clock(...)` with ~false~ as the first argument just <resets the counter>", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const lengthCounter = apu.channels.pulses[i].lengthCounter;

    lengthCounter.counter = 3;
    lengthCounter.clock(false, true);
    expect(lengthCounter.counter).to.equalN(0, `[${i}]::counter`);

    lengthCounter.counter = 17;
    lengthCounter.clock(false, false);
    expect(lengthCounter.counter).to.equalN(0, `[${i}]::counter`);
  }
})({
  locales: {
    ru:
      "`LengthCounter`: вызов `clock(...)` с ~false~ в первом аргументе просто <сбрасывает счётчик>",
    es:
      "`LengthCounter`: llamar a `clock()` con ~false~ como primer argumento solo reinicia el contador",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: calling `clock(true, true)` doesn't do anything", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const lengthCounter = apu.channels.pulses[i].lengthCounter;

    lengthCounter.counter = 219;
    lengthCounter.clock(true, true);
    expect(lengthCounter.counter).to.equalN(219, `[${i}]::counter`);
  }
})({
  locales: {
    ru: "`LengthCounter`: вызов `clock(true, true)` ничего не меняет",
    es: "`LengthCounter`: llamar a `clock(true, true)` no hace nada",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: calling `clock(true, false)` decrements the counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const lengthCounter = apu.channels.pulses[i].lengthCounter;

    lengthCounter.counter = 219;

    lengthCounter.clock(true, false);
    expect(lengthCounter.counter).to.equalN(218, `[${i}]::counter`);

    lengthCounter.clock(true, false);
    expect(lengthCounter.counter).to.equalN(217, `[${i}]::counter`);
  }
})({
  locales: {
    ru: "`LengthCounter`: вызов `clock(true, false)` уменьшает счётчик",
    es: "`LengthCounter`: llamar a `clock(true, false)` decrementa el contador",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: calling `clock(true, false)` doesn't decrement if the counter is 0", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const lengthCounter = apu.channels.pulses[i].lengthCounter;

    lengthCounter.counter = 0;
    lengthCounter.clock(true, false);
    expect(lengthCounter.counter).to.equalN(0, `[${i}]::counter`);
  }
})({
  locales: {
    ru:
      "`LengthCounter`: вызов `clock(true, false)` не уменьшает счётчик, если он равен 0",
    es:
      "`LengthCounter`: llamar a `clock(true, false)` no decrementa si el contador es 0",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`PulseChannel`: `sample()` just returns the <last sample> if the channel is disabled", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // enable all channels, volume 1 and 2, length counter halt & load
  apu.registers.apuControl.setValue(0b11111111);
  for (let i = 0; i < 2; i++) {
    apu.registers.pulses[i].control.onWrite(0b00110000 | (i + 1));
    apu.registers.pulses[i].timerHighLCL.onWrite(0b11111111);
  }

  // Pulse1: get the first non-zero sample
  apu.channels.pulses[0].timer = 507; // => freq = 220
  let lastSample1 = 0;
  for (let i = 0; i < 10; i++) {
    lastSample1 = apu.channels.pulses[0].sample();
    if (lastSample1 !== 0) break;
  }
  if (lastSample1 === 0)
    throw new Error("The first 10 samples of pulse 1 were 0.");

  // Pulse2: get the first non-zero sample
  apu.channels.pulses[1].timer = 708; // => freq = 157
  let lastSample2 = 0;
  for (let i = 0; i < 10; i++) {
    lastSample2 = apu.channels.pulses[1].sample();
    if (lastSample2 !== 0) break;
  }
  if (lastSample2 === 0)
    throw new Error("The first 10 samples of pulse 2 were 0.");

  // spy oscillators
  sinon.spy(apu.channels.pulses[0].oscillator, "sample");
  sinon.spy(apu.channels.pulses[1].oscillator, "sample");

  // disable all channels
  apu.registers.apuControl.setValue(0);

  // change volume
  for (let i = 0; i < 2; i++)
    apu.registers.pulses[i].control.onWrite(0b00110000 | ((i + 1) * 2));

  // set another timer value
  apu.channels.pulses[0].timer = 123;
  apu.channels.pulses[0].timer = 456;

  // when the channel is disabled, it should return the last sample
  expect(apu.channels.pulses[0].sample()).to.equalN(
    lastSample1,
    "[0].sample()"
  );
  expect(apu.channels.pulses[0].oscillator.sample).to.not.have.been.called;
  expect(apu.channels.pulses[1].sample()).to.equalN(
    lastSample2,
    "[1].sample()"
  );
  expect(apu.channels.pulses[1].oscillator.sample).to.not.have.been.called;

  // they shouldn't update the oscillator frequency
  const pulse1Frequency = Math.floor(
    apu.channels.pulses[0].oscillator.frequency
  );
  expect(pulse1Frequency).to.equalN(220, "frequency");
  const pulse2Frequency = Math.floor(
    apu.channels.pulses[1].oscillator.frequency
  );
  expect(pulse2Frequency).to.equalN(157, "frequency");
})({
  locales: {
    ru:
      "`PulseChannel`: `sample()` просто возвращает <последний отсчёт>, если канал выключен",
    es:
      "`PulseChannel`: `sample()` solo retorna el <último sample> si el canal está desactivado",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`PulseChannel`: `sample()` just returns the <last sample> if the length counter is <not active>", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // enable all channels, volume 1 and 2, length counter halt & load
  apu.registers.apuControl.setValue(0b11111111);
  for (let i = 0; i < 2; i++) {
    apu.registers.pulses[i].control.onWrite(0b00110000 | (i + 1));
    apu.registers.pulses[i].timerHighLCL.onWrite(0b11111111);
  }

  // Pulse1: get the first non-zero sample
  apu.channels.pulses[0].timer = 507; // => freq = 220
  let lastSample1 = 0;
  for (let i = 0; i < 10; i++) {
    lastSample1 = apu.channels.pulses[0].sample();
    if (lastSample1 !== 0) break;
  }
  if (lastSample1 === 0)
    throw new Error("The first 10 samples of pulse 1 were 0.");

  // Pulse2: get the first non-zero sample
  apu.channels.pulses[1].timer = 708; // => freq = 157
  let lastSample2 = 0;
  for (let i = 0; i < 10; i++) {
    lastSample2 = apu.channels.pulses[1].sample();
    if (lastSample2 !== 0) break;
  }
  if (lastSample2 === 0)
    throw new Error("The first 10 samples of pulse 2 were 0.");

  // spy oscillators
  sinon.spy(apu.channels.pulses[0].oscillator, "sample");
  sinon.spy(apu.channels.pulses[1].oscillator, "sample");

  // set another timer value
  apu.channels.pulses[0].timer = 123;
  apu.channels.pulses[0].timer = 456;

  // reset length counters
  apu.channels.pulses[0].lengthCounter.reset();
  apu.channels.pulses[1].lengthCounter.reset();

  // change volume
  for (let i = 0; i < 2; i++)
    apu.registers.pulses[i].control.onWrite(0b00110000 | ((i + 1) * 2));

  // when the length counter is 0, it should return the last sample
  expect(apu.channels.pulses[0].sample()).to.equalN(
    lastSample1,
    "[0].sample()"
  );
  expect(apu.channels.pulses[0].oscillator.sample).to.not.have.been.called;
  expect(apu.channels.pulses[1].sample()).to.equalN(
    lastSample2,
    "[1].sample()"
  );
  expect(apu.channels.pulses[1].oscillator.sample).to.not.have.been.called;

  // they shouldn't update the oscillator frequency
  const pulse1Frequency = Math.floor(
    apu.channels.pulses[0].oscillator.frequency
  );
  expect(pulse1Frequency).to.equalN(220, "frequency");
  const pulse2Frequency = Math.floor(
    apu.channels.pulses[1].oscillator.frequency
  );
  expect(pulse2Frequency).to.equalN(157, "frequency");
})({
  locales: {
    ru:
      "`PulseChannel`: `sample()` просто возвращает <последний отсчёт>, если счётчик длины <неактивен>",
    es:
      "`PulseChannel`: `sample()` solo retorna el <último sample> si el contador de longitud <no está activo>",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`PulseChannel`: has a `quarterFrame()` method", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    expect(apu.channels.pulses[i]).to.respondTo("quarterFrame");
  }
})({
  locales: {
    ru: "`PulseChannel`: содержит метод `quarterFrame()`",
    es: "`PulseChannel`: tiene un método `quarterFrame()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`PulseChannel`: `halfFrame()` updates the length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const channel = apu.channels.pulses[i];
    expect(channel).to.respondTo("halfFrame");

    channel.lengthCounter.clock = sinon.spy();
    channel.isEnabled = () => true;
    channel.registers.control.onWrite(0b100000); // halt = 1
    channel.halfFrame();
    expect(channel.lengthCounter.clock).to.have.been.calledWith(true, 1);

    channel.lengthCounter.clock = sinon.spy();
    channel.isEnabled = () => true;
    channel.registers.control.onWrite(0b000000); // halt = 0
    channel.halfFrame();
    expect(channel.lengthCounter.clock).to.have.been.calledWith(true, 0);

    channel.lengthCounter.clock = sinon.spy();
    channel.isEnabled = () => false;
    channel.registers.control.onWrite(0b000000); // halt = 0
    channel.halfFrame();
    expect(channel.lengthCounter.clock).to.have.been.calledWith(false, 0);

    channel.lengthCounter.clock = sinon.spy();
    channel.isEnabled = () => false;
    channel.registers.control.onWrite(0b100000); // halt = 1
    channel.halfFrame();
    expect(channel.lengthCounter.clock).to.have.been.calledWith(false, 1);
  }
})({
  locales: {
    ru: "`PulseChannel`: `halfFrame()` обновляет счётчик длины",
    es: "`PulseChannel`: `halfFrame()` actualiza el contador de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`onQuarterFrameClock()` calls `quarterFrame()` on the two pulse channel instances", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.pulses[0].quarterFrame = sinon.spy();
  apu.channels.pulses[1].quarterFrame = sinon.spy();

  apu.onQuarterFrameClock();

  expect(apu.channels.pulses[0].quarterFrame).to.have.been.calledOnce;
  expect(apu.channels.pulses[1].quarterFrame).to.have.been.calledOnce;
})({
  locales: {
    ru:
      "`onQuarterFrameClock()` вызывает `quarterFrame()` у обоих экземпляров импульсных каналов",
    es:
      "`onQuarterFrameClock()` llama a `quarterFrame()` en las dos instancias del canal pulso",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`onHalfFrameClock()` calls `halfFrame()` on the two pulse channel instances", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.pulses[0].halfFrame = sinon.spy();
  apu.channels.pulses[1].halfFrame = sinon.spy();

  apu.onHalfFrameClock();

  expect(apu.channels.pulses[0].halfFrame).to.have.been.calledOnce;
  expect(apu.channels.pulses[1].halfFrame).to.have.been.calledOnce;
})({
  locales: {
    ru:
      "`onHalfFrameClock()` вызывает `halfFrame()` у обоих экземпляров импульсных каналов",
    es:
      "`onHalfFrameClock()` llama a `halfFrame()` en las dos instancias del canal pulso",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`PulseTimerHighLCL`: writes `lengthCounterLoad` (bits ~3-7~) and updates the length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.registers.write(0x4003, 0b10110000); // Pulse1TimerHighLCL
  expect(apu.registers.pulses[0].timerHighLCL.lengthCounterLoad).to.equalN(
    0b10110, // index 22 => 96 in length table
    "lengthCounterLoad"
  );
  expect(apu.channels.pulses[0].lengthCounter.counter).to.equalN(
    96,
    "[0]::counter"
  );

  apu.registers.write(0x4007, 0b01100000); // Pulse2TimerHighLCL
  expect(apu.registers.pulses[1].timerHighLCL.lengthCounterLoad).to.equalN(
    0b01100, // index 22 => 14 in length table
    "lengthCounterLoad"
  );
  expect(apu.channels.pulses[1].lengthCounter.counter).to.equalN(
    14,
    "[1]::counter"
  );
})({
  locales: {
    ru:
      "`PulseTimerHighLCL`: записывает `lengthCounterLoad` (биты ~3-7~) и обновляет счётчик длины",
    es:
      "`PulseTimerHighLCL`: escribe `lengthCounterLoad` (bits ~3-7~) y actualiza el contador de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`APUControl`: on writes, if `enablePulse1` is clear, resets the length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.pulses[0].lengthCounter.counter = 72;
  apu.channels.pulses[1].lengthCounter.counter = 83;

  apu.registers.write(0x4015, 0b00000010);

  expect(apu.channels.pulses[0].lengthCounter.counter).to.equalN(0, "counter");
  expect(apu.channels.pulses[1].lengthCounter.counter).to.equalN(83, "counter");
})({
  locales: {
    ru:
      "`APUControl`: при записи сбрасывает счётчик длины, если `enablePulse1` сброшен",
    es:
      "`APUControl`: en escrituras, si `enablePulse1` está apagada, reinicia el contador de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`APUControl`: on writes, if `enablePulse2` is clear, resets the length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.pulses[0].lengthCounter.counter = 72;
  apu.channels.pulses[1].lengthCounter.counter = 83;

  apu.registers.write(0x4015, 0b00000001);

  expect(apu.channels.pulses[0].lengthCounter.counter).to.equalN(72, "counter");
  expect(apu.channels.pulses[1].lengthCounter.counter).to.equalN(0, "counter");
})({
  locales: {
    ru:
      "`APUControl`: при записи сбрасывает счётчик длины, если `enablePulse2` сброшен",
    es:
      "`APUControl`: en escrituras, si `enablePulse2` está apagada, reinicia el contador de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.8"),
});

// 5c.9 Pulse Channels (4/5): Volume envelope

it("`PulseChannel`: has a `volumeEnvelope` property", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    expect(
      apu.channels.pulses[i].volumeEnvelope,
      `[${i}].volumeEnvelope`
    ).to.be.an("object");
  }
})({
  locales: {
    ru: "`PulseChannel`: содержит свойство `volumeEnvelope`",
    es: "`PulseChannel`: tiene una propiedad `volumeEnvelope`",
  },
  use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`VolumeEnvelope`: has `startFlag`, `dividerCount`, `volume` initialized to ~false~, 0, 0", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const envelope = apu.channels.pulses[i].volumeEnvelope;
    expect(envelope.startFlag).to.equalN(false, `[${i}]::startFlag`);
    expect(envelope.dividerCount).to.equalN(0, `[${i}]::dividerCount`);
    expect(envelope.volume).to.equalN(0, `[${i}]::volume`);
  }
})({
  locales: {
    ru:
      "`VolumeEnvelope`: начальные значения `startFlag`, `dividerCount`, `volume` равны ~false~, 0, 0",
    es:
      "`VolumeEnvelope`: tiene `startFlag`, `dividerCount` y `volume` inicializados en ~false~, 0, 0",
  },
  use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`VolumeEnvelope`: has a `clock(...)` method", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    expect(apu.channels.pulses[i].volumeEnvelope).to.respondTo("clock");
  }
})({
  locales: {
    ru: "`VolumeEnvelope`: содержит метод `clock(...)`",
    es: "`VolumeEnvelope`: tiene un método `clock(...)`",
  },
  use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`VolumeEnvelope`: `clock(...)` with `startFlag = true` clears it, sets `volume` to 15 and `dividerCount` to period", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const envelope = apu.channels.pulses[0].volumeEnvelope;
  envelope.startFlag = true;

  envelope.clock(8, false);

  expect(envelope.startFlag).to.equalN(false, "startFlag");
  expect(envelope.volume).to.equalN(15, "volume");
  expect(envelope.dividerCount).to.equalN(8, "dividerCount");
})({
  locales: {
    ru:
      "`VolumeEnvelope`: `clock(...)` при `startFlag = true` сбрасывает флаг, задаёт `volume` равным 15 и `dividerCount` равным периоду",
    es:
      "`VolumeEnvelope`: `clock(...)` con `startFlag = true` lo apaga, fija `volume` en 15 y `dividerCount` en el periodo",
  },
  use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`VolumeEnvelope`: `clock(...)` when `dividerCount > 0` decrements it and leaves the rest unchanged", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const envelope = apu.channels.pulses[0].volumeEnvelope;
  envelope.dividerCount = 3;
  envelope.volume = 7;

  envelope.clock(5, false);

  expect(envelope.dividerCount).to.equalN(2, "dividerCount");
  expect(envelope.volume).to.equalN(7, "volume");
  expect(envelope.startFlag).to.equalN(false, "startFlag");
})({
  locales: {
    ru:
      "`VolumeEnvelope`: `clock(...)` при `dividerCount > 0` уменьшает счётчик, не меняя остальное",
    es:
      "`VolumeEnvelope`: `clock(...)` cuando `dividerCount > 0` lo decrementa y deja el resto intacto",
  },
  use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`VolumeEnvelope`: `clock(...)` when `dividerCount = 0` and `volume > 0`, resets `dividerCount` and decrements `volume`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const envelope = apu.channels.pulses[0].volumeEnvelope;
  envelope.dividerCount = 0;
  envelope.volume = 5;

  envelope.clock(9, false);

  expect(envelope.dividerCount).to.equalN(9, "dividerCount");
  expect(envelope.volume).to.equalN(4, "volume");
})({
  locales: {
    ru:
      "`VolumeEnvelope`: `clock(...)` при `dividerCount = 0` и `volume > 0` перезагружает `dividerCount` и уменьшает `volume`",
    es:
      "`VolumeEnvelope`: `clock(...)` cuando `dividerCount = 0` y `volume > 0`, reinicia `dividerCount` y decrementa `volume`",
  },
  use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`VolumeEnvelope`: `clock(...)` when `dividerCount = 0` and `volume = 0` with `loop = false`, resets `dividerCount` only", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const envelope = apu.channels.pulses[0].volumeEnvelope;
  envelope.dividerCount = 0;
  envelope.volume = 0;

  envelope.clock(6, false);

  expect(envelope.dividerCount).to.equalN(6, "dividerCount");
  expect(envelope.volume).to.equalN(0, "volume");
})({
  locales: {
    ru:
      "`VolumeEnvelope`: `clock(...)` при `dividerCount = 0`, `volume = 0` и `loop = false` перезагружает только `dividerCount`",
    es:
      "`VolumeEnvelope`: `clock(...)` cuando `dividerCount = 0` y `volume = 0` con `loop = false`, reinicia solo `dividerCount`",
  },
  use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`VolumeEnvelope`: `clock(...)` when `dividerCount = 0` and `volume = 0` with `loop = true`, resets both `dividerCount` and `volume`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const envelope = apu.channels.pulses[0].volumeEnvelope;
  envelope.dividerCount = 0;
  envelope.volume = 0;

  envelope.clock(2, true);

  expect(envelope.dividerCount).to.equalN(2, "dividerCount");
  expect(envelope.volume).to.equalN(15, "volume");
})({
  locales: {
    ru:
      "`VolumeEnvelope`: `clock(...)` при `dividerCount = 0`, `volume = 0` и `loop = true` перезагружает и `dividerCount`, и `volume`",
    es:
      "`VolumeEnvelope`: `clock(...)` cuando `dividerCount = 0` y `volume = 0` con `loop = true`, reinicia `dividerCount` y `volume`",
  },
  use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`PulseChannel`: `quarterFrame()` updates the volume envelope", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const channel = apu.channels.pulses[i];
    channel.volumeEnvelope.clock = sinon.spy();

    const period = 3;
    const loop = 1;
    channel.registers.control.onWrite(period | (loop << 5));
    channel.quarterFrame();

    expect(channel.volumeEnvelope.clock).to.have.been.calledWith(period, loop);
  }
})({
  locales: {
    ru: "`PulseChannel`: `quarterFrame()` обновляет огибающую громкости",
    es: "`PulseChannel`: `quarterFrame()` actualiza la envolvente de volumen",
  },
  use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`PulseTimerHighLCL`: writes set the `startFlag` on the channel's volume envelope", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.registers.write(0x4003, 0b01000000);
  expect(apu.channels.pulses[0].volumeEnvelope.startFlag).to.equalN(
    true,
    "startFlag"
  );

  apu.registers.write(0x4007, 0b11000000);
  expect(apu.channels.pulses[1].volumeEnvelope.startFlag).to.equalN(
    true,
    "startFlag"
  );
})({
  locales: {
    ru:
      "`PulseTimerHighLCL`: запись устанавливает `startFlag` огибающей громкости канала",
    es:
      "`PulseTimerHighLCL`: las escrituras encienden `startFlag` en la envolvente de volumen del canal",
  },
  use: ({ id }, book) => id >= book.getId("5c.9"),
});

// 5c.10 Pulse Channels (5/5): Frequency sweep

it("`PulseSweep`: writes `shiftCount`, `negateFlag`, `dividerPeriodMinusOne`, `enabledFlag`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.registers.write(0x4001, 0b01110010);
  apu.registers.write(0x4005, 0b10111011);

  // Pulse 1
  const sweep1 = apu.registers.pulses[0].sweep;
  expect(sweep1.shiftCount).to.equalN(2, "shiftCount");
  expect(sweep1.negateFlag).to.equalN(0, "negateFlag");
  expect(sweep1.dividerPeriodMinusOne).to.equalN(7, "dividerPeriodMinusOne");
  expect(sweep1.enabledFlag).to.equalN(0, "enabledFlag");

  // Pulse 2
  const sweep2 = apu.registers.pulses[1].sweep;
  expect(sweep2.shiftCount).to.equalN(3, "shiftCount");
  expect(sweep2.negateFlag).to.equalN(1, "negateFlag");
  expect(sweep2.dividerPeriodMinusOne).to.equalN(3, "dividerPeriodMinusOne");
  expect(sweep2.enabledFlag).to.equalN(1, "enabledFlag");
})({
  locales: {
    ru:
      "`PulseSweep`: записывает `shiftCount`, `negateFlag`, `dividerPeriodMinusOne`, `enabledFlag`",
    es:
      "`PulseSweep`: escribe `shiftCount`, `negateFlag`, `dividerPeriodMinusOne`, `enabledFlag`",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`PulseChannel`: has a `frequencySweep` property", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    expect(
      apu.channels.pulses[i].frequencySweep,
      `[${i}].frequencySweep`
    ).to.be.an("object");
  }
})({
  locales: {
    ru: "`PulseChannel`: содержит свойство `frequencySweep`",
    es: "`PulseChannel`: tiene una propiedad `frequencySweep`",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: has `startFlag`, `dividerCount`, `mute` initialized to ~false~, `0`, ~false~", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const sweep = apu.channels.pulses[i].frequencySweep;
    expect(sweep.startFlag).to.equalN(false, `[${i}]::startFlag`);
    expect(sweep.dividerCount).to.equalN(0, `[${i}]::dividerCount`);
    expect(sweep.mute).to.equalN(false, `[${i}]::mute`);
  }
})({
  locales: {
    ru:
      "`FrequencySweep`: начальные значения `startFlag`, `dividerCount`, `mute` равны ~false~, `0`, ~false~",
    es:
      "`FrequencySweep`: tiene `startFlag`, `dividerCount` y `mute` inicializados en ~false~, `0`, ~false~",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: has `clock()` and `muteIfNeeded()` methods", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const sweep = apu.channels.pulses[i].frequencySweep;
    expect(sweep).to.respondTo("clock");
    expect(sweep).to.respondTo("muteIfNeeded");
  }
})({
  locales: {
    ru: "`FrequencySweep`: содержит методы `clock()` и `muteIfNeeded()`",
    es: "`FrequencySweep`: tiene métodos `clock()` y `muteIfNeeded()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: `clock()` increases `timer` by <shift delta> when enabled, `shiftCount > 0`, `dividerCount = 0`, and not muted", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const channel = apu.channels.pulses[i];
    const sweep = channel.frequencySweep;
    const address = i === 0 ? 0x4001 : 0x4005;

    // enable, periodMinusOne=7, shiftCount=2, negateFlag=0
    apu.registers.write(address, 0b11110010);
    sweep.startFlag = false;
    sweep.dividerCount = 0;
    sweep.mute = false;

    channel.timer = 100; // => delta = 100 >> 2 = 25
    sweep.clock();

    expect(channel.timer).to.equalN(125, `[${i}].timer`);
    expect(sweep.dividerCount).to.equalN(7, `[${i}]::dividerCount`);
  }
})({
  locales: {
    ru:
      "`FrequencySweep`: `clock()` увеличивает `timer` на <дельту сдвига>, если свип включён, `shiftCount > 0`, `dividerCount = 0` и канал не заглушён",
    es:
      "`FrequencySweep`: `clock()` incrementa `timer` por el <delta apropiado> cuando está habilitado, `shiftCount > 0`, `dividerCount = 0` y no está silenciado",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: `clock()` decreases `timer` by <shift delta> when `negateFlag` is set (same conditions)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const channel = apu.channels.pulses[i];
    const sweep = channel.frequencySweep;
    const address = i === 0 ? 0x4001 : 0x4005;

    // configure sweep: enable, periodMinusOne=3, shiftCount=2, negateFlag=1
    apu.registers.write(address, 0b10111010);
    sweep.startFlag = false;
    sweep.dividerCount = 0;
    sweep.mute = false;

    channel.timer = 100; // => delta = 100 >> 2 = 25
    sweep.clock();

    expect(channel.timer).to.equalN(75, `[${i}].timer`);
    expect(sweep.dividerCount).to.equalN(3, `[${i}]::dividerCount`);
  }
})({
  locales: {
    ru:
      "`FrequencySweep`: `clock()` уменьшает `timer` на <дельту сдвига>, если установлен `negateFlag` (при тех же условиях)",
    es:
      "`FrequencySweep`: `clock()`: decrementa `timer` por el <delta apropiado> cuando `negateFlag` está encendida (mismas condiciones)",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: `clock()` reloads `dividerCount` and clears `startFlag` when `startFlag` is set", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const channel = apu.channels.pulses[i];
    const sweep = channel.frequencySweep;
    const address = i === 0 ? 0x4001 : 0x4005;

    // configure sweep: enable, periodMinusOne=7
    apu.registers.write(address, 0b11110010);
    sweep.startFlag = true;
    sweep.dividerCount = 0;

    sweep.clock();

    expect(sweep.startFlag).to.equalN(false, `[${i}]::startFlag`);
    expect(sweep.dividerCount).to.equalN(7, `[${i}]::dividerCount`);
  }
})({
  locales: {
    ru:
      "`FrequencySweep`: `clock()` перезагружает `dividerCount` и сбрасывает `startFlag`, если `startFlag` установлен",
    es:
      "`FrequencySweep`: `clock()` recarga `dividerCount` y limpia `startFlag` cuando `startFlag` está encendida",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: `clock()` when `dividerCount > 0` decrements it and leaves `timer` unchanged", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const channel = apu.channels.pulses[i];
    const sweep = channel.frequencySweep;

    channel.timer = 200;
    sweep.dividerCount = 5;
    sweep.startFlag = false;

    sweep.clock();

    expect(sweep.dividerCount).to.equalN(4, `[${i}]::dividerCount`);
    expect(channel.timer).to.equalN(200, `[${i}].timer`);
  }
})({
  locales: {
    ru:
      "`FrequencySweep`: `clock()` при `dividerCount > 0` уменьшает счётчик, не меняя `timer`",
    es:
      "`FrequencySweep`: `clock()` cuando `dividerCount > 0` lo decrementa y deja `timer` intacto",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: `muteIfNeeded()` sets `mute` when `timer` is ~< 8~ or ~> 0x7ff~", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const channel = apu.channels.pulses[i];
    const sweep = channel.frequencySweep;

    channel.timer = 7;
    sweep.muteIfNeeded();
    expect(sweep.mute).to.equalN(true, `[${i}]::mute`);

    channel.timer = 8;
    sweep.muteIfNeeded();
    expect(sweep.mute).to.equalN(false, `[${i}]::mute`);

    channel.timer = 0x800;
    sweep.muteIfNeeded();
    expect(sweep.mute).to.equalN(true, `[${i}]::mute`);

    channel.timer = 0x7ff;
    sweep.muteIfNeeded();
    expect(sweep.mute).to.equalN(false, `[${i}]::mute`);
  }
})({
  locales: {
    ru:
      "`FrequencySweep`: `muteIfNeeded()` устанавливает `mute`, если `timer` ~< 8~ или ~> 0x7ff~",
    es:
      "`FrequencySweep`: `muteIfNeeded()` enciende `mute` cuando `timer` is ~< 8~ o ~> 0x7ff~",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`PulseChannel`: `sample()` just returns the <last sample> if the sweep unit is muted", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // enable all channels, volume 1 and 2, length counter halt & load
  apu.registers.apuControl.setValue(0b11111111);
  for (let i = 0; i < 2; i++) {
    apu.registers.pulses[i].control.onWrite(0b00110000 | (i + 1));
    apu.registers.pulses[i].timerHighLCL.onWrite(0b11111111);
  }

  // Pulse1: get the first non-zero sample
  apu.channels.pulses[0].timer = 507; // => freq = 220
  let lastSample1 = 0;
  for (let i = 0; i < 10; i++) {
    lastSample1 = apu.channels.pulses[0].sample();
    if (lastSample1 !== 0) break;
  }
  if (lastSample1 === 0)
    throw new Error("The first 10 samples of pulse 1 were 0.");

  // Pulse2: get the first non-zero sample
  apu.channels.pulses[1].timer = 708; // => freq = 157
  let lastSample2 = 0;
  for (let i = 0; i < 10; i++) {
    lastSample2 = apu.channels.pulses[1].sample();
    if (lastSample2 !== 0) break;
  }
  if (lastSample2 === 0)
    throw new Error("The first 10 samples of pulse 2 were 0.");

  // mute sweep units
  for (let i = 0; i < 2; i++) {
    apu.channels.pulses[i].frequencySweep.mute = true;
  }

  // change volume
  for (let i = 0; i < 2; i++)
    apu.registers.pulses[i].control.onWrite(0b00110000 | ((i + 1) * 2));

  // set another timer value
  apu.channels.pulses[0].timer = 123;
  apu.channels.pulses[0].timer = 456;

  // when the sweep unit is muted, it should return the last sample
  expect(apu.channels.pulses[0].sample()).to.equalN(
    lastSample1,
    "[0].sample()"
  );
  expect(apu.channels.pulses[1].sample()).to.equalN(
    lastSample2,
    "[1].sample()"
  );

  // they shouldn't update the oscillator frequency
  const pulse1Frequency = Math.floor(
    apu.channels.pulses[0].oscillator.frequency
  );
  expect(pulse1Frequency).to.equalN(220, "frequency");
  const pulse2Frequency = Math.floor(
    apu.channels.pulses[1].oscillator.frequency
  );
  expect(pulse2Frequency).to.equalN(157, "frequency");
})({
  locales: {
    ru:
      "`PulseChannel`: `sample()` просто возвращает <последний отсчёт>, если блок свипа заглушает канал",
    es:
      "`PulseChannel`: `sample()` solo retorna el <último sample> si la unidad de barrido está silenciada",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`PulseChannel`: `step()` calls `frequencySweep.muteIfNeeded()` and `updateTimer()` when `sweep.enabledFlag` is clear", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const channel = apu.channels.pulses[i];

    channel.frequencySweep.muteIfNeeded = sinon.spy();
    channel.updateTimer = sinon.spy();
    channel.registers.sweep.enabledFlag = 0;

    channel.step();

    expect(channel.frequencySweep.muteIfNeeded).to.have.been.calledOnce;
    expect(channel.updateTimer).to.have.been.calledOnce;
  }
})({
  locales: {
    ru:
      "`PulseChannel`: `step()` вызывает `frequencySweep.muteIfNeeded()` и `updateTimer()`, если `sweep.enabledFlag` сброшен",
    es:
      "`PulseChannel`: `step()` llama a `frequencySweep.muteIfNeeded()` y a `updateTimer()` cuando `sweep.enabledFlag` está en 0",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`PulseChannel`: `step()` calls `frequencySweep.muteIfNeeded()` but not `updateTimer()` when `sweep.enabledFlag` is set", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const channel = apu.channels.pulses[i];

    channel.frequencySweep.muteIfNeeded = sinon.spy();
    channel.updateTimer = sinon.spy();
    channel.registers.sweep.enabledFlag = 1;

    channel.step();

    expect(channel.frequencySweep.muteIfNeeded).to.have.been.calledOnce;
    expect(channel.updateTimer).to.not.have.been.called;
  }
})({
  locales: {
    ru:
      "`PulseChannel`: `step()` вызывает `frequencySweep.muteIfNeeded()`, но не `updateTimer()`, если `sweep.enabledFlag` установлен",
    es:
      "`PulseChannel`: `step()` llama a `frequencySweep.muteIfNeeded()` pero no a `updateTimer()` cuando `sweep.enabledFlag` está encendida",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`PulseChannel`: `halfFrame()` calls `frequencySweep.clock()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  for (let i = 0; i < 2; i++) {
    const channel = apu.channels.pulses[i];
    channel.frequencySweep.clock = sinon.spy();
    channel.halfFrame();
    expect(channel.frequencySweep.clock).to.have.been.calledOnce;
  }
})({
  locales: {
    ru: "`PulseChannel`: `halfFrame()` вызывает `frequencySweep.clock()`",
    es: "`PulseChannel`: `halfFrame()` llama a `frequencySweep.clock()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`PulseSweep`: writes set the `startFlag` on the channel's frequency sweep", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.registers.write(0x4001, 1);
  expect(apu.channels.pulses[0].frequencySweep.startFlag).to.equalN(
    true,
    "startFlag"
  );

  apu.registers.write(0x4005, 2);
  expect(apu.channels.pulses[1].frequencySweep.startFlag).to.equalN(
    true,
    "startFlag"
  );
})({
  locales: {
    ru: "`PulseSweep`: запись устанавливает `startFlag` свипа частоты канала",
    es:
      "`PulseSweep`: las escrituras encienden `startFlag` en el barrido de frecuencia del canal",
  },
  use: ({ id }, book) => id >= book.getId("5c.10"),
});

// 5c.11 Triangle Channel (1/3): Triangle waves

it("`TriangleTimerHighLCL`: writes `timerHigh` (bits ~0-2~)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.registers.write(0x400b, 5);
  expect(apu.registers.triangle.timerHighLCL.timerHigh).to.equalN(
    5,
    "timerHigh"
  );
})({
  locales: {
    ru: "`TriangleTimerHighLCL`: записывает `timerHigh` (биты ~0-2~)",
    es: "`TriangleTimerHighLCL`: escribe `timerHigh` (bits ~0-2~)",
  },
  use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("has a `TriangleChannel` instance", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.triangle, "triangle").to.be.an("object");
})({
  locales: {
    ru: "содержит экземпляр `TriangleChannel`",
    es: "tiene una instancia de `TriangleChannel`",
  },
  use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("`TriangleChannel`: has an `apu` reference", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.triangle.apu).to.equalN(apu, "apu");
})({
  locales: {
    ru: "`TriangleChannel`: содержит ссылку `apu`",
    es: "`TriangleChannel`: tiene una referencia `apu`",
  },
  use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("`TriangleChannel`: has a `registers` property, pointing to the audio registers", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.triangle.registers).to.equalN(
    apu.registers.triangle,
    "registers"
  );
})({
  locales: {
    ru:
      "`TriangleChannel`: содержит свойство `registers`, указывающее на звуковые регистры",
    es:
      "`TriangleChannel`: tiene una propiedad `registers`, apuntando a los registros de audio",
  },
  use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("`TriangleChannel`: has an `oscillator` property that can <produce> samples", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.triangle;
  expect(channel.oscillator, "oscillator").to.be.an("object");
  expect(channel.oscillator).to.respondTo("sample");
})({
  locales: {
    ru:
      "`TriangleChannel`: содержит свойство `oscillator`, которое умеет <создавать> отсчёты",
    es:
      "`TriangleChannel`: tiene una propiedad `oscillator` que puede <producir> samples",
  },
  use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("`TriangleChannel`: has a `sample()` method that <returns a number>", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.triangle).to.respondTo("sample");
  expect(apu.channels.triangle.sample()).to.be.a("number");
})({
  locales: {
    ru:
      "`TriangleChannel`: содержит метод `sample()`, который <возвращает число>",
    es: "`TriangleChannel`: tiene un método `sample()` que <retorna un número>",
  },
  use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("`TriangleChannel`: `sample()` returns 0 when `timer` ~< 2~", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.triangle;

  channel.registers.timerLow.value = 1;
  channel.registers.timerHighLCL.timerHigh = 0;
  expect(channel.sample()).to.equalN(0, "sample()");

  channel.registers.timerLow.value = 0;
  channel.registers.timerHighLCL.timerHigh = 0;
  expect(channel.sample()).to.equalN(0, "sample()");
})({
  locales: {
    ru: "`TriangleChannel`: `sample()` возвращает 0 при `timer` ~< 2~",
    es: "`TriangleChannel`: `sample()` retorna 0 cuando `timer` ~< 2~",
  },
  use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("`TriangleChannel`: `sample()` updates `oscillator.frequency` and returns `oscillator.sample()` when `timer` is in a <valid range>", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.triangle;

  // enable triangle output
  apu.registers.apuControl.onWrite(0b11111111); // enables all channels
  apu.registers.triangle.lengthControl.onWrite(0b11111111); // sets reload value
  apu.registers.triangle.timerHighLCL.onWrite(0); // sets reload flag
  apu.registers.apuFrameCounter.onWrite(0); // triggers quarter&half frames

  // set timer => buildU16(2, 4) = 516
  apu.registers.write(0x400a, 4); // low: 4
  apu.registers.write(0x400b, 0b11111010); // high: 2

  const expectedFreq = 1789773 / (16 * (516 + 1)) / 2;
  channel.oscillator.sample = () => 9;

  expect(channel.sample()).to.equalN(9, "sample()");
  expect(Math.floor(channel.oscillator.frequency)).to.equalN(
    Math.floor(expectedFreq),
    "frequency"
  );
})({
  locales: {
    ru:
      "`TriangleChannel`: `sample()` обновляет `oscillator.frequency` и возвращает `oscillator.sample()`, если `timer` находится в <допустимом диапазоне>",
    es:
      "`TriangleChannel`: `sample()` actualiza `oscillator.frequency` y retorna `oscillator.sample()` cuando `timer` está en un <rango válido>",
  },
  use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("mixes pulse1, pulse2 and triangle in `step()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const onSample = sinon.spy();

  apu.channels.pulses[0].sample = () => 1;
  apu.channels.pulses[1].sample = () => 2;
  apu.channels.triangle.sample = () => 3;

  for (let i = 0; i < 19; i++) {
    apu.step(onSample);
    expect(onSample).to.not.have.been.called;
  }

  apu.step(onSample);
  expect(onSample).to.have.been.calledWith(0.06, 1, 2, 3);
})({
  locales: {
    ru: "смешивает pulse1, pulse2 и triangle в `step()`",
    es: "mezcla pulse1, pulse2 y triangle en `step()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.11") && id < book.getId("5c.19"),
});

// 5c.12 Triangle Channel (2/3): Regular length counter

it("`TriangleLengthControl`: writes `halt` (bit 7)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const register = apu.registers.triangle.lengthControl;

  apu.registers.write(0x4008, 0b11011010);
  expect(register.halt).to.equalN(1, "halt");
  apu.registers.write(0x4008, 0b01011010);
  expect(register.halt).to.equalN(0, "halt");
})({
  locales: {
    ru: "`TriangleLengthControl`: записывает `halt` (бит 7)",
    es: "`TriangleLengthControl`: escribe `halt` (bit 7)",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: has a `lengthCounter` property", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.triangle;

  expect(channel.lengthCounter, "lengthCounter").to.be.an("object");
  expect(channel.lengthCounter.constructor).to.equalN(
    apu.channels.pulses[0].lengthCounter.constructor,
    "class"
  );
})({
  locales: {
    ru: "`TriangleChannel`: содержит свойство `lengthCounter`",
    es: "`TriangleChannel`: tiene una propiedad `lengthCounter`",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: `sample()` just returns the <last sample> if the channel is disabled", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // enable triangle output
  apu.registers.apuControl.onWrite(0b11111111); // enables all channels
  apu.registers.triangle.lengthControl.onWrite(0b11111111); // sets reload value
  apu.registers.triangle.timerHighLCL.onWrite(0); // sets reload flag
  apu.registers.apuFrameCounter.onWrite(0); // triggers quarter&half frames

  // timer = 507 => freq = 110
  apu.registers.triangle.timerLow.onWrite(0b11111011); // low = 0b11111011
  apu.registers.triangle.timerHighLCL.onWrite(0b11111001); // high = 0b001

  // get the first non-zero sample
  let lastSample = 0;
  for (let i = 0; i < 10; i++) {
    lastSample = apu.channels.triangle.sample();
    if (lastSample !== 0) break;
  }
  if (lastSample === 0)
    throw new Error("The first 10 samples of triangle were 0.");

  // disable all channels
  apu.registers.apuControl.setValue(0);

  // set another timer value
  apu.registers.triangle.timerLow.onWrite(0b10001011);
  apu.registers.triangle.timerHighLCL.onWrite(0b11111001);

  // when the channel is disabled, it should return the last sample
  expect(apu.channels.triangle.sample()).to.equalN(lastSample, "sample()");

  // it shouldn't update the oscillator frequency
  const frequency = Math.floor(apu.channels.triangle.oscillator.frequency);
  expect(frequency).to.equalN(110, "frequency");
})({
  locales: {
    ru:
      "`TriangleChannel`: `sample()` просто возвращает <последний отсчёт>, если канал выключен",
    es:
      "`TriangleChannel`: `sample()` solo retorna el <último sample> si el canal está desactivado",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: `sample()` just returns the <last sample> if the length counter is <not active>", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // enable triangle output
  apu.registers.apuControl.onWrite(0b11111111); // enables all channels
  apu.registers.triangle.lengthControl.onWrite(0b11111111); // sets reload value
  apu.registers.triangle.timerHighLCL.onWrite(0); // sets reload flag
  apu.registers.apuFrameCounter.onWrite(0); // triggers quarter&half frames

  // timer = 507 => freq = 110
  apu.registers.triangle.timerLow.onWrite(0b11111011); // low = 0b11111011
  apu.registers.triangle.timerHighLCL.onWrite(0b11111001); // high = 0b001

  // get the first non-zero sample
  let lastSample = 0;
  for (let i = 0; i < 10; i++) {
    lastSample = apu.channels.triangle.sample();
    if (lastSample !== 0) break;
  }
  if (lastSample === 0)
    throw new Error("The first 10 samples of triangle were 0.");

  // set another timer value
  apu.registers.triangle.timerLow.onWrite(0b10001011);
  apu.registers.triangle.timerHighLCL.onWrite(0b11111001);

  // reset length counter
  apu.channels.triangle.lengthCounter.reset();

  // when the length counter is 0, it should return the last sample
  expect(apu.channels.triangle.sample()).to.equalN(lastSample, "sample()");

  // it shouldn't update the oscillator frequency
  const frequency = Math.floor(apu.channels.triangle.oscillator.frequency);
  expect(frequency).to.equalN(110, "frequency");
})({
  locales: {
    ru:
      "`TriangleChannel`: `sample()` просто возвращает <последний отсчёт>, если счётчик длины <неактивен>",
    es:
      "`TriangleChannel`: `sample()` solo retorna el <último sample> si el contador de longitud <no está activo>",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: has a `quarterFrame()` method", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.triangle;

  expect(channel).to.respondTo("quarterFrame");
})({
  locales: {
    ru: "`TriangleChannel`: содержит метод `quarterFrame()`",
    es: "`TriangleChannel`: tiene un método `quarterFrame()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: has a `halfFrame()` method that updates the length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.triangle;

  expect(channel).to.respondTo("halfFrame");

  channel.lengthCounter.clock = sinon.spy();
  channel.isEnabled = () => true;
  channel.registers.lengthControl.onWrite(0b10000000); // halt = 1
  channel.halfFrame();
  expect(channel.lengthCounter.clock).to.have.been.calledWith(true, 1);

  channel.lengthCounter.clock = sinon.spy();
  channel.isEnabled = () => true;
  channel.registers.lengthControl.onWrite(0b00000000); // halt = 0
  channel.halfFrame();
  expect(channel.lengthCounter.clock).to.have.been.calledWith(true, 0);

  channel.lengthCounter.clock = sinon.spy();
  channel.isEnabled = () => false;
  channel.registers.lengthControl.onWrite(0b00000000); // halt = 0
  channel.halfFrame();
  expect(channel.lengthCounter.clock).to.have.been.calledWith(false, 0);

  channel.lengthCounter.clock = sinon.spy();
  channel.isEnabled = () => false;
  channel.registers.lengthControl.onWrite(0b10000000); // halt = 1
  channel.halfFrame();
  expect(channel.lengthCounter.clock).to.have.been.calledWith(false, 1);
})({
  locales: {
    ru:
      "`TriangleChannel`: содержит метод `halfFrame()`, обновляющий счётчик длины",
    es:
      "`TriangleChannel`: tiene un método `halfFrame()` que actualiza el contador de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: has an `isEnabled()` method that returns whether the channel is <enabled> or not in APUControl", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.triangle).to.respondTo("isEnabled");

  apu.registers.apuControl.onWrite(0b100);
  expect(apu.channels.triangle.isEnabled()).to.equalN(true, "isEnabled()");

  apu.registers.apuControl.onWrite(0b000);
  expect(apu.channels.triangle.isEnabled()).to.equalN(false, "isEnabled()");
})({
  locales: {
    ru:
      "`TriangleChannel`: содержит метод `isEnabled()`, который возвращает, <включён> ли канал в APUControl",
    es:
      "`TriangleChannel`: tiene un método `isEnabled()` que retorna si el canal está <activo> o no en APUControl",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`onQuarterFrameClock()` calls `quarterFrame()` on triangle channel", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.triangle.quarterFrame = sinon.spy();

  apu.onQuarterFrameClock();

  expect(apu.channels.triangle.quarterFrame).to.have.been.calledOnce;
})({
  locales: {
    ru:
      "`onQuarterFrameClock()` вызывает `quarterFrame()` у треугольного канала",
    es:
      "`onQuarterFrameClock()` llama a `quarterFrame()` en el canal triangular",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`onHalfFrameClock()` calls `halfFrame()` on triangle channel", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.triangle.halfFrame = sinon.spy();

  apu.onHalfFrameClock();

  expect(apu.channels.triangle.halfFrame).to.have.been.calledOnce;
})({
  locales: {
    ru: "`onHalfFrameClock()` вызывает `halfFrame()` у треугольного канала",
    es: "`onHalfFrameClock()` llama a `halfFrame()` en el canal triangular",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleTimerHighLCL`: writes `lengthCounterLoad` (bits ~3-7~) and updates the length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.registers.write(0x400b, 0b10110000); // TriangleTimerHighLCL
  expect(apu.registers.triangle.timerHighLCL.lengthCounterLoad).to.equalN(
    0b10110, // index 22 => 96 in length table
    "lengthCounterLoad"
  );
  expect(apu.channels.triangle.lengthCounter.counter).to.equalN(96, "counter");
})({
  locales: {
    ru:
      "`TriangleTimerHighLCL`: записывает `lengthCounterLoad` (биты ~3-7~) и обновляет счётчик длины",
    es:
      "`TriangleTimerHighLCL`: escribe `lengthCounterLoad` (bits ~3-7~) y actualiza el contador de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`APUControl`: on writes, if `enableTriangle` is clear, resets the length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.triangle.lengthCounter.counter = 72;

  apu.registers.write(0x4015, 0b00000010);

  expect(apu.channels.triangle.lengthCounter.counter).to.equalN(0, "counter");
})({
  locales: {
    ru:
      "`APUControl`: при записи сбрасывает счётчик длины, если `enableTriangle` сброшен",
    es:
      "`APUControl`: en escrituras, si `enableTriangle` está apagada, reinicia el contador de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`APUControl`: on writes, if `enableTriangle` is set, it doesn't reset the length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.triangle.lengthCounter.counter = 72;

  apu.registers.write(0x4015, 0b00000110);

  expect(apu.channels.triangle.lengthCounter.counter).to.equalN(72, "counter");
})({
  locales: {
    ru:
      "`APUControl`: при записи не сбрасывает счётчик длины, если `enableTriangle` установлен",
    es:
      "`APUControl`: en escrituras, si `enableTriangle` está encendida, no reinicia el contador de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.12"),
});

// 5c.13 Triangle Channel (3/3): Linear length counter

it("`TriangleChannel`: has a `linearLengthCounter` property", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.triangle;

  expect(channel.linearLengthCounter, "linearLengthCounter").to.be.an("object");
})({
  locales: {
    ru: "`TriangleChannel`: содержит свойство `linearLengthCounter`",
    es: "`TriangleChannel`: tiene una propiedad `linearLengthCounter`",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: has `reload` and `reloadFlag` initialized to `0` and ~false~", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

  expect(linearLengthCounter.reload).to.equalN(0, "reload");
  expect(linearLengthCounter.reloadFlag).to.equalN(false, "reloadFlag");
})({
  locales: {
    ru:
      "`LinearLengthCounter`: начальные значения `reload` и `reloadFlag` равны `0` и ~false~",
    es:
      "`LinearLengthCounter`: tiene `reload` y `reloadFlag` inicializados en `0` y ~false~",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `isActive()` returns whether `counter` is greater than 0", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

  expect(linearLengthCounter).to.respondTo("isActive");

  linearLengthCounter.counter = 2;
  expect(linearLengthCounter.isActive()).to.equalN(true, "isActive()");

  linearLengthCounter.counter = 0;
  expect(linearLengthCounter.isActive()).to.equalN(false, "isActive()");

  linearLengthCounter.counter = 1;
  expect(linearLengthCounter.isActive()).to.equalN(true, "isActive()");
})({
  locales: {
    ru:
      "`LinearLengthCounter`: `isActive()` возвращает, больше ли `counter` нуля",
    es: "`LinearLengthCounter`: `isActive()` retorna si `counter` es mayor a 0",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `fullReset()` resets `counter`, `reload`, and `reloadFlag`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

  expect(linearLengthCounter).to.respondTo("fullReset");

  linearLengthCounter.counter = 5;
  linearLengthCounter.reload = 7;
  linearLengthCounter.reloadFlag = true;

  linearLengthCounter.fullReset();

  expect(linearLengthCounter.counter).to.equalN(0, "counter");
  expect(linearLengthCounter.reload).to.equalN(0, "reload");
  expect(linearLengthCounter.reloadFlag).to.equalN(false, "reloadFlag");
})({
  locales: {
    ru:
      "`LinearLengthCounter`: `fullReset()` сбрасывает `counter`, `reload` и `reloadFlag`",
    es:
      "`LinearLengthCounter`: `fullReset()` reinicia `counter`, `reload` y `reloadFlag`",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `clock(false, *)` resets `counter` but keeps `reload` and `reloadFlag`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

  expect(linearLengthCounter).to.respondTo("clock");

  linearLengthCounter.counter = 4;
  linearLengthCounter.reload = 9;
  linearLengthCounter.reloadFlag = true;

  linearLengthCounter.clock(false, true);

  expect(linearLengthCounter.counter).to.equalN(0, "counter");
  expect(linearLengthCounter.reload).to.equalN(9, "reload");
  expect(linearLengthCounter.reloadFlag).to.equalN(true, "reloadFlag");
})({
  locales: {
    ru:
      "`LinearLengthCounter`: `clock(false, *)` сбрасывает `counter`, но сохраняет `reload` и `reloadFlag`",
    es:
      "`LinearLengthCounter`: `clock(false, *)` reinicia `counter` pero mantiene `reload` y `reloadFlag`",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `clock(true, false)` with `reloadFlag` loads `reload` into `counter` and clears `reloadFlag`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

  expect(linearLengthCounter).to.respondTo("clock");

  linearLengthCounter.reload = 9;
  linearLengthCounter.reloadFlag = true;
  linearLengthCounter.counter = 0;

  linearLengthCounter.clock(true, false);

  expect(linearLengthCounter.counter).to.equalN(9, "counter");
  expect(linearLengthCounter.reloadFlag).to.equalN(false, "reloadFlag");
})({
  locales: {
    ru:
      "`LinearLengthCounter`: `clock(true, false)` при установленном `reloadFlag` загружает `reload` в `counter` и сбрасывает `reloadFlag`",
    es:
      "`LinearLengthCounter`: `clock(true, false)` con `reloadFlag` carga `reload` en `counter` y apaga `reloadFlag`",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `clock(true, true)` with `reloadFlag` and `isHalted` set loads `reload` but keeps `reloadFlag`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

  expect(linearLengthCounter).to.respondTo("clock");

  linearLengthCounter.reload = 11;
  linearLengthCounter.reloadFlag = true;
  linearLengthCounter.counter = 0;

  linearLengthCounter.clock(true, true);

  expect(linearLengthCounter.counter).to.equalN(11, "counter");
  expect(linearLengthCounter.reloadFlag).to.equalN(true, "reloadFlag");
})({
  locales: {
    ru:
      "`LinearLengthCounter`: `clock(true, true)` при установленных `reloadFlag` и `isHalted` загружает `reload`, но сохраняет `reloadFlag`",
    es:
      "`LinearLengthCounter`: `clock(true, true)` con `reloadFlag` y `isHalted` encendida carga `reload` y mantiene `reloadFlag`",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `clock(true, *)` when `reloadFlag` false and `counter > 0` decrements `counter`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

  expect(linearLengthCounter).to.respondTo("clock");

  linearLengthCounter.reloadFlag = false;
  linearLengthCounter.counter = 4;

  linearLengthCounter.clock(true, false);

  expect(linearLengthCounter.counter).to.equalN(3, "counter");
})({
  locales: {
    ru:
      "`LinearLengthCounter`: `clock(true, *)` при сброшенном `reloadFlag` и `counter > 0` уменьшает `counter`",
    es:
      "`LinearLengthCounter`: `clock(true, *)` cuando `reloadFlag` es false y `counter > 0` decrementa `counter`",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`TriangleChannel`: `sample()` just returns the <last sample> if the linear length counter is <not active>", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // enable triangle output
  apu.registers.apuControl.onWrite(0b11111111); // enables all channels
  apu.registers.triangle.lengthControl.onWrite(0b11111111); // sets reload value
  apu.registers.triangle.timerHighLCL.onWrite(0); // sets reload flag
  apu.registers.apuFrameCounter.onWrite(0); // triggers quarter&half frames

  // timer = 507 => freq = 110
  apu.registers.triangle.timerLow.onWrite(0b11111011); // low = 0b11111011
  apu.registers.triangle.timerHighLCL.onWrite(0b11111001); // high = 0b001

  // get the first non-zero sample
  let lastSample = 0;
  for (let i = 0; i < 10; i++) {
    lastSample = apu.channels.triangle.sample();
    if (lastSample !== 0) break;
  }
  if (lastSample === 0)
    throw new Error("The first 10 samples of triangle were 0.");

  // set another timer value
  apu.registers.triangle.timerLow.onWrite(0b10001011);
  apu.registers.triangle.timerHighLCL.onWrite(0b11111001);

  // reset linear length counter
  apu.channels.triangle.linearLengthCounter.fullReset();

  // when the length counter is 0, it should return the last sample
  expect(apu.channels.triangle.sample()).to.equalN(lastSample, "sample()");

  // it shouldn't update the oscillator frequency
  const frequency = Math.floor(apu.channels.triangle.oscillator.frequency);
  expect(frequency).to.equalN(110, "frequency");
})({
  locales: {
    ru:
      "`TriangleChannel`: `sample()` просто возвращает <последний отсчёт>, если линейный счётчик длины <неактивен>",
    es:
      "`TriangleChannel`: `sample()` solo retorna el <último sample> si el contador lineal de longitud <no está activo>",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`TriangleChannel`: `quarterFrame()` updates the linear length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.triangle;

  expect(channel).to.respondTo("quarterFrame");

  channel.linearLengthCounter.clock = sinon.spy();
  channel.isEnabled = () => true;
  channel.registers.lengthControl.onWrite(0b10000000); // halt = 1
  channel.quarterFrame();
  expect(channel.linearLengthCounter.clock).to.have.been.calledWith(true, 1);

  channel.linearLengthCounter.clock = sinon.spy();
  channel.isEnabled = () => true;
  channel.registers.lengthControl.onWrite(0b00000000); // halt = 0
  channel.quarterFrame();
  expect(channel.linearLengthCounter.clock).to.have.been.calledWith(true, 0);

  channel.linearLengthCounter.clock = sinon.spy();
  channel.isEnabled = () => false;
  channel.registers.lengthControl.onWrite(0b00000000); // halt = 0
  channel.quarterFrame();
  expect(channel.linearLengthCounter.clock).to.have.been.calledWith(false, 0);

  channel.linearLengthCounter.clock = sinon.spy();
  channel.isEnabled = () => false;
  channel.registers.lengthControl.onWrite(0b10000000); // halt = 1
  channel.quarterFrame();
  expect(channel.linearLengthCounter.clock).to.have.been.calledWith(false, 1);
})({
  locales: {
    ru: "`TriangleChannel`: `quarterFrame()` обновляет линейный счётчик длины",
    es:
      "`TriangleChannel`: `quarterFrame()` actualiza el contador lineal de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`TriangleLengthControl`: writes `linearCounterReload` and updates linear length counter's `reload`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.triangle;
  const register = apu.registers.triangle.lengthControl;

  apu.registers.write(0x4008, 0b01001011);
  expect(register.linearCounterReload).to.equalN(
    0b1001011,
    "linearCounterReload"
  );
  expect(channel.linearLengthCounter.reload).to.equalBin(0b1001011, "reload");
})({
  locales: {
    ru:
      "`TriangleLengthControl`: записывает `linearCounterReload` и обновляет `reload` линейного счётчика длины",
    es:
      "`TriangleLengthControl`: escribe `linearCounterReload` y actualiza el `reload` del contador lineal de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`TriangleTimerHighLCL`: writes set `reloadFlag` on channel's linearLengthCounter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.triangle;
  channel.linearLengthCounter.reloadFlag = false;
  apu.registers.write(0x400b, 0);
  expect(channel.linearLengthCounter.reloadFlag).to.equalN(true, "reloadFlag");
})({
  locales: {
    ru:
      "`TriangleTimerHighLCL`: запись устанавливает `reloadFlag` у linearLengthCounter канала",
    es:
      "`TriangleTimerHighLCL`: las escrituras encienden `reloadFlag` en el contador lineal de longitud del canal",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`APUControl`: on writes, if `enableTriangle` is clear, resets the linear length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

  linearLengthCounter.counter = 5;
  linearLengthCounter.reload = 8;
  linearLengthCounter.reloadFlag = true;

  apu.registers.apuControl.onWrite(0b00000000);

  expect(linearLengthCounter.counter).to.equalN(0, "counter");
  expect(linearLengthCounter.reload).to.equalN(0, "reload");
  expect(linearLengthCounter.reloadFlag).to.equalN(false, "reloadFlag");
})({
  locales: {
    ru:
      "`APUControl`: при записи сбрасывает линейный счётчик длины, если `enableTriangle` сброшен",
    es:
      "`APUControl`: en escrituras, si `enablePulse1` está apagada, reinicia el contador lineal de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`APUControl`: on writes, if `enableTriangle` is set, it doesn't reset the length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

  linearLengthCounter.counter = 5;
  linearLengthCounter.reload = 8;
  linearLengthCounter.reloadFlag = true;

  apu.registers.apuControl.onWrite(0b00000100);

  expect(linearLengthCounter.counter).to.equalN(5, "counter");
  expect(linearLengthCounter.reload).to.equalN(8, "reload");
  expect(linearLengthCounter.reloadFlag).to.equalN(true, "reloadFlag");
})({
  locales: {
    ru:
      "`APUControl`: при записи не сбрасывает счётчик длины, если `enableTriangle` установлен",
    es:
      "`APUControl`: en escrituras, si `enableTriangle` está encendida, no reinicia el contador lineal de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.13"),
});

// 5c.14 Noise Channel (1/3): Length counter

it("has a `NoiseChannel` instance", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.noise, "noise").to.be.an("object");
})({
  locales: {
    ru: "содержит экземпляр `NoiseChannel`",
    es: "tiene una instancia de `NoiseChannel`",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("`NoiseChannel`: has an `apu` reference", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.noise.apu).to.equalN(apu, "apu");
})({
  locales: {
    ru: "`NoiseChannel`: содержит ссылку `apu`",
    es: "`NoiseChannel`: tiene una referencia `apu`",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("`NoiseChannel`: has a `registers` property, pointing to the audio registers", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.noise.registers).to.equalN(
    apu.registers.noise,
    "registers"
  );
})({
  locales: {
    ru:
      "`NoiseChannel`: содержит свойство `registers`, указывающее на звуковые регистры",
    es:
      "`NoiseChannel`: tiene una propiedad `registers`, apuntando a los registros de audio",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("`NoiseChannel`: has an `isEnabled()` method that returns whether the channel is <enabled> or not in APUControl", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.noise).to.respondTo("isEnabled");

  apu.registers.apuControl.onWrite(0b1000);
  expect(apu.channels.noise.isEnabled()).to.equalN(true, "isEnabled()");

  apu.registers.apuControl.onWrite(0b0000);
  expect(apu.channels.noise.isEnabled()).to.equalN(false, "isEnabled()");
})({
  locales: {
    ru:
      "`NoiseChannel`: содержит метод `isEnabled()`, который возвращает, <включён> ли канал в APUControl",
    es:
      "`NoiseChannel`: tiene un método `isEnabled()` que retorna si el canal está <activo> o no en APUControl",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("`NoiseChannel`: has a `lengthCounter` property", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.noise;

  expect(channel.lengthCounter, "lengthCounter").to.be.an("object");
  expect(channel.lengthCounter.constructor).to.equalN(
    apu.channels.pulses[0].lengthCounter.constructor,
    "class"
  );
})({
  locales: {
    ru: "`NoiseChannel`: содержит свойство `lengthCounter`",
    es: "`NoiseChannel`: tiene una propiedad `lengthCounter`",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("`NoiseChannel`: has a `sample()` method that <returns a number>", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.noise).to.respondTo("sample");
  expect(apu.channels.noise.sample()).to.be.a("number");
})({
  locales: {
    ru: "`NoiseChannel`: содержит метод `sample()`, который <возвращает число>",
    es: "`NoiseChannel`: tiene un método `sample()` que <retorna un número>",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("`NoiseChannel`: `sample()` returns 0 when disabled or length counter inactive", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const channel = apu.channels.noise;

  // length counter not active
  channel.lengthCounter.isActive = () => false;
  apu.registers.apuControl.setValue(0b00001000);
  expect(channel.sample()).to.equalN(0, "sample()");

  // channel disabled
  channel.lengthCounter.isActive = () => true;
  apu.registers.apuControl.setValue(0b00000000);
  expect(channel.sample()).to.equalN(0, "sample()");
})({
  locales: {
    ru:
      "`NoiseChannel`: `sample()` возвращает 0, если канал выключен или счётчик длины неактивен",
    es:
      "`NoiseChannel`: `sample()` retorna 0 cuando está desactivado o el contador de longitud <no está activo>",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("calls noise channel's `step()` method on every APU `step(...)` call", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.noise;
  channel.step = sinon.spy();

  apu.step(noop);

  expect(channel.step).to.have.been.called;
})({
  locales: {
    ru:
      "вызывает метод `step()` шумового канала при каждом вызове `step(...)` APU",
    es:
      "llama al método `step()` del canal ruido en cada llamada a `step(...)` de la APU",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("mixes pulse1, pulse2, triangle and noise in `step()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const onSample = sinon.spy();

  apu.channels.pulses[0].sample = () => 1;
  apu.channels.pulses[1].sample = () => 2;
  apu.channels.triangle.sample = () => 3;
  apu.channels.noise.sample = () => 4;

  for (let i = 0; i < 19; i++) {
    apu.step(onSample);
    expect(onSample).to.not.have.been.called;
  }

  apu.step(onSample);
  expect(onSample).to.have.been.calledWith(0.1, 1, 2, 3, 4);
})({
  locales: {
    ru: "смешивает pulse1, pulse2, triangle и noise в `step()`",
    es: "mezcla pulse1, pulse2, triangle y noise en `step()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.14") && id < book.getId("5c.19"),
});

it("`onQuarterFrameClock()` calls `quarterFrame()` on noise channel", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.noise.quarterFrame = sinon.spy();

  apu.onQuarterFrameClock();

  expect(apu.channels.noise.quarterFrame).to.have.been.calledOnce;
})({
  locales: {
    ru: "`onQuarterFrameClock()` вызывает `quarterFrame()` у шумового канала",
    es: "`onQuarterFrameClock()` llama a `quarterFrame()` en NoiseChannel",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("`onHalfFrameClock()` calls `halfFrame()` on noise channel", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.noise.halfFrame = sinon.spy();

  apu.onHalfFrameClock();

  expect(apu.channels.noise.halfFrame).to.have.been.calledOnce;
})({
  locales: {
    ru: "`onHalfFrameClock()` вызывает `halfFrame()` у шумового канала",
    es: "`onHalfFrameClock()` llama a `halfFrame()` en NoiseChannel",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("`NoiseControl`: writes `volumeOrEnvelopePeriod`, `constantVolume`, `envelopeLoopOrLengthCounterHalt`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const register = apu.registers.noise.control;

  register.onWrite(0b00101101);
  expect(register.volumeOrEnvelopePeriod).to.equalN(
    0b1101,
    "volumeOrEnvelopePeriod"
  );
  expect(register.constantVolume).to.equalN(0, "constantVolume");
  expect(register.envelopeLoopOrLengthCounterHalt).to.equalN(
    1,
    "envelopeLoopOrLengthCounterHalt"
  );

  register.onWrite(0b00010010);
  expect(register.volumeOrEnvelopePeriod).to.equalN(
    0b0010,
    "volumeOrEnvelopePeriod"
  );
  expect(register.constantVolume).to.equalN(1, "constantVolume");
  expect(register.envelopeLoopOrLengthCounterHalt).to.equalN(
    0,
    "envelopeLoopOrLengthCounterHalt"
  );
})({
  locales: {
    ru:
      "`NoiseControl`: записывает `volumeOrEnvelopePeriod`, `constantVolume`, `envelopeLoopOrLengthCounterHalt`",
    es:
      "`NoiseControl`: escribe `volumeOrEnvelopePeriod`, `constantVolume`, `envelopeLoopOrLengthCounterHalt`",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("`NoiseLCL`: writes `lengthCounterLoad` (bits ~3-7~) and updates the length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // index 22 -> length 96
  apu.registers.write(0x400f, 0b10110000);
  expect(apu.registers.noise.lcl.lengthCounterLoad).to.equalN(
    0b10110,
    "lengthCounterLoad"
  );
  expect(apu.channels.noise.lengthCounter.counter).to.equalN(96, "counter");

  // index 12 -> length 14
  apu.registers.write(0x400f, 0b01100000);
  expect(apu.registers.noise.lcl.lengthCounterLoad).to.equalN(
    0b01100,
    "lengthCounterLoad"
  );
  expect(apu.channels.noise.lengthCounter.counter).to.equalN(14, "counter");
})({
  locales: {
    ru:
      "`NoiseLCL`: записывает `lengthCounterLoad` (биты ~3-7~) и обновляет счётчик длины",
    es:
      "`NoiseLCL`: escribe `lengthCounterLoad` (bits ~3-7~) y actualiza el contador de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("`APUControl`: on writes, if `enableNoise` is clear, resets the length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.noise.lengthCounter.counter = 45;

  apu.registers.write(0x4015, 0b00000111);

  expect(apu.channels.noise.lengthCounter.counter).to.equalN(0, "counter");
})({
  locales: {
    ru:
      "`APUControl`: при записи сбрасывает счётчик длины, если `enableNoise` сброшен",
    es:
      "`APUControl`: en escrituras, si `enableNoise` está apagada, reinicia el contador de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

it("`APUControl`: on writes, if `enableNoise` is set, it doesn't reset the noise channel length counter", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.channels.noise.lengthCounter.counter = 45;

  apu.registers.write(0x4015, 0b00001000);

  expect(apu.channels.noise.lengthCounter.counter).to.equalN(45, "counter");
})({
  locales: {
    ru:
      "`APUControl`: при записи не сбрасывает счётчик длины шумового канала, если `enableNoise` установлен",
    es:
      "`APUControl`: en escrituras, si `enableNoise` está encendida, no reinicia el contador de longitud",
  },
  use: ({ id }, book) => id >= book.getId("5c.14"),
});

// 5c.15 Noise Channel (2/3): Linear-feedback shift register

it("`NoiseForm`: writes `periodId` (bits ~0-3~) and `mode` (bit 7)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const register = apu.registers.noise.form;

  register.onWrite(0b10000101);
  expect(register.periodId).to.equalBin(0b0101, "periodId");
  expect(register.mode).to.equalN(1, "mode");

  register.onWrite(0b00001010);
  expect(register.periodId).to.equalBin(0b1010, "periodId");
  expect(register.mode).to.equalN(0, "mode");
})({
  locales: {
    ru: "`NoiseForm`: записывает `periodId` (биты ~0-3~) и `mode` (бит 7)",
    es: "`NoiseForm`: escribe `periodId` (bits ~0-3~) y `mode` (bit 7)",
  },
  use: ({ id }, book) => id >= book.getId("5c.15"),
});

it("`NoiseChannel`: has `shift` and `dividerCount` initialized to 1 and 0", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.noise;

  expect(channel.shift).to.equalN(1, "shift");
  expect(channel.dividerCount).to.equalN(0, "dividerCount");
})({
  locales: {
    ru:
      "`NoiseChannel`: начальные значения `shift` и `dividerCount` равны 1 и 0",
    es: "`NoiseChannel`: tiene `shift` y `dividerCount` inicializados en 1 y 0",
  },
  use: ({ id }, book) => id >= book.getId("5c.15"),
});

it("`NoiseChannel`: `sample()` returns 0 when `shift & 1` is 1", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.noise;

  // enable noise and make lengthCounter active
  channel.lengthCounter.isActive = () => true;
  apu.registers.apuControl.onWrite(0b01000);
  channel.registers.control.onWrite(0b00010101); // volume = 5

  channel.shift = 1; // bit 0 == 1
  expect(channel.sample()).to.equalN(0, "sample()");
})({
  locales: {
    ru: "`NoiseChannel`: `sample()` возвращает 0, если `shift & 1` равен 1",
    es: "`NoiseChannel`: `sample()` retorna 0 cuando `shift & 1` es 1",
  },
  use: ({ id }, book) => id >= book.getId("5c.15"),
});

it("`NoiseChannel`: `sample()` returns the volume when `shift & 1` is 0", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.noise;

  // enable noise and make lengthCounter active
  channel.lengthCounter.isActive = () => true;
  apu.registers.apuControl.onWrite(0b01000);
  channel.registers.control.onWrite(0b00010101); // volume = 5

  channel.shift = 2; // bit 0 == 0
  expect(channel.sample()).to.equalN(5, "sample()");
})({
  locales: {
    ru:
      "`NoiseChannel`: `sample()` возвращает громкость, если `shift & 1` равен 0",
    es: "`NoiseChannel`: `sample()` retorna el volumen cuando `shift & 1` es 0",
  },
  use: ({ id }, book) => id >= book.getId("5c.15"),
});

it("`NoiseChannel`: `step()` increments `dividerCount` and updates `shift` every noise period", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.noise;

  // periodId = 0 => period = noisePeriods[0] = 2
  apu.registers.noise.form.onWrite(0b00000000);

  // first call: dividerCount = 1, no shift update
  channel.step();
  expect(channel.dividerCount).to.equalN(1, "dividerCount");
  expect(channel.shift).to.equalN(1, "shift");

  // second call: dividerCount reaches 2 => reset and update shift
  channel.step();
  expect(channel.dividerCount).to.equalN(0, "dividerCount");
  // feedback = bit0 ^ bit1 = 1 ^ 0 = 1, new shift = (1>>1)=0 | (1<<14)=16384
  expect(channel.shift).to.equalN(16384, "shift");
})({
  locales: {
    ru:
      "`NoiseChannel`: `step()` увеличивает `dividerCount` и обновляет `shift` каждый период шума",
    es:
      "`NoiseChannel`: `step()` incrementa `dividerCount` y actualiza `shift` cada período de ruido",
  },
  use: ({ id }, book) => id >= book.getId("5c.15"),
});

it("`NoiseChannel`: `step()` resets `dividerCount` when it's >= the noise period", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.noise;
  channel.dividerCount = 99;

  // periodId = 0 => period = noisePeriods[0] = 2
  apu.registers.noise.form.onWrite(0b00000000);

  channel.step();
  expect(channel.dividerCount).to.equalN(0, "dividerCount");
})({
  locales: {
    ru:
      "`NoiseChannel`: `step()` сбрасывает `dividerCount`, если он >= периода шума",
    es:
      "`NoiseChannel`: `step()` reinicia `dividerCount` cuando es >= al período de ruido",
  },
  use: ({ id }, book) => id >= book.getId("5c.15"),
});

it("`NoiseChannel`: `step()` uses `mode` flag to compute feedback bit", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const channel = apu.channels.noise;

  // periodId = 1 => period = 4, and mode = 1
  apu.registers.noise.form.onWrite(0b10000001);
  // set shift so bit0=0, bit6=1
  channel.shift = 0b001010101001100;
  channel.dividerCount = 2;

  // first call: dividerCount = 3, no shift update
  channel.step();
  expect(channel.dividerCount).to.equalN(3, "dividerCount");
  expect(channel.shift).to.equalBin(0b001010101001100, "shift");

  // next step triggers update
  channel.step();
  expect(channel.dividerCount).to.equalN(0, "dividerCount");
  // feedback = bit0 ^ bit6 = 0 ^ 1 = 1,
  // new shift = (0b001010101001100 >> 1) | (1 << 14)
  expect(channel.shift).to.equalBin(0b100101010100110, "shift");
})({
  locales: {
    ru:
      "`NoiseChannel`: `step()` использует флаг `mode` для вычисления бита обратной связи",
    es:
      "`NoiseChannel`: `step()` usa la bandera `mode` para calcular el bit de feedback",
  },
  use: ({ id }, book) => id >= book.getId("5c.15"),
});

it("`NoiseChannel`: `step()` uses an exclusive OR (~^~) for the feedback bit", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const channel = apu.channels.noise;

  // periodId = 1 => period = 4, and mode = 1
  apu.registers.noise.form.onWrite(0b10000001);
  // set shift so bit0=1, bit6=1
  channel.shift = 0b100110111001101;
  channel.dividerCount = 2;

  // first call: dividerCount = 3, no shift update
  channel.step();
  expect(channel.dividerCount).to.equalN(3, "dividerCount");
  expect(channel.shift).to.equalBin(0b100110111001101, "shift");

  // next step triggers update
  channel.step();
  expect(channel.dividerCount).to.equalN(0, "dividerCount");
  // feedback = bit0 ^ bit6 = 1 ^ 1 = 0
  // new shift = (0b100110111001101 >> 1) | (0 << 14)
  expect(channel.shift).to.equalBin(0b10011011100110, "shift");
})({
  locales: {
    ru:
      "`NoiseChannel`: `step()` использует исключающее ИЛИ (~^~) для бита обратной связи",
    es:
      "`NoiseChannel`: `step()` usa un OR exclusivo (~^~) para el bit de feedback",
  },
  use: ({ id }, book) => id >= book.getId("5c.15"),
});

// 5c.16 Noise Channel (3/3): Volume envelope

it("`NoiseChannel`: has a `volumeEnvelope` property", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.noise;

  expect(channel.volumeEnvelope, "volumeEnvelope").to.be.an("object");
  expect(channel.volumeEnvelope.constructor).to.equalN(
    apu.channels.pulses[0].volumeEnvelope.constructor,
    "class"
  );
})({
  locales: {
    ru: "`NoiseChannel`: содержит свойство `volumeEnvelope`",
    es: "`NoiseChannel`: tiene una propiedad `volumeEnvelope`",
  },
  use: ({ id }, book) => id >= book.getId("5c.16"),
});

it("`NoiseChannel`: `sample()` uses the envelope volume when `constantVolume` is clear", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.noise;

  // enable noise and active length
  channel.lengthCounter.isActive = () => true;
  apu.registers.apuControl.onWrite(0b01000);
  channel.shift = 0;
  channel.registers.control.onWrite(0b00000101); // volume=5, constantVolume=0
  channel.volumeEnvelope.volume = 3;

  expect(channel.sample()).to.equalN(3, "sample()");
})({
  locales: {
    ru:
      "`NoiseChannel`: `sample()` использует громкость огибающей, если `constantVolume` сброшен",
    es:
      "`NoiseChannel`: `sample()` usa el volumen de la envolvente cuando `constantVolume` está desactivado",
  },
  use: ({ id }, book) => id >= book.getId("5c.16"),
});

it("`NoiseChannel`: `quarterFrame()` updates the volume envelope", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.noise;
  channel.volumeEnvelope.clock = sinon.spy();

  channel.registers.control.onWrite(0b00100110); // period=6, loop=1
  channel.quarterFrame();

  expect(channel.volumeEnvelope.clock).to.have.been.calledWith(6, 1);
})({
  locales: {
    ru: "`NoiseChannel`: `quarterFrame()` обновляет огибающую громкости",
    es: "`NoiseChannel`: `quarterFrame()` actualiza la envolvente de volumen",
  },
  use: ({ id }, book) => id >= book.getId("5c.16"),
});

it("`NoiseLCL`: writes set the `startFlag` on the channel's volume envelope", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const envelope = apu.channels.noise.volumeEnvelope;

  envelope.startFlag = false;
  apu.registers.write(0x400f, 0);
  expect(envelope.startFlag).to.equalN(true, "startFlag");

  envelope.startFlag = false;
  apu.registers.write(0x400f, 123);
  expect(envelope.startFlag).to.equalN(true, "startFlag");
})({
  locales: {
    ru:
      "`NoiseLCL`: запись устанавливает `startFlag` огибающей громкости канала",
    es:
      "`NoiseLCL`: las escrituras encienden `startFlag` en la envolvente de volumen del canal",
  },
  use: ({ id }, book) => id >= book.getId("5c.16"),
});

// 5c.17 DMC Channel (1/2): Direct load

it("has a `DMCChannel` instance", () => {
  const APU = mainModule.default.APU;
  const cpu = {};

  const apu = new APU(cpu);

  expect(apu.channels.dmc, "dmc").to.be.an("object");
})({
  locales: {
    ru: "содержит экземпляр `DMCChannel`",
    es: "tiene una instancia de `DMCChannel`",
  },
  use: ({ id }, book) => id >= book.getId("5c.17"),
});

it("`DMCChannel`: has an `apu` reference", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.dmc.apu).to.equalN(apu, "apu");
})({
  locales: {
    ru: "`DMCChannel`: содержит ссылку `apu`",
    es: "`DMCChannel`: tiene una referencia `apu`",
  },
  use: ({ id }, book) => id >= book.getId("5c.17"),
});

it("`DMCChannel`: has a `cpu` reference", () => {
  const APU = mainModule.default.APU;
  const cpu = {};
  const apu = new APU(cpu);

  expect(apu.channels.dmc.cpu).to.equalN(cpu, "cpu");
})({
  locales: {
    ru: "`DMCChannel`: содержит ссылку `cpu`",
    es: "`DMCChannel`: tiene una referencia `cpu`",
  },
  use: ({ id }, book) => id >= book.getId("5c.17"),
});

it("`DMCChannel`: has a `registers` property, pointing to the audio registers", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  expect(apu.channels.dmc.registers).to.equalN(apu.registers.dmc, "registers");
})({
  locales: {
    ru:
      "`DMCChannel`: содержит свойство `registers`, указывающее на звуковые регистры",
    es:
      "`DMCChannel`: tiene una propiedad `registers`, apuntando a los registros de audio",
  },
  use: ({ id }, book) => id >= book.getId("5c.17"),
});

it("`DMCChannel`: has an `outputSample` property initialized to 0", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.dmc;

  expect(channel.outputSample).to.equalN(0, "outputSample");
})({
  locales: {
    ru:
      "`DMCChannel`: содержит свойство `outputSample` с начальным значением 0",
    es: "`DMCChannel`: tiene una propiedad `outputSample` inicializada en 0",
  },
  use: ({ id }, book) => id >= book.getId("5c.17"),
});

it("`DMCChannel`: `sample()` returns `outputSample`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.dmc;

  channel.outputSample = 42;
  expect(channel.sample()).to.equalN(42, "sample()");
})({
  locales: {
    ru: "`DMCChannel`: `sample()` возвращает `outputSample`",
    es: "`DMCChannel`: `sample()` retorna `outputSample`",
  },
  use: ({ id }, book) => id >= book.getId("5c.17"),
});

it("`DMCLoad`: writes `directLoad` (bits ~0-6~) and updates channel's `outputSample`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  apu.registers.write(0x4011, 0b11001000);
  expect(apu.registers.dmc.load.directLoad).to.equalBin(
    0b1001000,
    "directLoad"
  );
  expect(apu.channels.dmc.outputSample).to.equalBin(0b1001000, "outputSample");

  apu.registers.write(0x4011, 42);
  expect(apu.registers.dmc.load.directLoad).to.equalN(42, "directLoad");
  expect(apu.channels.dmc.outputSample).to.equalN(42, "outputSample");
})({
  locales: {
    ru:
      "`DMCLoad`: записывает `directLoad` (биты ~0-6~) и обновляет `outputSample` канала",
    es:
      "`DMCLoad`: escribe `directLoad` (bits ~0-6~) y actualiza `outputSample` del canal",
  },
  use: ({ id }, book) => id >= book.getId("5c.17"),
});

it("mixes pulse1, pulse2, triangle, noise and dmc in `step()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const onSample = sinon.spy();

  apu.channels.pulses[0].sample = () => 1;
  apu.channels.pulses[1].sample = () => 2;
  apu.channels.triangle.sample = () => 3;
  apu.channels.noise.sample = () => 4;
  apu.channels.dmc.sample = () => 5;

  for (let i = 0; i < 19; i++) {
    apu.step(onSample);
    expect(onSample).to.not.have.been.called;
  }

  apu.step(onSample);
  expect(onSample).to.have.been.calledWith(0.15, 1, 2, 3, 4, 5);
})({
  locales: {
    ru: "смешивает pulse1, pulse2, triangle, noise и dmc в `step()`",
    es: "mezcla pulse1, pulse2, triangle, noise y dmc en `step()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.17") && id < book.getId("5c.19"),
});

// 5c.18 DMC Channel (2/2): DPCM

it("`DMCChannel`: has a `dpcm` property with the correct DPCM class", async () => {
  mainModule = await evaluate();
  const DPCMClass = (await evaluateModule($.modules["/lib/apu/DPCM.js"]))
    .default;
  const APU = mainModule.default.APU;

  const apu = new APU({});

  expect(apu.channels.dmc).to.include.key("dpcm");
  expect(apu.channels.dmc.dpcm).to.be.an("object");
  expect(apu.channels.dmc.dpcm.constructor).to.equalN(DPCMClass, "class");
})({
  locales: {
    ru: "`DMCChannel`: содержит свойство `dpcm` с нужным классом DPCM",
    es: "`DMCChannel`: tiene una propiedad `dpcm` con la clase DPCM correcta",
  },
  use: ({ id }, book) => id >= book.getId("5c.18"),
});

it("`DMCChannel`: `step()` calls `dpcm.update()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const channel = apu.channels.dmc;
  channel.dpcm.update = sinon.spy();

  channel.step();

  expect(channel.dpcm.update).to.have.been.calledOnce;
})({
  locales: {
    ru: "`DMCChannel`: `step()` вызывает `dpcm.update()`",
    es: "`DMCChannel`: `step()` llama a `dpcm.update()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.18"),
});

it("`APUControl`: writing with `enableDMC` clear calls `dpcm.stop()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const dpcm = apu.channels.dmc.dpcm;
  dpcm.stop = sinon.spy();

  apu.registers.write(0x4015, 0b00000);

  expect(dpcm.stop).to.have.been.calledOnce;
})({
  locales: {
    ru:
      "`APUControl`: запись при сброшенном `enableDMC` вызывает `dpcm.stop()`",
    es:
      "`APUControl`: al escribir con `enableDMC` apagada llama a `dpcm.stop()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.18"),
});

it("`APUControl`: writing with `enableDMC` set and no remaining bytes calls `dpcm.start()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const dpcm = apu.channels.dmc.dpcm;
  dpcm.start = sinon.spy();
  dpcm.remainingBytes = () => 0;

  apu.registers.write(0x4015, 0b10000);

  expect(dpcm.start).to.have.been.calledOnce;
})({
  locales: {
    ru:
      "`APUControl`: запись при установленном `enableDMC` и отсутствии оставшихся байтов вызывает `dpcm.start()`",
    es:
      "`APUControl`: al escribir con `enableDMC` encendida y sin bytes restantes llama a `dpcm.start()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.18"),
});

it("`APUControl`: writing with `enableDMC` set and remaining bytes does not call `dpcm.start()`", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  const dpcm = apu.channels.dmc.dpcm;
  dpcm.start = sinon.spy();
  dpcm.remainingBytes = () => 5;

  apu.registers.write(0x4015, 0b00000);

  expect(dpcm.start).to.not.have.been.called;
})({
  locales: {
    ru:
      "`APUControl`: запись при установленном `enableDMC` и наличии оставшихся байтов не вызывает `dpcm.start()`",
    es:
      "`APUControl`: al escribir con `enableDMC` encendida y con bytes restantes no llama a `dpcm.start()`",
  },
  use: ({ id }, book) => id >= book.getId("5c.18"),
});

// 5c.19 Mixer and APUStatus

it("mixes pulse1, pulse2, triangle, noise and dmc in `step()` (<correct mix>)", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});
  const onSample = sinon.spy();

  apu.channels.pulses[0].sample = () => 1;
  apu.channels.pulses[1].sample = () => 2;
  apu.channels.triangle.sample = () => 3;
  apu.channels.noise.sample = () => 4;
  apu.channels.dmc.sample = () => 5;

  for (let i = 0; i < 19; i++) {
    apu.step(onSample);
    expect(onSample).to.not.have.been.called;
  }

  apu.step(onSample);
  // 0.00752*(1+2) + 0.00851*3 + 0.00494*4 + 0.00335*5 = 0.0846
  expect(onSample).to.have.been.calledWith(0.0846, 1, 2, 3, 4, 5);
})({
  locales: {
    ru:
      "смешивает pulse1, pulse2, triangle, noise и dmc в `step()` (<правильная смесь>)",
    es:
      "mezcla pulse1, pulse2, triangle, noise y dmc en `step()` (<mezcla correcta>)",
  },
  use: ({ id }, book) => id >= book.getId("5c.19"),
});

it("`APUStatus`: reads return 0 when all channels inactive and no DMC bytes", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // ensure all length counters are zero and DMC has no bytes
  apu.channels.pulses[0].lengthCounter.counter = 0;
  apu.channels.pulses[1].lengthCounter.counter = 0;
  apu.channels.triangle.lengthCounter.counter = 0;
  apu.channels.noise.lengthCounter.counter = 0;
  apu.channels.dmc.dpcm.remainingBytes = () => 0;

  expect(apu.registers.apuStatus.onRead()).to.equalN(0, "onRead()");
})({
  locales: {
    ru:
      "`APUStatus`: чтение возвращает 0, если все каналы неактивны и у DMC нет байтов",
    es:
      "`APUStatus`: las lecturas retornan 0 cuando todos los canales están inactivos y DMC sin bytes",
  },
  use: ({ id }, book) => id >= book.getId("5c.19"),
});

it("`APUStatus`: reads return a <bitfield> for active channels and DMC", () => {
  const APU = mainModule.default.APU;
  const apu = new APU({});

  // set some length counters and DMC bytes
  apu.channels.pulses[0].lengthCounter.counter = 1; // bit 0
  apu.channels.pulses[1].lengthCounter.counter = 0; // bit 1
  apu.channels.triangle.lengthCounter.counter = 2; // bit 2
  apu.channels.noise.lengthCounter.counter = 0; // bit 3
  apu.channels.dmc.dpcm.remainingBytes = () => 5; // bit 4

  // expected bits: b4=1,b3=0,b2=1,b1=0,b0=1 => 0b10101 = 21
  expect(apu.registers.apuStatus.onRead()).to.equalBin(0b10101, "onRead()");
})({
  locales: {
    ru: "`APUStatus`: чтение возвращает <битовое поле> активных каналов и DMC",
    es:
      "`APUStatus`: las lecturas retornan un <bitfield> para canales activos y DMC",
  },
  use: ({ id }, book) => id >= book.getId("5c.19"),
});
