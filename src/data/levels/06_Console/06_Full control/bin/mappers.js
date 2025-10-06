import NROM from "./0_NROM";
// import MMC1 from "./1_MMC1";
// import UxROM from "./2_UxROM";
// import CNROM from "./3_CNROM";
// import MMC3 from "./4_MMC3";

export default {
  0: NROM,
  // 1: MMC1,
  // 2: UxROM,
  // 3: CNROM,
  // 4: MMC3,

  create(cpu, ppu, cartridge) {
    const mapperId = cartridge.header.mapperId;
    const Mapper = this[mapperId];
    if (!Mapper) throw new Error(`🐒  Unknown mapper: ${mapperId}.`);
    return new Mapper(cpu, ppu, cartridge);
  }
};
