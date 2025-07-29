const { evaluate, byte, lodash: _ } = $;

let mainModule, Console;
before(async () => {
	mainModule = await evaluate();
});

const dummyPpu = {};
const dummyControllers = [];
const dummyCartridge = {
	header: {
		mirroringId: "VERTICAL",
	},
};
const dummyMapper = {
	cpuRead: () => 0,
	cpuWrite: () => {},
	ppuRead: () => 0,
	ppuWrite: () => {},
	tick: () => {},
};
const noop = () => {};

// 5c.1 New APU

it("`/code/index.js` exports an object containing the `APU` class", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("APU");
	expect(mainModule.default.APU).to.be.a.class;
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase `APU`",
	},
	use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("receives and saves the `cpu` property", () => {
	const APU = mainModule.default.APU;
	const cpu = {};
	const apu = new APU(cpu);
	apu.should.include.key("cpu");
	apu.cpu.should.equal(cpu);
})({
	locales: {
		es: "recibe y guarda una propiedad `cpu`",
	},
	use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("initializates the counters", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.should.include.key("sampleCounter");
	apu.should.include.key("sample");

	apu.sampleCounter.should.equalN(0, "sampleCounter");
	apu.sample.should.equalN(0, "sample");
})({
	locales: {
		es: "inicializa los contadores",
	},
	use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("increments the sample counter on every `step(...)` call", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	apu.should.respondTo("step");

	for (let i = 0; i < 5; i++) {
		apu.step(() => {});
		apu.sampleCounter.should.equalN(i + 1, "sampleCounter");
	}
})({
	locales: {
		es: "incrementa el contador de samples en cada llamada a `step(...)`",
	},
	use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("generates a new sample for every 20 `step(...)` calls", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	apu.should.respondTo("step");
	const onSample = sinon.spy();

	apu.sample = 15;

	for (let i = 0; i < 19; i++) {
		apu.step(onSample);

		apu.sampleCounter.should.equalN(i + 1, "sampleCounter");
		onSample.should.not.have.been.called;
	}

	apu.step(onSample);
	apu.sampleCounter.should.equalN(0, "sampleCounter");
	onSample.should.have.been.calledWith(apu.sample);
})({
	locales: {
		es: "generate un nuevo sample por cada 20 llamadas a `step(...)`",
	},
	use: ({ id }, book) => id >= book.getId("5c.1"),
});

// 5c.4 Audio Registers

it("includes a `registers` property with 21 audio registers", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.should.include.key("registers");
	expect(apu.registers, "registers").to.be.an("object");
	apu.registers.should.respondTo("read");
	apu.registers.should.respondTo("write");

	const checkRegister = (key, address, read = true, write = true) => {
		const register = _.get(apu.registers, key);

		expect(register, `apu.registers.${key}`).to.be.an("object");
		register.should.respondTo("onRead");
		register.should.respondTo("onWrite");
		register.onRead = sinon.spy();
		register.onWrite = sinon.spy();

		apu.registers.read(address);
		apu.registers.write(address, 123);

		if (read) register.onRead.should.have.been.calledOnce;
		else register.onRead.should.have.not.been.called;

		if (write) register.onWrite.should.have.been.calledWith(123);
		else register.onWrite.should.have.not.been.called;
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
		es: "incluye una propiedad `registers` con 21 registros de audio",
	},
	use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("connects the audio registers to CPU memory (reads)", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const cpuMemory = new CPUMemory();
	const cpu = { memory: cpuMemory };
	const APU = mainModule.default.APU;
	const apu = new APU(cpu);
	cpuMemory.onLoad(dummyPpu, apu, dummyMapper, dummyControllers);

	const checkRegister = (key, address, shouldBeAccessed = true) => {
		const register = _.get(apu.registers, key);
		expect(register, `apu.registers.${key}`).to.be.an("object");
		register.onRead = sinon.spy();

		cpuMemory.read(address);

		if (shouldBeAccessed) {
			expect(register.onRead, `apu.registers.${key}.onRead`).to.have.been
				.calledOnce;
		} else {
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
		es: "conecta los registros de audio con la memoria de CPU (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("connects the audio registers to CPU memory (writes)", () => {
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
		es: "conecta los registros de audio con la memoria de CPU (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("except `APUStatus`, all registers are write only", () => {
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
		register.onRead().should.equalN(0, "onRead()");
	});
})({
	locales: {
		es: "excepto `APUStatus`, todos los registros son solo escritura",
	},
	use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`PulseControl`: writes `volumeOrEnvelopePeriod` (bits 0-3)", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	[
		["pulse1Control", apu.registers.pulses[0].control],
		["pulse2Control", apu.registers.pulses[1].control],
	].forEach(([name, register]) => {
		const key = `${name}.volumeOrEnvelopePeriod`;

		register.onWrite(0b10100000);
		register.volumeOrEnvelopePeriod.should.equalN(0, key);
		register.onWrite(0b10100001);
		register.volumeOrEnvelopePeriod.should.equalN(1, key);
		register.onWrite(0b10100110);
		register.volumeOrEnvelopePeriod.should.equalN(6, key);
		register.onWrite(0b10101111);
		register.volumeOrEnvelopePeriod.should.equalN(15, key);
	});
})({
	locales: {
		es: "`PulseControl`: escribe `volumeOrEnvelopePeriod` (bits 0-3)",
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
		register.constantVolume.should.equalN(0, key);
		register.onWrite(0b10110011);
		register.constantVolume.should.equalN(1, key);
	});
})({
	locales: {
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
		register.envelopeLoopOrLengthCounterHalt.should.equalN(0, key);
		register.onWrite(0b10100011);
		register.envelopeLoopOrLengthCounterHalt.should.equalN(1, key);
	});
})({
	locales: {
		es: "`PulseControl`: escribe `envelopeLoopOrLengthCounterHalt` (bit 5)",
	},
	use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`PulseControl`: writes `dutyCycleId` (bits 6-7)", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	[
		["pulse1Control", apu.registers.pulses[0].control],
		["pulse2Control", apu.registers.pulses[1].control],
	].forEach(([name, register]) => {
		const key = `${name}.dutyCycleId`;

		register.onWrite(0b00000011);
		register.dutyCycleId.should.equalN(0, key);
		register.onWrite(0b01000011);
		register.dutyCycleId.should.equalN(1, key);
		register.onWrite(0b10000011);
		register.dutyCycleId.should.equalN(2, key);
		register.onWrite(0b11000011);
		register.dutyCycleId.should.equalN(3, key);
	});
})({
	locales: {
		es: "`PulseControl`: escribe `dutyCycleId` (bits 6-7)",
	},
	use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`TriangleTimerLow`: writes the value", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const triangleTimerLow = apu.registers.triangle.timerLow;
	triangleTimerLow.onWrite(129);
	triangleTimerLow.value.should.equalN(129, "triangle.timerLow.value");
})({
	locales: {
		es: "`TriangleTimerLow`: escribe el valor",
	},
	use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`DMCSampleAddress`: writes the value", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const dmcSampleAddress = apu.registers.dmc.sampleAddress;
	dmcSampleAddress.onWrite(135);
	dmcSampleAddress.value.should.equalN(135, "dmc.sampleAddress.value");
})({
	locales: {
		es: "`DMCSampleAddress`: escribe el valor",
	},
	use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`DMCSampleLength`: writes the value", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const dmcSampleLength = apu.registers.dmc.sampleLength;
	dmcSampleLength.onWrite(172);
	dmcSampleLength.value.should.equalN(172, "dmc.sampleLength.value");
})({
	locales: {
		es: "`DMCSampleLength`: escribe el valor",
	},
	use: ({ id }, book) => id >= book.getId("5c.4"),
});

