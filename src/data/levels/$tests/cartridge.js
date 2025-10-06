const { evaluate, filesystem, byte } = $;

let mainModule;
before(async () => {
  mainModule = await evaluate();
});

// 3.1 Using JS modules

it("there's a `/code/Cartridge.js` file", () => {
  expect(filesystem.exists("/code/Cartridge.js")).to.be.true;
})({
  locales: { es: "hay un archivo `/code/Cartridge.js`" },
  use: ({ id }, book) => id >= book.getId("3.1"),
});

it("the file `/code/Cartridge.js` is a JS module that exports <a class>", async () => {
  const module = await evaluate("/code/Cartridge.js");
  expect(module?.default).to.exist;
  expect(module?.default).to.be.a.class;
})({
  locales: {
    es:
      "el archivo `/code/Cartridge.js` es un módulo JS que exporta <una clase>",
  },
  use: ({ id }, book) => id >= book.getId("3.1"),
});

it("the file `/code/index.js` <imports> the module from `/code/Cartridge.js`", () => {
  expect($.modules["/code/Cartridge.js"]).to.exist;
})({
  locales: {
    es:
      "el archivo `/code/index.js` <importa> el módulo de `/code/Cartridge.js`",
  },
  use: ({ id }, book) => id >= book.getId("3.1"),
});

it("the file `/code/index.js` exports <an object> containing the `Cartridge` class", async () => {
  mainModule = await evaluate();
  const Cartridge = (await evaluateModule($.modules["/code/Cartridge.js"]))
    .default;

  expect(mainModule.default).to.be.an("object");
  expect(mainModule.default).to.include.key("Cartridge");
  expect(mainModule.default.Cartridge).to.equalN(Cartridge, "Cartridge");
})({
  locales: {
    es:
      "el archivo `/code/index.js` exporta <un objeto> que contiene la clase `Cartridge`",
  },
  use: ({ id }, book) => id >= book.getId("3.1"),
});

// 3.3 The magic constant

it("instantiating a `Cartridge` with a <valid header> saves a `bytes` property", () => {
  const Cartridge = mainModule.default.Cartridge;

  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a]);
  expect(new Cartridge(bytes).bytes).to.equalN(bytes, "bytes");
})({
  locales: {
    es:
      "instanciar un `Cartridge` con una <cabecera válida> guarda una propiedad `bytes`",
  },
  use: ({ id }, book) => id >= book.getId("3.3"),
});

it("instantiating a `Cartridge` with an <invalid header> throws an error", () => {
  const Cartridge = mainModule.default.Cartridge;

  [
    [0x11, 0x22, 0x33, 0x44],
    [0x99, 0x45, 0x53, 0x1a],
    [0x4e, 0x99, 0x53, 0x1a],
    [0x4e, 0x45, 0x99, 0x1a],
    [0x4e, 0x45, 0x53, 0x99],
  ].forEach((wrongBytes) => {
    const bytes = new Uint8Array(wrongBytes);
    expect(() => new Cartridge(bytes)).to.throw(Error, /Invalid ROM/);
  });
})({
  locales: {
    es: "instanciar un `Cartridge` con una <cabecera inválida> tira un error",
  },
  use: ({ id }, book) => id >= book.getId("3.3"),
});

// 3.4 Reading the header

it("has a `header` property with <metadata> (PRG-ROM pages)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

  for (let i = 0; i < 256; i++) {
    bytes[4] = i;
    const header = new Cartridge(bytes).header;
    expect(header, "header").to.be.an("object");
    expect(header).to.include.key("prgRomPages");
    expect(header.prgRomPages).to.equalN(i, "prgRomPages");
  }
})({
  locales: {
    es: "tiene una propiedad `header` con <metadatos> (páginas de PRG-ROM)",
  },
  use: ({ id }, book) => id >= book.getId("3.4"),
});

it("has a `header` property with <metadata> (CHR-ROM pages)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

  for (let i = 0; i < 256; i++) {
    bytes[5] = i;
    const header = new Cartridge(bytes).header;
    expect(header, "header").to.be.an("object");
    expect(header).to.include.key("chrRomPages");
    expect(header.chrRomPages).to.equalN(i, "chrRomPages");
    expect(header).to.include.key("usesChrRam");
    expect(header.usesChrRam).to.equalN(i === 0, "usesChrRam");
  }
})({
  locales: {
    es: "tiene una propiedad `header` con <metadatos> (páginas de CHR-ROM)",
  },
  use: ({ id }, book) => id >= book.getId("3.4"),
});

it("has a `header` property with <metadata> (512-byte padding)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

  [
    [false, 0b00000000],
    [true, 0b00000100],
  ].forEach(([has512BytePadding, flags6]) => {
    bytes[6] = flags6;
    const header = new Cartridge(bytes).header;
    expect(header, "header").to.be.an("object");
    expect(header).to.include.key("has512BytePadding");
    expect(header.has512BytePadding).to.equalN(
      has512BytePadding,
      "has512BytePadding"
    );
  });
})({
  locales: {
    es: "tiene una propiedad `header` con <metadatos> (padding de 512 bytes)",
  },
  use: ({ id }, book) => id >= book.getId("3.4"),
});

