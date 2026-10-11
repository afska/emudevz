const { evaluate, filesystem, byte } = $;

let mainModule;
before(async () => {
  mainModule = await evaluate();
});

// 3.1 Using JS modules

it("there's a `/code/Cartridge.js` file", () => {
  expect(filesystem.exists("/code/Cartridge.js")).to.be.true;
})({
  locales: {
    es: "hay un archivo `/code/Cartridge.js`",
    ru: "существует файл `/code/Cartridge.js`",
  },
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
    ru: "файл `/code/Cartridge.js` — JS-модуль, который экспортирует <класс>",
  },
  use: ({ id }, book) => id >= book.getId("3.1"),
});

it("the file `/code/index.js` <imports> the module from `/code/Cartridge.js`", () => {
  expect($.modules["/code/Cartridge.js"]).to.exist;
})({
  locales: {
    es:
      "el archivo `/code/index.js` <importa> el módulo de `/code/Cartridge.js`",
    ru: "файл `/code/index.js` <импортирует> модуль из `/code/Cartridge.js`",
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
    ru:
      "файл `/code/index.js` экспортирует <объект>, содержащий класс `Cartridge`",
  },
  use: ({ id }, book) => id >= book.getId("3.1"),
});

// 3.3 The magic constant

it("instantiating a `Cartridge` with a <valid header> saves a `bytes` property", () => {
  const Cartridge = mainModule.default.Cartridge;

  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, ...new Uint8Array(12)]);
  expect(new Cartridge(bytes).bytes).to.equalN(bytes, "bytes");
})({
  locales: {
    es:
      "instanciar un `Cartridge` con una <cabecera válida> guarda una propiedad `bytes`",
    ru:
      "создание `Cartridge` с <корректным заголовком> сохраняет свойство `bytes`",
  },
  use: ({ id }, book) => id >= book.getId("3.3"),
});

it("instantiating a `Cartridge` with an <invalid header> throws an error", () => {
  const Cartridge = mainModule.default.Cartridge;

  [
    [0x11, 0x22, 0x33, 0x44, ...new Uint8Array(12)],
    [0x99, 0x45, 0x53, 0x1a, ...new Uint8Array(12)],
    [0x4e, 0x99, 0x53, 0x1a, ...new Uint8Array(12)],
    [0x4e, 0x45, 0x99, 0x1a, ...new Uint8Array(12)],
    [0x4e, 0x45, 0x53, 0x99, ...new Uint8Array(12)],
  ].forEach((wrongBytes) => {
    const bytes = new Uint8Array(wrongBytes);
    expect(() => new Cartridge(bytes)).to.throw(Error, /Invalid ROM/);
  });
})({
  locales: {
    es: "instanciar un `Cartridge` con una <cabecera inválida> tira un error",
    ru: "создание `Cartridge` с <некорректным заголовком> вызывает ошибку",
  },
  use: ({ id }, book) => id >= book.getId("3.3"),
});

// 3.4 Reading the header

it("has a `header` property with <metadata> (PRG-ROM pages)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

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
    ru: "содержит свойство `header` с <метаданными> (страницы PRG-ROM)",
  },
  use: ({ id }, book) => id >= book.getId("3.4"),
});

it("has a `header` property with <metadata> (CHR-ROM pages)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

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
    ru: "содержит свойство `header` с <метаданными> (страницы CHR-ROM)",
  },
  use: ({ id }, book) => id >= book.getId("3.4"),
});

it("has a `header` property with <metadata> (512-byte padding)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

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
    ru:
      "содержит свойство `header` с <метаданными> (блок заполнения в 512 байт)",
  },
  use: ({ id }, book) => id >= book.getId("3.4"),
});

it("has a `header` property with <metadata> (PRG-RAM presence)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

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
    ru: "содержит свойство `header` с <метаданными> (наличие PRG-RAM)",
  },
  use: ({ id }, book) => id >= book.getId("3.4"),
});

it("has a `header` property with <metadata> (mirroring id)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

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
    ru:
      "содержит свойство `header` с <метаданными> (идентификатор зеркалирования)",
  },
  use: ({ id }, book) => id >= book.getId("3.4"),
});

