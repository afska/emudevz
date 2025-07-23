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
	checkRegister("triangle.linearLCL", 0x4008);
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
	checkRegister("triangle.linearLCL", 0x4008);
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
	checkRegister("triangle.linearLCL", 0x4008);
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
	triangleTimerLow.value.should.equalN(129, "triangleTimerLow.value");
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
	dmcSampleAddress.value.should.equalN(135, "dmcSampleAddress.value");
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
	dmcSampleLength.value.should.equalN(172, "dmcSampleLength.value");
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

it("`PulseChannel`: has an `isEnabled` method that returns whether the channel is enabled or not in APUControl", () => {
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
			"`PulseChannel`: tiene un método `isEnabled` que retorna si el canal está activo o no en APUControl",
	},
	use: ({ id }, book) => id >= book.getId("5c.5"),
});

it("`PulseChannel`: has a `sample` method that returns a number", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	for (let i = 0; i < 2; i++) {
		apu.channels.pulses[i].should.respondTo("sample");
		apu.channels.pulses[i].sample().should.be.a("number");
	}
})({
	locales: {
		es: "`PulseChannel`: tiene un método `sample` que retorna un número",
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
			"por ahora, los nuevos samples se mezclan como `(pulse1 + pulse2) / 100`",
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

	apu.channels.pulses[0].timer = 507;
	apu.channels.pulses[0].sample();
	const pulse1Frequency = Math.floor(
		apu.channels.pulses[0].oscillator.frequency
	);
	pulse1Frequency.should.equalN(220, "frequency");

	apu.channels.pulses[1].timer = 708;
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

it("`FrameSequencer`: has a `counter` property and `reset`/`step` methods", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.frameSequencer.counter.should.equalN(0, "counter");
	apu.frameSequencer.should.respondTo("reset");
	apu.frameSequencer.should.respondTo("step");
})({
	locales: {
		es:
			"`FrameSequencer`: tiene una propiedad `counter` y métodos `reset`/`step`",
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
		const channel = apu.channels.pulses[i];
		channel.lengthCounter.counter.should.equalN(0, `[${i}]::counter`);
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
		const channel = apu.channels.pulses[i];
		channel.lengthCounter.should.respondTo("reset");
		channel.lengthCounter.counter = 2;
		channel.lengthCounter.reset();
		channel.lengthCounter.counter.should.equalN(0, `[${i}]::counter`);
	}
})({
	locales: {
		es: "`LengthCounter`: tiene un método `reset()` que asigna `counter` = 0",
	},
	use: ({ id }, book) => id >= book.getId("5c.8"),
});

// TODO: CONTINUE TESTING
