const { evaluate, filesystem, byte } = $;

let mainModule;
before(async () => {
	mainModule = await evaluate();
});

// 4.1 CPU Memory

it("there's a `/code/CPUMemory.js` file", () => {
	expect(filesystem.exists("/code/CPUMemory.js")).to.be.true;
})({
	locales: { es: "hay un archivo `/code/CPUMemory.js`" },
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("the file `/code/CPUMemory.js` is a JS module that exports <a class>", async () => {
	const module = await evaluate("/code/CPUMemory.js");
	expect(module?.default).to.exist;
	expect(module?.default).to.be.a.class;
})({
	locales: {
		es:
			"el archivo `/code/CPUMemory.js` es un módulo JS que exporta <una clase>",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("the file `/code/index.js` <imports> the module from `/code/CPUMemory.js`", () => {
	expect($.modules["/code/CPUMemory.js"]).to.exist;
})({
	locales: {
		es:
			"el archivo `/code/index.js` <importa> el módulo de `/code/CPUMemory.js`",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("the file `/code/index.js` exports <an object> containing the `CPUMemory` class", async () => {
	mainModule = await evaluate();
	const CPUMemory = (await evaluateModule($.modules["/code/CPUMemory.js"]))
		.default;

	expect(mainModule.default).to.be.an("object");
	expect(mainModule.default).to.include.key("CPUMemory");
	expect(mainModule.default.CPUMemory).to.equalN(CPUMemory, "CPUMemory");
})({
	locales: {
		es:
			"el archivo `/code/index.js` exporta <un objeto> que contiene la clase `CPUMemory`",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("has a `ram` property and `read(...)`/`write(...)` methods", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	expect(memory).to.include.key("ram");
	expect(memory.ram).to.be.a("Uint8Array");
	expect(memory.ram.length).to.equalN(2048, "length");
	expect(memory).to.respondTo("read");
	expect(memory).to.respondTo("write");
})({
	locales: {
		es: "incluye una propiedad `ram` y métodos `read(...)`/`write(...)`",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("can read from RAM ($0000-$07FF)", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0; i < 2048; i++) {
		const value = byte.random();
		memory.ram[i] = value;
		expect(memory.read(i)).to.equalN(value, `read(${i})`);
	}
})({
	locales: {
		es: "puede leer de RAM  ($0000-$07FF)",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("reading RAM mirror results in <RAM reads>", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0x0800; i < 0x0800 + 0x1800; i++) {
		const value = byte.random();
		memory.ram[(i - 0x0800) % 0x0800] = value;
		expect(memory.read(i)).to.equalN(value, `read(${i})`);
	}
})({
	locales: {
		es: "leer espejo de RAM ocasiona <lecturas de RAM>",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("can write to RAM ($0000-$07FF)", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0; i < 2048; i++) {
		const value = byte.random();
		memory.write(i, value);
		expect(memory.ram[i]).to.equalN(value, `ram[${i}]`);
	}
})({
	locales: {
		es: "puede escribir en RAM ($0000-$07FF)",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("writing RAM mirror results in <RAM writes>", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0x0800; i < 0x0800 + 0x1800; i++) {
		const value = byte.random();
		memory.write(i, value);
		const index = (i - 0x0800) % 0x0800;
		expect(memory.ram[index]).to.equalN(value, `ram[${index}]`);
	}
})({
	locales: {
		es: "escribir espejo de RAM ocasiona <escrituras en RAM>",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

// 4.2 Devices

it("saves the <devices> received by `onLoad(...)`", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	const ppu = {};
	const apu = {};
	const mapper = {};
	const controllers = [];

	expect(memory).to.respondTo("onLoad");
	memory.onLoad(ppu, apu, mapper, controllers);
	expect(memory.ppu).to.equalN(ppu, "ppu");
	expect(memory.apu).to.equalN(apu, "apu");
	expect(memory.mapper).to.equalN(mapper, "mapper");
	expect(memory.controllers).to.equalN(controllers, "controllers");
})({
	locales: {
		es: "guarda los <dispositivos> recibidos por `onLoad(...)`",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});

it("can read from the mapper ($4020-$FFFF)", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();
	const random = byte.random();
	const mapper = {
		cpuRead: (address) => address * random,
		cpuWrite: () => {},
	};
	memory.onLoad({}, {}, mapper, []);

	for (let i = 0x4020; i <= 0xffff; i++) {
		expect(memory.read(i)).to.equalHex(i * random, `read(${i})`);
	}
})({
	locales: {
		es: "puede leer del mapper ($4020-$FFFF)",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});

it("can write to the mapper ($4020-$FFFF)", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();
	let arg1 = -1,
		arg2 = -1;
	const mapper = {
		cpuRead: () => 0,
		cpuWrite: (a, b) => {
			arg1 = a;
			arg2 = b;
		},
	};
	memory.onLoad({}, {}, mapper, []);

	for (let i = 0x4020; i <= 0xffff; i++) {
		const value = byte.random();
		memory.write(i, value);
		expect(arg1).to.equalHex(i, "address");
		expect(arg2).to.equalHex(value, "value");
	}
})({
	locales: {
		es: "puede escribir en el mapper ($4020-$FFFF)",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});

// 4.3 Controller

it("there's a `/code/Controller.js` file", () => {
	expect(filesystem.exists("/code/Controller.js")).to.be.true;
})({
	locales: { es: "hay un archivo `/code/Controller.js`" },
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("the file `/code/Controller.js` is a JS module that exports <a class>", async () => {
	const module = await evaluate("/code/Controller.js");
	expect(module?.default).to.exist;
	expect(module?.default).to.be.a.class;
})({
	locales: {
		es:
			"el archivo `/code/Controller.js` es un módulo JS que exporta <una clase>",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("the file `/code/index.js` <imports> the module from `/code/Controller.js`", () => {
	expect($.modules["/code/Controller.js"]).to.exist;
})({
	locales: {
		es:
			"el archivo `/code/index.js` <importa> el módulo de `/code/Controller.js`",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("the file `/code/index.js` exports <an object> containing the `Controller` class", async () => {
	mainModule = await evaluate();
	const Controller = (await evaluateModule($.modules["/code/Controller.js"]))
		.default;

	expect(mainModule.default).to.be.an("object");
	expect(mainModule.default).to.include.key("Controller");
	expect(mainModule.default.Controller).to.equalN(Controller, "Controller");
})({
	locales: {
		es:
			"el archivo `/code/index.js` exporta <un objeto> que contiene la clase `Controller`",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("`Controller`: receives the `player` id and initializes <state>", () => {
	const Controller = mainModule.default.Controller;

	const controller = new Controller(1);

	expect(controller).to.include.key("strobe");
	expect(controller).to.include.key("cursor");
	expect(controller).to.include.key("other");
	expect(controller).to.include.key("_player");
	expect(controller).to.include.key("_buttons");

	expect(controller.strobe).to.equalN(false, "strobe");
	expect(controller.cursor).to.equalN(0, "cursor");
	expect(controller.other).to.equalN(null, "other");
	expect(controller._player).to.equalN(1, "_player");
	expect(controller._buttons).to.be.an("array");
	expect(controller._buttons.length).to.equalN(8, "_buttons.length");
	for (let i = 0; i < 8; i++)
		expect(controller._buttons[i]).to.equalN(false, `_buttons[${i}]`);
})({
	locales: {
		es: "`Controller`: recibe el id de `player` e inicializa el <estado>",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("`Controller`: has `update`, `onRead`, `onWrite` methods", () => {
	const Controller = mainModule.default.Controller;

	const controller = new Controller(1);

	expect(controller).to.respondTo("update");
	expect(controller).to.respondTo("onRead");
	expect(controller).to.respondTo("onWrite");
})({
	locales: {
		es: "`Controller`: tiene métodos `update`, `onRead`, `onWrite`",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("`Controller`: turns <strobe> on/off with bit 0 set/clear, resets the <cursor> on both controllers", () => {
	const Controller = mainModule.default.Controller;

	const c1 = new Controller(1);
	const c2 = new Controller(2);
	c1.other = c2;
	c2.other = c1;

	c1.cursor = 5;
	c2.cursor = 7;

	c1.onWrite(0x01); // strobe on

	expect(c1.strobe).to.equalN(true, "strobe");
	expect(c1.cursor).to.equalN(0, "c1.cursor");
	expect(c2.cursor).to.equalN(0, "c2.cursor");

	c1.onWrite(0x00); // strobe off
	expect(c1.strobe).to.equalN(false, "strobe");
})({
	locales: {
		es:
			"`Controller`: enciende/apaga el <strobe> con el bit 0 encendido/apagado y reinicia el <cursor> en ambos controles",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("`Controller`: any byte with bit 0 set/clear should turn <strobe> on/off", () => {
	const Controller = mainModule.default.Controller;

	const c1 = new Controller(1);
	const c2 = new Controller(2);
	c1.other = c2;
	c2.other = c1;

	c1.onWrite(0x41);
	expect(c1.strobe).to.equalN(true, "strobe");
	c1.onWrite(0x63);
	expect(c1.strobe).to.equalN(true, "strobe");

	c1.onWrite(0x20);
	expect(c1.strobe).to.equalN(false, "strobe");
	c1.onWrite(0x40);
	expect(c1.strobe).to.equalN(false, "strobe");
})({
	locales: {
		es:
			"`Controller`: cualquier byte con bit 0 encendido/apagado enciende/apaga el <strobe>",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("`Controller`: with strobe <on>, `onRead()` always returns the state of `BUTTON_A`", () => {
	const Controller = mainModule.default.Controller;

	const c1 = new Controller(1);
	const c2 = new Controller(2);
	c1.other = c2;
	c2.other = c1;

	// A pressed on both
	c1.update("BUTTON_A", true);
	c2.update("BUTTON_A", true);

	c1.onWrite(0x01); // strobe on

	for (let i = 0; i < 12; i++) {
		expect(c1.onRead()).to.equalN(1, "c1.onRead()");
		expect(c2.onRead()).to.equalN(1, "c2.onRead()");
	}

	// toggle A off and verify it follows
	c1.update("BUTTON_A", false);
	c2.update("BUTTON_A", false);

	for (let i = 0; i < 4; i++) {
		expect(c1.onRead()).to.equalN(0, "c1.onRead()");
		expect(c2.onRead()).to.equalN(0, "c2.onRead()");
	}
})({
	locales: {
		es:
			"`Controller`: con el strobe <encendido>, `onRead()` siempre retorna el estado del `BUTTON_A`",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("`Controller`: player 2 uses the `strobe` flag from the <other> controller", () => {
	const Controller = mainModule.default.Controller;

	const c1 = new Controller(1);
	const c2 = new Controller(2);
	c1.other = c2;
	c2.other = c1;

	c2.update("BUTTON_A", true);

	// strobe off -> reads should advance
	expect(c2.onRead()).to.equalN(1, "c2.onRead() [A]");
	expect(c2.onRead()).to.equalN(0, "c2.onRead() [B]");

	// turn strobe on in player 1 and verify player 2 now sticks to A
	c1.onWrite(0x01);
	for (let i = 0; i < 6; i++)
		expect(c2.onRead()).to.equalN(1, `c2.onRead()[${i}]`);
})({
	locales: {
		es: "`Controller`: el jugador 2 usa la bandera `strobe` del <otro> control",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("`Controller`: with strobe <off>, `onRead()` advances through the sequence", () => {
	const Controller = mainModule.default.Controller;

	const c1 = new Controller(1);
	const c2 = new Controller(2);
	c1.other = c2;
	c2.other = c1;

	// C1 pattern: 1,0,1,0,1,0,1,0 for A..Right
	// C2 pattern: 0,0,0,0,1,1,1,1 for A..Right
	const order = [
		"BUTTON_A",
		"BUTTON_B",
		"BUTTON_SELECT",
		"BUTTON_START",
		"BUTTON_UP",
		"BUTTON_DOWN",
		"BUTTON_LEFT",
		"BUTTON_RIGHT",
	];
	for (let i = 0; i < 8; i++) {
		c1.update(order[i], i % 2 === 0);
		c2.update(order[i], i >= 4);
	}

	const expectedC1 = [1, 0, 1, 0, 1, 0, 1, 0];
	for (let i = 0; i < 8; i++) {
		expect(c1.onRead()).to.equalN(expectedC1[i], `c1.onRead() #${i}`);
	}

	const expectedC2 = [0, 0, 0, 0, 1, 1, 1, 1];
	for (let i = 0; i < 8; i++) {
		expect(c2.onRead()).to.equalN(expectedC2[i], `c2.onRead() #${i}`);
	}
})({
	locales: {
		es:
			"`Controller`: con el strobe <apagado>, `onRead()` avanza por la secuencia",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("`Controller`: after reading `BUTTON_RIGHT`, future reads return 1 until the sequence is reset", () => {
	const Controller = mainModule.default.Controller;

	const c1 = new Controller(1);
	const c2 = new Controller(2);
	c1.other = c2;
	c2.other = c1;

	// all buttons released
	const buttons = [
		"BUTTON_A",
		"BUTTON_B",
		"BUTTON_SELECT",
		"BUTTON_START",
		"BUTTON_UP",
		"BUTTON_DOWN",
		"BUTTON_LEFT",
		"BUTTON_RIGHT",
	];
	buttons.forEach((b) => c1.update(b, false));

	// consume 8 reads (A..Right)
	for (let i = 0; i < 8; i++) c1.onRead();

	// now it should stick to 1
	for (let i = 0; i < 4; i++)
		expect(c1.onRead()).to.equalN(1, `c1.onRead() #${i}`);

	// same with c2
	for (let i = 0; i < 8; i++) c2.onRead();
	for (let i = 0; i < 4; i++)
		expect(c2.onRead()).to.equalN(1, `c2.onRead() #${i}`);
})({
	locales: {
		es:
			"`Controller`: luego de leer `BUTTON_RIGHT`, las lecturas futuras retornan 1 hasta reiniciar la secuencia",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("`Controller`: writing 1 then 0 to $4016 resets the sequence to `BUTTON_A` on <both controllers>", () => {
	const Controller = mainModule.default.Controller;

	const c1 = new Controller(1);
	const c2 = new Controller(2);
	c1.other = c2;
	c2.other = c1;

	// c1: pressed, c2: released
	c1.update("BUTTON_A", true);
	c2.update("BUTTON_A", false);

	// advance cursors a bit
	for (let i = 0; i < 3; i++) {
		c1.onRead();
		c2.onRead();
	}

	// reset sequence: write 1 then 0 to $4016
	c1.onWrite(0x01);
	c1.onWrite(0x00);

	// next read should be A again on both
	expect(c1.onRead()).to.equalN(1, "c1.onRead()");
	expect(c2.onRead()).to.equalN(0, "c2.onRead()");
})({
	locales: {
		es:
			"`Controller`: escribir 1 y luego 0 en $4016 reinicia la secuencia al `BUTTON_A` en <ambos controles>",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("maps the $4016 <reads/writes> and $4017 <reads> to the controllers", () => {
	const Controller = mainModule.default.Controller;
	const CPUMemory = mainModule.default.CPUMemory;

	const cpuMemory = new CPUMemory();
	const controller1 = new Controller(1);
	const controller2 = new Controller(2);
	controller1.other = controller2;
	controller2.other = controller1;

	sinon.stub(controller1, "onRead").returns(123);
	sinon.spy(controller1, "onWrite");
	sinon.stub(controller2, "onRead").returns(345);
	sinon.spy(controller2, "onWrite");

	cpuMemory.onLoad(
		{} /* ppu */,
		{ registers: { write: () => {} } } /* apu */,
		{} /* mapper */,
		[controller1, controller2]
	);

	cpuMemory.read(0x4016).should.equal(123, "read(0x4016)");
	expect(controller1.onRead).to.have.been.calledOnce;

	cpuMemory.read(0x4017).should.equal(345, "read(0x4016)");
	expect(controller2.onRead).to.have.been.calledOnce;

	cpuMemory.write(0x4016, 43);
	expect(controller1.onWrite).to.have.been.calledWith(43);

	controller1.onWrite.resetHistory();
	controller2.onWrite.resetHistory();
	cpuMemory.write(0x4017, 201);
	expect(controller1.onWrite).to.not.have.been.called;
	expect(controller2.onWrite).to.not.have.been.called;
})({
	locales: {
		es:
			"mapea las lecturas/escrituras de $4016 y las lecturas de $4017 a los mandos",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});