it("has a `header` property with <metadata> (mapper id)", () => {
  const Cartridge = mainModule.default.Cartridge;
  // prettier-ignore
  const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random(), ...new Uint8Array(8)]);

  for (let i = 0; i < 256; i++) {
    const lowNybble = byte.lowNybbleOf(i);
    const highNybble = byte.highNybbleOf(i);
    bytes[6] = byte.buildU8(lowNybble, 0b1011);
    bytes[7] = byte.buildU8(highNybble, 0b1010);
    expect(new Cartridge(bytes).header.mapperId).to.equalN(i, "mapperId");
  }
})({
  locales: {
    es: "tiene una propiedad `header` con <metadatos> (id de mapper)",
    ru: "содержит свойство `header` с <метаданными> (идентификатор маппера)",
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
  chrPages = 1 + byte.random(3),
  trailerBytes = 99
) => {
  const header = buildHeader(withPadding, flags6, prgPages, chrPages);
  const prg = [];
  const chr = [];
  const trailer = [];
  for (let i = 0; i < prgPages * 16384; i++) prg.push(byte.random());
  for (let i = 0; i < chrPages * 8192; i++) chr.push(byte.random());
  for (let i = 0; i < trailerBytes; i++) trailer.push(byte.random());
  const bytes = new Uint8Array([...header, ...prg, ...chr, ...trailer]);

  return { header, prg, chr, trailer, bytes };
};

it("`prg()` returns <the code> (no padding)", () => {
  const Cartridge = mainModule.default.Cartridge;
  const { prg, bytes } = buildRom();

  const cartridge = new Cartridge(bytes);
  expect(cartridge).to.respondTo("prg");

  const userPrg = cartridge.prg();
  expect(userPrg?.length).to.equalN(prg.length, "prg().length");
  expect(userPrg, "prg()").to.eql(new Uint8Array(prg));
})({
  locales: {
    es: "`prg()` retorna <el código> (sin relleno)",
    ru: "`prg()` возвращает <код> (без блока заполнения)",
  },
  use: ({ id }, book) => id >= book.getId("3.5"),
});

it("`prg()` returns <the code> (with padding)", () => {
  const Cartridge = mainModule.default.Cartridge;
  const { prg, bytes } = buildRom(true, 0b00000100);

  const cartridge = new Cartridge(bytes);
  expect(cartridge).to.respondTo("prg");

  const userPrg = cartridge.prg();
  expect(userPrg?.length).to.equalN(prg.length, "prg().length");
  expect(userPrg, "prg()").to.eql(new Uint8Array(prg));
})({
  locales: {
    es: "`prg()` retorna <el código> (con relleno)",
    ru: "`prg()` возвращает <код> (с блоком заполнения)",
  },
  use: ({ id }, book) => id >= book.getId("3.5"),
});

// 3.6 Locating the graphics

it("`chr()` returns <the graphics> (using CHR-ROM)", () => {
  const Cartridge = mainModule.default.Cartridge;
  const { chr, bytes } = buildRom();

  const cartridge = new Cartridge(bytes);
  expect(cartridge).to.respondTo("chr");

  const userChr = cartridge.chr();
  expect(userChr?.length).to.equalN(chr.length, "chr().length");
  expect(userChr, "chr()").to.eql(new Uint8Array(chr));
})({
  locales: {
    es: "`chr()` retorna <los gráficos> (usando CHR-ROM)",
    ru: "`chr()` возвращает <графику> (используя CHR-ROM)",
  },
  use: ({ id }, book) => id >= book.getId("3.6"),
});

it("`chr()` returns <the graphics> (using CHR-RAM)", () => {
  const Cartridge = mainModule.default.Cartridge;
  const { bytes } = buildRom(undefined, undefined, undefined, 0);

  const cartridge = new Cartridge(bytes);
  expect(cartridge).to.respondTo("chr");

  const userChr = cartridge.chr();
  expect(userChr?.length).to.equalN(8192, "chr().length");
  expect(userChr, "chr()").to.eql(new Uint8Array(8192));
})({
  locales: {
    es: "`chr()` retorna <los gráficos> (usando CHR-RAM)",
    ru: "`chr()` возвращает <графику> (используя CHR-RAM)",
  },
  use: ({ id }, book) => id >= book.getId("3.6"),
});
