const { evaluate, byte } = $;

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