it("`APUControl`: writes the channel enable fields (bits 0-4)", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const register = apu.registers.apuControl;

	register.onWrite(0b10100);
	register.enablePulse1.should.equalN(0, "enablePulse1");
	register.enablePulse2.should.equalN(0, "enablePulse2");
	register.enableTriangle.should.equalN(1, "enableTriangle");
	register.enableNoise.should.equalN(0, "enableNoise");
	register.enableDMC.should.equalN(1, "enableDMC");

	register.onWrite(0b01001);
	register.enablePulse1.should.equalN(1, "enablePulse1");
	register.enablePulse2.should.equalN(0, "enablePulse2");
	register.enableTriangle.should.equalN(0, "enableTriangle");
	register.enableNoise.should.equalN(1, "enableNoise");
	register.enableDMC.should.equalN(0, "enableDMC");

	register.onWrite(0b11010);
	register.enablePulse1.should.equalN(0, "enablePulse1");
	register.enablePulse2.should.equalN(1, "enablePulse2");
	register.enableTriangle.should.equalN(0, "enableTriangle");
	register.enableNoise.should.equalN(1, "enableNoise");
	register.enableDMC.should.equalN(1, "enableDMC");

	register.onWrite(0b11111);
	register.enablePulse1.should.equalN(1, "enablePulse1");
	register.enablePulse2.should.equalN(1, "enablePulse2");
	register.enableTriangle.should.equalN(1, "enableTriangle");
	register.enableNoise.should.equalN(1, "enableNoise");
	register.enableDMC.should.equalN(1, "enableDMC");
})({
	locales: {
		es:
			"`APUControl`: escribe los campos de habilitación de canales (bits 0-4)",
	},
	use: ({ id }, book) => id >= book.getId("5c.4"),
});

// 5c.5 Pulse Channels (1/5): Channel setup