it("has a `header` property with <metadata> (PRG-RAM presence)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

  [
    [false, 0b00000000],
    [true, 0b00000010],
  ].forEach(([hasPrgRam, flags6]) => {
    bytes[6] = flags6;
    const header = new Cartridge(bytes).header;
    expect(header, "header").to.be.an("object");
    expect(header).to.include.key("hasPrgRam");
    expect(header.hasPrgRam).to.equalN(hasPrgRam, "hasPrgRam");
  });
})({
  locales: {
    es: "tiene una propiedad `header` con <metadatos> (presencia de PRG-RAM)",
  },
  use: ({ id }, book) => id >= book.getId("3.4"),
});

it("has a `header` property with <metadata> (mirroring id)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

  [
    ["HORIZONTAL", 0b00000000],
    ["VERTICAL", 0b00000001],
    ["FOUR_SCREEN", 0b00001001],
    ["FOUR_SCREEN", 0b00001000],
  ].forEach(([mirroringId, flags6]) => {
    bytes[6] = flags6;
    const header = new Cartridge(bytes).header;
    expect(header, "header").to.be.an("object");
    expect(header).to.include.key("mirroringId");
    expect(header.mirroringId).to.equalN(mirroringId, "mirroringId");
  });
})({
  locales: {
    es: "tiene una propiedad `header` con <metadatos> (id de mirroring)",
  },
  use: ({ id }, book) => id >= book.getId("3.4"),
});

it("has a `header` property with <metadata> (mapper id)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

  for (let i = 0; i < 256; i++) {
    const lowNybble = byte.lowNybbleOf(i);
    const highNybble = byte.highNybbleOf(i);
    bytes[6] = byte.buildU8(lowNybble, 0);
    bytes[7] = byte.buildU8(highNybble, 0);
    expect(new Cartridge(bytes).header.mapperId).to.equalN(i, "mapperId");
  }
})({
  locales: {
    es: "tiene una propiedad `header` con <metadatos> (id de mapper)",
  },
  use: ({ id }, book) => id >= book.getId("3.4"),
});

// 3.5 Locating the program

const buildHeader = (withPadding, flags6, prgPages, chrPages) => {
  // prettier-ignore
  const header = [0x4e, 0x45, 0x53, 0x1a, prgPages, chrPages, flags6, 0b00000000, 0, 0, 0, 0, 0, 0, 0, 0];
  if (withPadding) header.push(...new Array(512).fill(0));
  return header;
};

const buildRom = (
  withPadding = false,
  flags6 = 0b00000000,
  prgPages = 1 + byte.random(3),
  chrPages = 1 + byte.random(3)
) => {
  const header = buildHeader(withPadding, flags6, prgPages, chrPages);
  const prg = [];
  const chr = [];
  for (let i = 0; i < prgPages * 16384; i++) prg.push(byte.random());
  for (let i = 0; i < chrPages * 8192; i++) chr.push(byte.random());
  const bytes = new Uint8Array([...header, ...prg, ...chr]);

  return { header, prg, chr, bytes };
};

it("`prg()` returns <the code> (no padding)", () => {
  const Cartridge = mainModule.default.Cartridge;
  const { prg, bytes } = buildRom();

  const cartridge = new Cartridge(bytes);
  expect(cartridge).to.respondTo("prg");
  expect(cartridge.prg(), "prg()").to.eql(new Uint8Array(prg));
})({
  locales: {
    es: "`prg()` retorna <el código> (sin relleno)",
  },
  use: ({ id }, book) => id >= book.getId("3.5"),
});

it("`prg()` returns <the code> (with padding)", () => {
  const Cartridge = mainModule.default.Cartridge;
  const { prg, bytes } = buildRom(true, 0b00000100);

  const cartridge = new Cartridge(bytes);
  expect(cartridge).to.respondTo("prg");
  expect(cartridge.prg(), "prg()").to.eql(new Uint8Array(prg));
})({
  locales: {
    es: "`prg()` retorna <el código> (con relleno)",
  },
  use: ({ id }, book) => id >= book.getId("3.5"),
});

// 3.6 Locating the graphics

it("`chr()` returns <the graphics> (using CHR-ROM)", () => {
  const Cartridge = mainModule.default.Cartridge;
  const { chr, bytes } = buildRom();

  const cartridge = new Cartridge(bytes);
  expect(cartridge).to.respondTo("chr");
  expect(cartridge.chr(), "chr()").to.eql(new Uint8Array(chr));
})({
  locales: {
    es: "`chr()` retorna <los gráficos> (usando CHR-ROM)",
  },
  use: ({ id }, book) => id >= book.getId("3.6"),
});

it("`chr()` returns <the graphics> (using CHR-RAM)", () => {
  const Cartridge = mainModule.default.Cartridge;
  const { bytes } = buildRom(undefined, undefined, undefined, 0);

  const cartridge = new Cartridge(bytes);
  expect(cartridge).to.respondTo("chr");
  expect(cartridge.chr(), "chr()").to.eql(new Uint8Array(8192));
})({
  locales: {
    es: "`chr()` retorna <los gráficos> (usando CHR-RAM)",
  },
  use: ({ id }, book) => id >= book.getId("3.6"),
});