it("has `PulseChannel` instances", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	expect(apu.channels, "channels").to.be.an("object");
	expect(apu.channels.pulses, "pulses").to.be.an("array");
	apu.channels.pulses.length.should.equalN(2, "pulses.length");

	for (let i = 0; i < 2; i++) {
		expect(apu.channels.pulses[i], `pulses[${i}]`).to.be.an("object");
		expect(apu.channels.pulses[i].constructor, `pulses[${i}].constructor`).to.be
			.a.class;
	}

	const pulse1Class = apu.channels.pulses[0].constructor;
	const pulse2Class = apu.channels.pulses[1].constructor;
	pulse1Class.should.equalN(pulse2Class, "class");
	apu.channels.pulses[0].should.not.equalN(apu.channels.pulses[1], "instance");
})({
	locales: {
		es: "tiene instancias de `PulseChannel`",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has an `apu` reference", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++)
		apu.channels.pulses[i].apu.should.equalN(apu, `[${i}].apu`);
})({
	locales: {
		es: "`PulseChannel`: tiene una referencia `apu`",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has an `id`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++)
		apu.channels.pulses[i].id.should.equalN(i, `[${i}].id`);
})({
	locales: {
		es: "`PulseChannel`: tiene un `id`",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has an `enableFlagName`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const pulse1FlagName = apu.channels.pulses[0].enableFlagName;
	const pulse2FlagName = apu.channels.pulses[1].enableFlagName;
	pulse1FlagName.should.equalN("enablePulse1", "enableFlagName");
	pulse2FlagName.should.equalN("enablePulse2", "enableFlagName");
})({
	locales: {
		es: "`PulseChannel`: tiene un `enableFlagName`",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has a `timer` initialized at 0", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++)
		apu.channels.pulses[i].timer.should.equalN(0, "`[${i}].timer`");
})({
	locales: {
		es: "`PulseChannel`: tiene un `timer` inicializado en 0",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has a `registers` property, pointing to the audio registers", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++)
		apu.channels.pulses[i].registers.should.equalN(
			apu.registers.pulses[i],
			`[${i}].registers`
		);
})({
	locales: {
		es:
			"`PulseChannel`: tiene una propiedad `registers`, apuntando a los registros de audio",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has an `isEnabled()` method that returns whether the channel is enabled or not in APUControl", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.channels.pulses[0].should.respondTo("isEnabled");
	apu.channels.pulses[1].should.respondTo("isEnabled");

	apu.registers.apuControl.onWrite(0b00);
	apu.channels.pulses[0].isEnabled().should.equalN(false, "isEnabled()");
	apu.channels.pulses[1].isEnabled().should.equalN(false, "isEnabled()");

	apu.registers.apuControl.onWrite(0b01);
	apu.channels.pulses[0].isEnabled().should.equalN(true, "isEnabled()");
	apu.channels.pulses[1].isEnabled().should.equalN(false, "isEnabled()");

	apu.registers.apuControl.onWrite(0b10);
	apu.channels.pulses[0].isEnabled().should.equalN(false, "isEnabled()");
	apu.channels.pulses[1].isEnabled().should.equalN(true, "isEnabled()");

	apu.registers.apuControl.onWrite(0b11);
	apu.channels.pulses[0].isEnabled().should.equalN(true, "isEnabled()");
	apu.channels.pulses[1].isEnabled().should.equalN(true, "isEnabled()");
})({
	locales: {
		es:
			"`PulseChannel`: tiene un método `isEnabled()` que retorna si el canal está activo o no en APUControl",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has a `sample()` method that returns a number", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		apu.channels.pulses[i].should.respondTo("sample");
		apu.channels.pulses[i].sample().should.be.a("number");
	}
})({
	locales: {
		es: "`PulseChannel`: tiene un método `sample()` que retorna un número",
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

	apu.channels.pulses[0].should.respondTo("updateTimer");
	apu.channels.pulses[0].updateTimer();
	apu.channels.pulses[0].timer.should.equalN(507, "timer");
	apu.channels.pulses[1].should.respondTo("updateTimer");
	apu.channels.pulses[1].updateTimer();
	apu.channels.pulses[1].timer.should.equalN(708, "timer");
})({
	locales: {
		es:
			"`PulseChannel`: `updateTimer()` actualiza `timer` basado en PulseTimerLow and PulseTimerHighLCL",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: `step()` calls updateTimer()", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		apu.channels.pulses[i].updateTimer = sinon.spy();
		apu.channels.pulses[i].should.respondTo("step");
		apu.channels.pulses[i].step();
		apu.channels.pulses[i].updateTimer.should.have.been.called;
	}
})({
	locales: {
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
		apu.channels.pulses[i].step.should.have.been.called;
	}
})({
	locales: {
		es:
			"llama al método `step()` de los Canales Pulso en cada llamado a `step(...)` de la APU",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("for now, new samples are mixed like `(pulse1 + pulse2) * 0.01`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	apu.should.respondTo("step");
	const onSample = sinon.spy();

	apu.channels.pulses[0].sample = () => 2;
	apu.channels.pulses[1].sample = () => 5;

	for (let i = 0; i < 19; i++) {
		apu.step(onSample);
		onSample.should.not.have.been.called;
	}

	apu.step(onSample);
	onSample.should.have.been.calledWith(0.07, 2, 5); // (2 + 5) * 0.01
})({
	locales: {
		es:
			"por ahora, los nuevos samples se mezclan como `(pulse1 + pulse2) * 0.01`",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseTimerLow`: writes the value and calls `updateTimer()`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.channels.pulses[0].updateTimer = sinon.spy();
	apu.channels.pulses[1].updateTimer = sinon.spy();

	apu.registers.write(0x4002, 251); // Pulse1TimerLow
	apu.registers.pulses[0].timerLow.value.should.equalN(251, "value");
	expect(apu.channels.pulses[0].updateTimer, "updateTimer").to.have.been.called;

	apu.registers.write(0x4006, 196); // Pulse2TimerLow
	apu.registers.pulses[1].timerLow.value.should.equalN(196, "value");
	expect(apu.channels.pulses[1].updateTimer, "updateTimer").to.have.been.called;
})({
	locales: {
		es: "`PulseTimerLow`: escribe el valor y llama a `updateTimer()`",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseTimerHighLCL`: writes `timerHigh` (bits 0-2) and calls `updateTimer()`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.channels.pulses[0].updateTimer = sinon.spy();
	apu.channels.pulses[1].updateTimer = sinon.spy();

	apu.registers.write(0x4003, 5); // Pulse1TimerHighLCL
	apu.registers.pulses[0].timerHighLCL.timerHigh.should.equalN(5, "timerHigh");
	expect(apu.channels.pulses[0].updateTimer, "updateTimer").to.have.been.called;

	apu.registers.write(0x4007, 7); // Pulse2TimerHighLCL
	apu.registers.pulses[1].timerHighLCL.timerHigh.should.equalN(7, "timerHigh");
	expect(apu.channels.pulses[1].updateTimer, "updateTimer").to.have.been.called;
})({
	locales: {
		es:
			"`PulseTimerHighLCL`: escribe `timerHigh` (bits 0-2) y llama a `updateTimer()`",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

// 5c.6 Pulse Channels (2/5): Producing pulse waves

it("`PulseChannel`: has an `oscillator` that can produce samples", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		expect(apu.channels.pulses[i], `[${i}].oscillator`).to.be.an("object");
		apu.channels.pulses[i].oscillator.frequency.should.equalN(
			0,
			`[${i}].frequency`
		);
		apu.channels.pulses[i].oscillator.dutyCycle.should.equalN(
			0,
			`[${i}].dutyCycle`
		);
		apu.channels.pulses[i].oscillator.volume.should.equalN(15, `[${i}].volume`);
		apu.channels.pulses[i].oscillator.should.respondTo("sample");
	}
})({
	locales: {
		es: "`PulseChannel`: tiene un `oscillator` que puede producir samples",
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
	pulse1Frequency.should.equalN(220, "frequency");

	apu.channels.pulses[1].timer = 708; // => freq = 157
	apu.channels.pulses[1].sample();
	const pulse2Frequency = Math.floor(
		apu.channels.pulses[1].oscillator.frequency
	);
	pulse2Frequency.should.equalN(157, "frequency");
})({
	locales: {
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
		apu.channels.pulses[i].oscillator.dutyCycle.should.equalN(0, key);

		apu.channels.pulses[i].registers.control.onWrite(0b01000000);
		apu.channels.pulses[i].sample();
		apu.channels.pulses[i].oscillator.dutyCycle.should.equalN(1, key);

		apu.channels.pulses[i].registers.control.onWrite(0b10000000);
		apu.channels.pulses[i].sample();
		apu.channels.pulses[i].oscillator.dutyCycle.should.equalN(2, key);

		apu.channels.pulses[i].registers.control.onWrite(0b11000000);
		apu.channels.pulses[i].sample();
		apu.channels.pulses[i].oscillator.dutyCycle.should.equalN(3, key);
	}
})({
	locales: {
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
	apu.channels.pulses[0].oscillator.volume.should.equalN(0b1100, "volume");

	apu.channels.pulses[1].sample();
	apu.channels.pulses[1].oscillator.volume.should.equalN(0b1011, "volume");
})({
	locales: {
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

	apu.channels.pulses[0].sample().should.equalN(random1);
	apu.channels.pulses[1].sample().should.equalN(random2);
})({
	locales: {
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
	register.use5StepSequencer.should.equalN(1, "use5StepSequencer");
	register.onWrite(0b00100011);
	register.use5StepSequencer.should.equalN(0, "use5StepSequencer");
})({
	locales: {
		es: "`APUFrameCounter`: escribe `use5StepSequencer` (bit 7)",
	},
	use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`APUFrameCounter`: writing resets the frame sequencer", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const register = apu.registers.apuFrameCounter;

	apu.frameSequencer.counter = 8;
	register.onWrite(0b10000011);
	apu.frameSequencer.counter.should.equalN(0, "counter");
})({
	locales: {
		es: "`APUFrameCounter`: escribir reinicia el secuenciador de frames",
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
		es: "tiene una propiedad `frameSequencer`",
	},
	use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`FrameSequencer`: has a `counter` property and `reset()`/`step()` methods", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.frameSequencer.counter.should.equalN(0, "counter");
	apu.frameSequencer.should.respondTo("reset");
	apu.frameSequencer.should.respondTo("step");
})({
	locales: {
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
	apu.frameSequencer.counter.should.equalN(0, "counter");
})({
	locales: {
		es: "`FrameSequencer`: `reset()` asigna 0 a `counter`",
	},
	use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("`FrameSequencer`: `step()` increments `counter`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.frameSequencer.counter = 78;
	apu.frameSequencer.step();
	apu.frameSequencer.counter.should.equalN(79, "counter");
})({
	locales: {
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
		apu.frameSequencer.counter.should.equalN(newCount, "counter");
	}

	apu.frameSequencer.step();
	apu.frameSequencer.counter.should.equalN(0, "counter");
})({
	locales: {
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
		apu.frameSequencer.counter.should.equalN(newCount, "counter");
	}

	apu.frameSequencer.step();
	apu.frameSequencer.counter.should.equalN(0, "counter");
})({
	locales: {
		es:
			"`FrameSequencer`: en secuencias de cinco pasos, `step()` reinicia el contador en el ciclo 14916",
	},
	use: ({ id }, book) => id >= book.getId("5c.7"),
});

it("has two methods: `onQuarterFrameClock()` and `onHalfFrameClock()`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.should.respondTo("onQuarterFrameClock");
	apu.should.respondTo("onHalfFrameClock");
})({
	locales: {
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
		es: "actualiza el secuenciador de frames en cada llamada a `step(...)`",
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
		es: "`PulseChannel`: tiene una propiedad `lengthCounter`",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: has a `counter` property that starts at 0", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const lengthCounter = apu.channels.pulses[i].lengthCounter;
		lengthCounter.counter.should.equalN(0, `[${i}]::counter`);
	}
})({
	locales: {
		es: "`LengthCounter`: tiene una propiedad `counter` que empieza en 0",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: has a `reset()` method that sets `counter` = 0", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const lengthCounter = apu.channels.pulses[i].lengthCounter;
		lengthCounter.should.respondTo("reset");
		lengthCounter.counter = 2;
		lengthCounter.reset();
		lengthCounter.counter.should.equalN(0, `[${i}]::counter`);
	}
})({
	locales: {
		es: "`LengthCounter`: tiene un método `reset()` que asigna `counter` = 0",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: has an `isActive()` method that returns whether `counter` is greater than 0", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const lengthCounter = apu.channels.pulses[i].lengthCounter;
		lengthCounter.should.respondTo("isActive");

		lengthCounter.counter = 2;
		lengthCounter.isActive().should.equalN(true, `[${i}]::isActive()`);

		lengthCounter.counter = 0;
		lengthCounter.isActive().should.equalN(false, `[${i}]::isActive()`);

		lengthCounter.counter = 1;
		lengthCounter.isActive().should.equalN(true, `[${i}]::isActive()`);
	}
})({
	locales: {
		es:
			"`LengthCounter`: tiene un método `isActive()` que retorna si `counter` es mayor a 0",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: has a `clock(...)` method", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const lengthCounter = apu.channels.pulses[i].lengthCounter;
		lengthCounter.should.respondTo("clock");
	}
})({
	locales: {
		es: "`LengthCounter`: tiene un método `clock(...)`",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`LengthCounter`: calling `clock(...)` with `false` as the first argument just resets the counter", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const lengthCounter = apu.channels.pulses[i].lengthCounter;

		lengthCounter.counter = 3;
		lengthCounter.clock(false, true);
		lengthCounter.counter.should.equalN(0, `[${i}]::counter`);

		lengthCounter.counter = 17;
		lengthCounter.clock(false, false);
		lengthCounter.counter.should.equalN(0, `[${i}]::counter`);
	}
})({
	locales: {
		es:
			"`LengthCounter`: llamar a `clock()` con `false` como primer argumento solo reinicia el contador",
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
		lengthCounter.counter.should.equalN(219, `[${i}]::counter`);
	}
})({
	locales: {
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
		lengthCounter.counter.should.equalN(218, `[${i}]::counter`);

		lengthCounter.clock(true, false);
		lengthCounter.counter.should.equalN(217, `[${i}]::counter`);
	}
})({
	locales: {
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
		lengthCounter.counter.should.equalN(0, `[${i}]::counter`);
	}
})({
	locales: {
		es:
			"`LengthCounter`: llamar a `clock(true, false)` no decrementa si el contador es 0",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`PulseChannel`: `sample()` just returns the last sample if the channel is disabled", () => {
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

	// disable all channels
	apu.registers.apuControl.setValue(0);

	// change volume
	for (let i = 0; i < 2; i++)
		apu.registers.pulses[i].control.onWrite(0b00110000 | ((i + 1) * 2));

	// set another timer value
	apu.channels.pulses[0].timer = 123;
	apu.channels.pulses[0].timer = 456;

	// when the channel is disabled, it should return the last sample
	apu.channels.pulses[0].sample().should.equalN(lastSample1, "[0].sample()");
	apu.channels.pulses[1].sample().should.equalN(lastSample2, "[1].sample()");

	// they shouldn't update the oscillator frequency
	const pulse1Frequency = Math.floor(
		apu.channels.pulses[0].oscillator.frequency
	);
	pulse1Frequency.should.equalN(220, "frequency");
	const pulse2Frequency = Math.floor(
		apu.channels.pulses[1].oscillator.frequency
	);
	pulse2Frequency.should.equalN(157, "frequency");
})({
	locales: {
		es:
			"`PulseChannel`: `sample()` solo retorna el último sample si el canal está desactivado",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`PulseChannel`: `sample()` just returns the last sample if the length counter is not active", () => {
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
	apu.channels.pulses[0].sample().should.equalN(lastSample1, "[0].sample()");
	apu.channels.pulses[1].sample().should.equalN(lastSample2, "[1].sample()");

	// they shouldn't update the oscillator frequency
	const pulse1Frequency = Math.floor(
		apu.channels.pulses[0].oscillator.frequency
	);
	pulse1Frequency.should.equalN(220, "frequency");
	const pulse2Frequency = Math.floor(
		apu.channels.pulses[1].oscillator.frequency
	);
	pulse2Frequency.should.equalN(157, "frequency");
})({
	locales: {
		es:
			"`PulseChannel`: `sample()` solo retorna el último sample si el contador de longitud no está activo",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`PulseChannel`: has a `quarterFrame()` method", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		apu.channels.pulses[i].should.respondTo("quarterFrame");
	}
})({
	locales: {
		es: "`PulseChannel`: tiene un método `quarterFrame()`",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`PulseChannel`: has a `halfFrame()` method that updates the length counter", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const channel = apu.channels.pulses[i];
		channel.should.respondTo("halfFrame");

		channel.lengthCounter.clock = sinon.spy();
		channel.isEnabled = () => true;
		channel.registers.control.onWrite(0b100000); // halt = 1
		channel.halfFrame();
		channel.lengthCounter.clock.should.have.been.calledWith(true, 1);

		channel.lengthCounter.clock = sinon.spy();
		channel.isEnabled = () => true;
		channel.registers.control.onWrite(0b000000); // halt = 0
		channel.halfFrame();
		channel.lengthCounter.clock.should.have.been.calledWith(true, 0);

		channel.lengthCounter.clock = sinon.spy();
		channel.isEnabled = () => false;
		channel.registers.control.onWrite(0b000000); // halt = 0
		channel.halfFrame();
		channel.lengthCounter.clock.should.have.been.calledWith(false, 0);

		channel.lengthCounter.clock = sinon.spy();
		channel.isEnabled = () => false;
		channel.registers.control.onWrite(0b100000); // halt = 1
		channel.halfFrame();
		channel.lengthCounter.clock.should.have.been.calledWith(false, 1);
	}
})({
	locales: {
		es:
			"`PulseChannel`: tiene un método `halfFrame()` que actualiza el contador de longitud",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`onQuarterFrameClock()` calls `quarterFrame()` on the two pulse channel instances", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.channels.pulses[0].quarterFrame = sinon.spy();
	apu.channels.pulses[1].quarterFrame = sinon.spy();

	apu.onQuarterFrameClock();

	apu.channels.pulses[0].quarterFrame.should.have.been.calledOnce;
	apu.channels.pulses[1].quarterFrame.should.have.been.calledOnce;
})({
	locales: {
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

	apu.channels.pulses[0].halfFrame.should.have.been.calledOnce;
	apu.channels.pulses[1].halfFrame.should.have.been.calledOnce;
})({
	locales: {
		es:
			"`onHalfFrameClock()` llama a `halfFrame()` en las dos instancias del canal pulso",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`PulseTimerHighLCL`: writes `lengthCounterLoad` (bits 3-7) and updates the length counter", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.registers.write(0x4003, 0b10110000); // Pulse1TimerHighLCL
	apu.registers.pulses[0].timerHighLCL.lengthCounterLoad.should.equalN(
		0b10110, // index 22 => 96 in length table
		"lengthCounterLoad"
	);
	apu.channels.pulses[0].lengthCounter.counter.should.equalN(
		96,
		"[0]::counter"
	);

	apu.registers.write(0x4007, 0b01100000); // Pulse2TimerHighLCL
	apu.registers.pulses[1].timerHighLCL.lengthCounterLoad.should.equalN(
		0b01100, // index 22 => 14 in length table
		"lengthCounterLoad"
	);
	apu.channels.pulses[1].lengthCounter.counter.should.equalN(
		14,
		"[1]::counter"
	);
})({
	locales: {
		es:
			"`PulseTimerHighLCL`: escribe `lengthCounterLoad` (bits 3-7) y actualiza el contador de longitud",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

it("`APUControl`: on writes, if `enablePulse1` is clear, resets the length counter", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.channels.pulses[0].lengthCounter.counter = 72;
	apu.channels.pulses[1].lengthCounter.counter = 83;

	apu.registers.write(0x4015, 0b00000010);

	apu.channels.pulses[0].lengthCounter.counter.should.equalN(0, "counter");
	apu.channels.pulses[1].lengthCounter.counter.should.equalN(83, "counter");
})({
	locales: {
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

	apu.channels.pulses[0].lengthCounter.counter.should.equalN(72, "counter");
	apu.channels.pulses[1].lengthCounter.counter.should.equalN(0, "counter");
})({
	locales: {
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
	locales: { es: "`PulseChannel`: tiene una propiedad `volumeEnvelope`" },
	use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`VolumeEnvelope`: has `startFlag`, `dividerCount`, `volume` initialized to false, 0, 0", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const envelope = apu.channels.pulses[i].volumeEnvelope;
		envelope.startFlag.should.equal(false, `[${i}]::startFlag`);
		envelope.dividerCount.should.equalN(0, `[${i}]::dividerCount`);
		envelope.volume.should.equalN(0, `[${i}]::volume`);
	}
})({
	locales: {
		es:
			"`VolumeEnvelope`: tiene `startFlag`, `dividerCount` y `volume` inicializados en false, 0, 0",
	},
	use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`VolumeEnvelope`: has a `clock(...)` method", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		apu.channels.pulses[i].volumeEnvelope.should.respondTo("clock");
	}
})({
	locales: { es: "`VolumeEnvelope`: tiene un método `clock(...)`" },
	use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`VolumeEnvelope`: `clock(...)` with `startFlag = true` clears it, sets `volume` to 15 and `dividerCount` to period", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const envelope = apu.channels.pulses[0].volumeEnvelope;
	envelope.startFlag = true;

	envelope.clock(8, false);

	envelope.startFlag.should.equalN(false, "startFlag");
	envelope.volume.should.equalN(15, "volume");
	envelope.dividerCount.should.equalN(8, "dividerCount");
})({
	locales: {
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

	envelope.dividerCount.should.equalN(2, "dividerCount");
	envelope.volume.should.equalN(7, "volume");
	envelope.startFlag.should.equalN(false, "startFlag");
})({
	locales: {
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

	envelope.dividerCount.should.equalN(9);
	envelope.volume.should.equalN(4);
})({
	locales: {
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

	envelope.dividerCount.should.equalN(6);
	envelope.volume.should.equalN(0);
})({
	locales: {
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

	envelope.dividerCount.should.equalN(2);
	envelope.volume.should.equalN(15);
})({
	locales: {
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

		channel.volumeEnvelope.clock.should.have.been.calledWith(period, loop);
	}
})({
	locales: {
		es: "`PulseChannel`: `quarterFrame()` actualiza la envolvente de volumen",
	},
	use: ({ id }, book) => id >= book.getId("5c.9"),
});

it("`PulseTimerHighLCL`: writes set the `startFlag` on the channel's volume envelope", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.registers.write(0x4003, 0b01000000);
	apu.channels.pulses[0].volumeEnvelope.startFlag.should.equal(true);

	apu.registers.write(0x4007, 0b11000000);
	apu.channels.pulses[1].volumeEnvelope.startFlag.should.equal(true);
})({
	locales: {
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
	sweep1.shiftCount.should.equalN(2, "shiftCount");
	sweep1.negateFlag.should.equalN(0, "negateFlag");
	sweep1.dividerPeriodMinusOne.should.equalN(7, "dividerPeriodMinusOne");
	sweep1.enabledFlag.should.equalN(0, "enabledFlag");

	// Pulse 2
	const sweep2 = apu.registers.pulses[1].sweep;
	sweep2.shiftCount.should.equalN(3, "shiftCount");
	sweep2.negateFlag.should.equalN(1, "negateFlag");
	sweep2.dividerPeriodMinusOne.should.equalN(3, "dividerPeriodMinusOne");
	sweep2.enabledFlag.should.equalN(1, "enabledFlag");
})({
	locales: {
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
	locales: { es: "`PulseChannel`: tiene una propiedad `frequencySweep`" },
	use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: has `startFlag`, `dividerCount`, `mute` initialized to `false`, `0`, `false`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const sweep = apu.channels.pulses[i].frequencySweep;
		sweep.startFlag.should.equal(false, `[${i}]::startFlag`);
		sweep.dividerCount.should.equalN(0, `[${i}]::dividerCount`);
		sweep.mute.should.equalN(false, `[${i}]::mute`);
	}
})({
	locales: {
		es:
			"`FrequencySweep`: tiene `startFlag`, `dividerCount` y `mute` inicializados en `false`, `0`, `false`",
	},
	use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: has `clock()` and `muteIfNeeded()` methods", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const sweep = apu.channels.pulses[i].frequencySweep;
		sweep.should.respondTo("clock");
		sweep.should.respondTo("muteIfNeeded");
	}
})({
	locales: {
		es: "`FrequencySweep`: tiene métodos `clock()` y `muteIfNeeded()`",
	},
	use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: `clock()` increases `timer` by shift delta when enabled, `shiftCount > 0`, `dividerCount = 0`, and not muted", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const channel = apu.channels.pulses[i];
		const sweep = channel.frequencySweep;
		const address = i === 0 ? 0x4001 : 0x4005;

		// enable, period=7 (reload=8), shiftCount=2, negateFlag=0
		apu.registers.write(address, 0b11110010);
		sweep.startFlag = false;
		sweep.dividerCount = 0;
		sweep.mute = false;

		channel.timer = 100; // => delta = 100 >> 2 = 25
		sweep.clock();

		channel.timer.should.equalN(125, `[${i}].timer`);
		sweep.dividerCount.should.equalN(8, `[${i}]::dividerCount`);
	}
})({
	locales: {
		es:
			"`FrequencySweep`: `clock()` incrementa `timer` por el delta apropiado cuando está habilitado, `shiftCount > 0`, `dividerCount = 0` y no está silenciado",
	},
	use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: `clock()` decreases `timer` by shift delta when `negateFlag` is set (same conditions)", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const channel = apu.channels.pulses[i];
		const sweep = channel.frequencySweep;
		const address = i === 0 ? 0x4001 : 0x4005;

		// configure sweep: enable, period=3 (reload=4), shiftCount=2, negateFlag=1
		apu.registers.write(address, 0b10111010);
		sweep.startFlag = false;
		sweep.dividerCount = 0;
		sweep.mute = false;

		channel.timer = 100; // => delta = 100 >> 2 = 25
		sweep.clock();

		channel.timer.should.equalN(75, `[${i}].timer`);
		sweep.dividerCount.should.equalN(4, `[${i}]::dividerCount`);
	}
})({
	locales: {
		es:
			"`FrequencySweep`: `clock()`: decrementa `timer` por el delta apropiado cuando `negateFlag` está encendida (mismas condiciones)",
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

		// configure sweep: enable, period=7 (reload=8)
		apu.registers.write(address, 0b11110010);
		sweep.startFlag = true;
		sweep.dividerCount = 0;

		sweep.clock();

		sweep.startFlag.should.equalN(false, `[${i}]::startFlag`);
		sweep.dividerCount.should.equalN(8, `[${i}]::dividerCount`);
	}
})({
	locales: {
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

		sweep.dividerCount.should.equalN(4, `[${i}]::dividerCount`);
		channel.timer.should.equalN(200, `[${i}].timer`);
	}
})({
	locales: {
		es:
			"`FrequencySweep`: `clock()` cuando `dividerCount > 0` lo decrementa y deja `timer` intacto",
	},
	use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`FrequencySweep`: `muteIfNeeded()` sets `mute` when `timer` is < 8 or > 0x7ff`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		const channel = apu.channels.pulses[i];
		const sweep = channel.frequencySweep;

		channel.timer = 7;
		sweep.muteIfNeeded();
		sweep.mute.should.equalN(true, `[${i}]::mute`);

		channel.timer = 8;
		sweep.muteIfNeeded();
		sweep.mute.should.equalN(false, `[${i}]::mute`);

		channel.timer = 0x800;
		sweep.muteIfNeeded();
		sweep.mute.should.equalN(true, `[${i}]::mute`);

		channel.timer = 0x7ff;
		sweep.muteIfNeeded();
		sweep.mute.should.equalN(false, `[${i}]::mute`);
	}
})({
	locales: {
		es:
			"`FrequencySweep`: `muteIfNeeded()` pone `mute` en true cuando `timer` is < 8 o > 0x7ff`",
	},
	use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`PulseChannel`: `sample()` just returns the last sample if the sweep unit is muted", () => {
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
	apu.channels.pulses[0].sample().should.equalN(lastSample1, "[0].sample()");
	apu.channels.pulses[1].sample().should.equalN(lastSample2, "[1].sample()");

	// they shouldn't update the oscillator frequency
	const pulse1Frequency = Math.floor(
		apu.channels.pulses[0].oscillator.frequency
	);
	pulse1Frequency.should.equalN(220, "frequency");
	const pulse2Frequency = Math.floor(
		apu.channels.pulses[1].oscillator.frequency
	);
	pulse2Frequency.should.equalN(157, "frequency");
})({
	locales: {
		es:
			"`PulseChannel`: `sample()` solo retorna el último sample si la unidad de barrido está silenciada",
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

		channel.frequencySweep.muteIfNeeded.should.have.been.calledOnce;
		channel.updateTimer.should.have.been.calledOnce;
	}
})({
	locales: {
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

		channel.frequencySweep.muteIfNeeded.should.have.been.calledOnce;
		channel.updateTimer.should.not.have.been.called;
	}
})({
	locales: {
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
		channel.frequencySweep.clock.should.have.been.calledOnce;
	}
})({
	locales: {
		es: "`PulseChannel`: `halfFrame()` llama a `frequencySweep.clock()`",
	},
	use: ({ id }, book) => id >= book.getId("5c.10"),
});

it("`PulseSweep`: writes set the `startFlag` on the channel's frequency sweep", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.registers.write(0x4001, 1);
	apu.channels.pulses[0].frequencySweep.startFlag.should.equal(true);

	apu.registers.write(0x4005, 2);
	apu.channels.pulses[1].frequencySweep.startFlag.should.equal(true);
})({
	locales: {
		es:
			"`PulseSweep`: las escrituras encienden `startFlag` en el barrido de frecuencia del canal",
	},
	use: ({ id }, book) => id >= book.getId("5c.10"),
});

// 5c.11 Triangle Channel (1/3): Triangle waves

it("`TriangleTimerHighLCL`: writes `timerHigh` (bits 0-2)", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.registers.write(0x400b, 5);
	apu.registers.triangle.timerHighLCL.timerHigh.should.equalN(5, "timerHigh");
})({
	locales: { es: "`TriangleTimerHighLCL`: escribe `timerHigh` (bits 0-2)" },
	use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("`APU`: has a `TriangleChannel` instance", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	expect(apu.channels.triangle, "triangle").to.be.an("object");
	apu.channels.triangle.should.respondTo("sample");
})({
	locales: {
		es: "`APU`: tiene una instancia de `TriangleChannel`",
	},
	use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("`TriangleChannel`: has an `oscillator` property", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const channel = apu.channels.triangle;
	expect(channel.oscillator, "oscillator").to.be.an("object");
	channel.oscillator.should.respondTo("sample");
})({
	locales: { es: "`TriangleChannel`: tiene una propiedad `oscillator`" },
	use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("`TriangleChannel`: `sample()` returns 0 when `timer` < 2", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const channel = apu.channels.triangle;

	channel.registers.timerLow.value = 1;
	channel.registers.timerHighLCL.timerHigh = 0;
	channel.sample().should.equalN(0, "sample()");

	channel.registers.timerLow.value = 0;
	channel.registers.timerHighLCL.timerHigh = 0;
	channel.sample().should.equalN(0, "sample()");
})({
	locales: {
		es: "`TriangleChannel`: `sample()` retorna 0 cuando `timer` < 2",
	},
	use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("`TriangleChannel`: `sample()` updates `oscillator.frequency` and returns `oscillator.sample()` when `timer` is in a valid range", () => {
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

	channel.sample().should.equalN(9, "sample()");
	Math.floor(channel.oscillator.frequency).should.equalN(
		Math.floor(expectedFreq),
		"frequency"
	);
})({
	locales: {
		es:
			"`TriangleChannel`: `sample()` actualiza `oscillator.frequency` y retorna `oscillator.sample()` cuando `timer` está en un rango válido",
	},
	use: ({ id }, book) => id >= book.getId("5c.11"),
});

it("`APU`: mixes pulse1, pulse2 and triangle in `step()`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	const onSample = sinon.spy();

	apu.channels.pulses[0].sample = () => 1;
	apu.channels.pulses[1].sample = () => 2;
	apu.channels.triangle.sample = () => 3;

	for (let i = 0; i < 19; i++) {
		apu.step(onSample);
		onSample.should.not.have.been.called;
	}

	apu.step(onSample);
	onSample.should.have.been.calledWith(0.06, 1, 2, 3);
})({
	locales: {
		es: "`APU`: mezcla triangle con pulse1 y pulse2 en `step()`",
	},
	use: ({ id }, book) => id >= book.getId("5c.11"),
});

// 5c.12 Triangle Channel (2/3): Regular length counter

it("`TriangleLengthControl`: writes `halt` (bit 7)", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const register = apu.registers.triangle.lengthControl;

	apu.registers.write(0x4008, 0b11011010);
	register.halt.should.equalN(1, "halt");
	apu.registers.write(0x4008, 0b01011010);
	register.halt.should.equalN(0, "halt");
})({
	locales: {
		es: "`PulseControl`: escribe `halt` (bit 7)",
	},
	use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: has a `lengthCounter` property", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const channel = apu.channels.triangle;

	expect(channel.lengthCounter, "lengthCounter").to.be.an("object");
	channel.lengthCounter.should.respondTo("reset");
	channel.lengthCounter.should.respondTo("isActive");
	channel.lengthCounter.should.respondTo("clock");
})({
	locales: { es: "`TriangleChannel`: tiene una propiedad `lengthCounter`" },
	use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: `sample()` just returns the last sample if the channel is disabled", () => {
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
	apu.channels.triangle.sample().should.equalN(lastSample, "sample()");

	// it shouldn't update the oscillator frequency
	const frequency = Math.floor(apu.channels.triangle.oscillator.frequency);
	frequency.should.equalN(110, "frequency");
})({
	locales: {
		es:
			"`TriangleChannel`: `sample()` solo retorna el último sample si el canal está desactivado",
	},
	use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: `sample()` just returns the last sample if the length counter is not active", () => {
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
	apu.channels.triangle.sample().should.equalN(lastSample, "sample()");

	// it shouldn't update the oscillator frequency
	const frequency = Math.floor(apu.channels.triangle.oscillator.frequency);
	frequency.should.equalN(110, "frequency");
})({
	locales: {
		es:
			"`TriangleChannel`: `sample()` solo retorna el último sample si el contador de longitud no está activo",
	},
	use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: has a `quarterFrame()` method", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const channel = apu.channels.triangle;

	channel.should.respondTo("quarterFrame");
})({
	locales: { es: "`TriangleChannel`: tiene un método `quarterFrame()`" },
	use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: has a `halfFrame()` method that updates the length counter", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const channel = apu.channels.triangle;

	channel.should.respondTo("halfFrame");

	channel.lengthCounter.clock = sinon.spy();
	channel.isEnabled = () => true;
	channel.registers.lengthControl.onWrite(0b10000000); // halt = 1
	channel.halfFrame();
	channel.lengthCounter.clock.should.have.been.calledWith(true, 1);

	channel.lengthCounter.clock = sinon.spy();
	channel.isEnabled = () => true;
	channel.registers.lengthControl.onWrite(0b00000000); // halt = 0
	channel.halfFrame();
	channel.lengthCounter.clock.should.have.been.calledWith(true, 0);

	channel.lengthCounter.clock = sinon.spy();
	channel.isEnabled = () => false;
	channel.registers.lengthControl.onWrite(0b00000000); // halt = 0
	channel.halfFrame();
	channel.lengthCounter.clock.should.have.been.calledWith(false, 0);

	channel.lengthCounter.clock = sinon.spy();
	channel.isEnabled = () => false;
	channel.registers.lengthControl.onWrite(0b10000000); // halt = 1
	channel.halfFrame();
	channel.lengthCounter.clock.should.have.been.calledWith(false, 1);
})({
	locales: {
		es:
			"`TriangleChannel`: tiene un método `halfFrame()` que actualiza el contador de longitud",
	},
	use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleChannel`: has an `isEnabled()` method that returns whether the channel is enabled or not in APUControl", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.channels.triangle.should.respondTo("isEnabled");

	apu.registers.apuControl.onWrite(0b100);
	apu.channels.triangle.isEnabled().should.equalN(true, "isEnabled()");

	apu.registers.apuControl.onWrite(0b000);
	apu.channels.triangle.isEnabled().should.equalN(false, "isEnabled()");
})({
	locales: {
		es:
			"`TriangleChannel`: tiene un método `isEnabled()` que retorna si el canal está activo o no en APUControl",
	},
	use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`APU`: `onQuarterFrameClock()` calls `quarterFrame()` on triangle channel", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.channels.triangle.quarterFrame = sinon.spy();
	apu.onQuarterFrameClock();
	apu.channels.triangle.quarterFrame.should.have.been.calledOnce;
})({
	locales: {
		es:
			"`APU`: `onQuarterFrameClock()` llama a `quarterFrame()` en el canal triangular",
	},
	use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`APU`: `onHalfFrameClock()` calls `halfFrame()` on triangle channel", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.channels.triangle.halfFrame = sinon.spy();
	apu.onHalfFrameClock();
	apu.channels.triangle.halfFrame.should.have.been.calledOnce;
})({
	locales: {
		es:
			"`APU`: `onHalfFrameClock()` llama a `halfFrame()` en el canal triangular",
	},
	use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`TriangleTimerHighLCL`: writes `lengthCounterLoad` (bits 3-7) and updates the length counter", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.registers.write(0x400b, 0b10110000); // TriangleTimerHighLCL
	apu.registers.triangle.timerHighLCL.lengthCounterLoad.should.equalN(
		0b10110, // index 22 => 96 in length table
		"lengthCounterLoad"
	);
	apu.channels.triangle.lengthCounter.counter.should.equalN(96, "counter");
})({
	locales: {
		es:
			"`TriangleTimerHighLCL`: escribe `lengthCounterLoad` (bits 3-7) y actualiza el contador de longitud",
	},
	use: ({ id }, book) => id >= book.getId("5c.12"),
});

it("`APUControl`: on writes, if `enableTriangle` is clear, resets the length counter", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.channels.triangle.lengthCounter.counter = 72;

	apu.registers.write(0x4015, 0b00000010);

	apu.channels.triangle.lengthCounter.counter.should.equalN(0, "counter");
})({
	locales: {
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

	apu.channels.triangle.lengthCounter.counter.should.equalN(72, "counter");
})({
	locales: {
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
		es: "`TriangleChannel`: tiene una propiedad `linearLengthCounter`",
	},
	use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: has `reload` and `reloadFlag` initialized to `0` and `false`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

	linearLengthCounter.reload.should.equalN(0, "reload");
	linearLengthCounter.reloadFlag.should.equalN(false, "reloadFlag");
})({
	locales: {
		es:
			"`LinearLengthCounter`: tiene `reload` y `reloadFlag` inicializados en `0` y `false`",
	},
	use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `isActive()` returns whether `counter` is greater than 0", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

	linearLengthCounter.should.respondTo("isActive");

	linearLengthCounter.counter = 2;
	linearLengthCounter.isActive().should.equalN(true, "isActive()");

	linearLengthCounter.counter = 0;
	linearLengthCounter.isActive().should.equalN(false, "isActive()");

	linearLengthCounter.counter = 1;
	linearLengthCounter.isActive().should.equalN(true, "isActive()");
})({
	locales: {
		es: "`LinearLengthCounter`: `isActive()` retorna si `counter` es mayor a 0",
	},
	use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `fullReset()` resets `counter`, `reload`, and `reloadFlag`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

	linearLengthCounter.should.respondTo("fullReset");

	linearLengthCounter.counter = 5;
	linearLengthCounter.reload = 7;
	linearLengthCounter.reloadFlag = true;

	linearLengthCounter.fullReset();

	linearLengthCounter.counter.should.equalN(0, "counter");
	linearLengthCounter.reload.should.equalN(0, "reload");
	linearLengthCounter.reloadFlag.should.equalN(false, "reloadFlag");
})({
	locales: {
		es:
			"`LinearLengthCounter`: `fullReset()` reinicia `counter`, `reload` y `reloadFlag`",
	},
	use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `clock(false, *)` resets `counter` but keeps `reload` and `reloadFlag`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

	linearLengthCounter.should.respondTo("clock");

	linearLengthCounter.counter = 4;
	linearLengthCounter.reload = 9;
	linearLengthCounter.reloadFlag = true;

	linearLengthCounter.clock(false, true);

	linearLengthCounter.counter.should.equalN(0, "counter");
	linearLengthCounter.reload.should.equalN(9, "reload");
	linearLengthCounter.reloadFlag.should.equalN(true, "reloadFlag");
})({
	locales: {
		es:
			"`LinearLengthCounter`: `clock(false, *)` reinicia `counter` pero mantiene `reload` y `reloadFlag`",
	},
	use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `clock(true, false)` with `reloadFlag` loads `reload` into `counter` and clears `reloadFlag`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

	linearLengthCounter.should.respondTo("clock");

	linearLengthCounter.reload = 9;
	linearLengthCounter.reloadFlag = true;
	linearLengthCounter.counter = 0;

	linearLengthCounter.clock(true, false);

	linearLengthCounter.counter.should.equalN(9, "counter");
	linearLengthCounter.reloadFlag.should.equalN(false, "reloadFlag");
})({
	locales: {
		es:
			"`LinearLengthCounter`: `clock(true, false)` con `reloadFlag` carga `reload` en `counter` y apaga `reloadFlag`",
	},
	use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `clock(true, true)` with `reloadFlag` and `isHalted` true loads `reload` but keeps `reloadFlag`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

	linearLengthCounter.should.respondTo("clock");

	linearLengthCounter.reload = 11;
	linearLengthCounter.reloadFlag = true;
	linearLengthCounter.counter = 0;

	linearLengthCounter.clock(true, true);

	linearLengthCounter.counter.should.equalN(11, "counter");
	linearLengthCounter.reloadFlag.should.equalN(true, "reloadFlag");
})({
	locales: {
		es:
			"`LinearLengthCounter`: `clock(true, true)` con `reloadFlag` y `isHalted` verdadero carga `reload` y mantiene `reloadFlag`",
	},
	use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`LinearLengthCounter`: `clock(true, *)` when `reloadFlag` false and `counter > 0` decrements `counter`", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	const linearLengthCounter = apu.channels.triangle.linearLengthCounter;

	linearLengthCounter.should.respondTo("clock");

	linearLengthCounter.reloadFlag = false;
	linearLengthCounter.counter = 4;

	linearLengthCounter.clock(true, false);

	linearLengthCounter.counter.should.equalN(3, "counter");
})({
	locales: {
		es:
			"`LinearLengthCounter`: `clock(true, *)` cuando `reloadFlag` es false y `counter > 0` decrementa `counter`",
	},
	use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`TriangleChannel`: `sample()` just returns the last sample if the linear length counter is not active", () => {
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
	apu.channels.triangle.sample().should.equalN(lastSample, "sample()");

	// it shouldn't update the oscillator frequency
	const frequency = Math.floor(apu.channels.triangle.oscillator.frequency);
	frequency.should.equalN(110, "frequency");
})({
	locales: {
		es:
			"`TriangleChannel`: `sample()` solo retorna el último sample si el contador lineal de longitud no está activo",
	},
	use: ({ id }, book) => id >= book.getId("5c.13"),
});

it("`TriangleChannel`: `quarterFrame()` updates the linear length counter", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	const channel = apu.channels.triangle;

	channel.should.respondTo("quarterFrame");

	channel.linearLengthCounter.clock = sinon.spy();
	channel.isEnabled = () => true;
	channel.registers.lengthControl.onWrite(0b10000000); // halt = 1
	channel.quarterFrame();
	channel.linearLengthCounter.clock.should.have.been.calledWith(true, 1);

	channel.linearLengthCounter.clock = sinon.spy();
	channel.isEnabled = () => true;
	channel.registers.lengthControl.onWrite(0b00000000); // halt = 0
	channel.quarterFrame();
	channel.linearLengthCounter.clock.should.have.been.calledWith(true, 0);

	channel.linearLengthCounter.clock = sinon.spy();
	channel.isEnabled = () => false;
	channel.registers.lengthControl.onWrite(0b00000000); // halt = 0
	channel.quarterFrame();
	channel.linearLengthCounter.clock.should.have.been.calledWith(false, 0);

	channel.linearLengthCounter.clock = sinon.spy();
	channel.isEnabled = () => false;
	channel.registers.lengthControl.onWrite(0b10000000); // halt = 1
	channel.quarterFrame();
	channel.linearLengthCounter.clock.should.have.been.calledWith(false, 1);
})({
	locales: {
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
	register.linearCounterReload.should.equalN(0b1001011, "linearCounterReload");
	channel.linearLengthCounter.reload.should.equalN(0b1001011, "reload");
})({
	locales: {
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
	channel.linearLengthCounter.reloadFlag.should.equalN(true, "reloadFlag");
})({
	locales: {
		es:
			"`TriangleTimerHighLCL`: las escrituras encienden `reloadFlag` en el contador linearl de longitud del canal",
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

	linearLengthCounter.counter.should.equalN(0, "counter");
	linearLengthCounter.reload.should.equalN(0, "reload");
	linearLengthCounter.reloadFlag.should.equalN(false, "reloadFlag");
})({
	locales: {
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

	linearLengthCounter.counter.should.equalN(5, "counter");
	linearLengthCounter.reload.should.equalN(8, "reload");
	linearLengthCounter.reloadFlag.should.equalN(true, "reloadFlag");
})({
	locales: {
		es:
			"`APUControl`: en escrituras, si `enableTriangle` está encendida, no reinicia el contador lineal de longitud",
	},
	use: ({ id }, book) => id >= book.getId("5c.13"),
});
