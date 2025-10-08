import CPUMemory from "./CPUMemory";
import Cartridge from "./Cartridge";
import Controller from "./Controller";
import APU from "./apu/APU";
import CPU from "./cpu/CPU";
import mappers from "./mappers/mappers";
import PPU from "./ppu/PPU";

const PPU_STEPS_PER_CPU_CYCLE = 3;
const APU_STEPS_PER_CPU_CYCLE = 0.5;

export default class Emulator {
  constructor(onFrame, onSample) {
    this.onFrame = onFrame;
    this.onSample = (sample, pulse1, pulse2, triangle, noise, dmc) => {
      this.sampleCount++;
      onSample(sample, pulse1, pulse2, triangle, noise, dmc);
    };

    this.cpuMemory = new CPUMemory();
    this.cpu = new CPU(this.cpuMemory);
    this.ppu = new PPU(this.cpu);
    this.apu = new APU(this.cpu);

    this.sampleCount = 0;
    this.pendingPPUCycles = 0;
    this.pendingAPUCycles = 0;
  }

  /**
   * Loads a ROM file.
   * `bytes`: `Uint8Array`
   * `saveFileBytes`: `Uint8Array` or null
   */
  load(bytes, saveFileBytes = null) {
    const cartridge = new Cartridge(bytes);
    const mapper = mappers.create(this.cpu, this.ppu, cartridge);

    const controller1 = new Controller(1);
    const controller2 = new Controller(2);
    controller1.other = controller2;
    controller2.other = controller1;
    const controllers = [controller1, controller2];

    this.cpu.memory.onLoad(this.ppu, this.apu, mapper, controllers);
    this.ppu.onLoad(mapper);
    this.ppu.memory.onLoad(cartridge, mapper);

    this.pendingPPUCycles = 0;
    this.pendingAPUCycles = 0;
    this.context = {
      cartridge,
      mapper,
      controllers,
    };

    this.cpu.interrupt({
      id: "RESET",
      vector: 0xfffc,
    });

    this._setSaveFile(saveFileBytes);
  }

  /**
   * Updates a button's state.
   * `playerId`: `1` or `2`
   * `button`: One of "BUTTON_LEFT", "BUTTON_RIGHT", "BUTTON_UP", "BUTTON_DOWN", "BUTTON_A", "BUTTON_B", "BUTTON_X", "BUTTON_Y", "BUTTON_L", "BUTTON_R", "BUTTON_START", "BUTTON_SELECT"
   * `isPressed`: `boolean`
   */
  setButton(playerId, button, isPressed) {
    if (!this.context) return;
    if (playerId !== 1 && playerId !== 2)
      throw new Error(`Invalid player: ${playerId}.`);

    this.context.controllers[playerId - 1].update(button, isPressed);
  }

  /**
   * Runs the emulation for a whole frame.
   * Used when "SYNC TO VIDEO" is active.
   */
  frame() {
    if (!this.context) return;

    const currentFrame = this.ppu.frame;
    while (this.ppu.frame === currentFrame) {
      this.step();
    }
  }

  /**
   * Runs the emulation for `n` audio samples.
   * Used when "SYNC TO AUDIO" is active.
   * `n`: `number`
   */
  samples(n) {
    if (!this.context) return;

    this.sampleCount = 0;
    while (this.sampleCount < n) {
      this.step();
    }
  }

  /** Executes a step in the emulation (1 CPU instruction). */
  step() {
    let cpuCycles = this.cpu.step();
    cpuCycles = this._clockPPU(cpuCycles);
    this._clockAPU(cpuCycles);
  }

  /**
   * Returns an array with the save file bytes, or null if the game doesn't have a save file.
   */
  getSaveFile() {
    if (!this.context) return;
    const { prgRam } = this.context.mapper;
    if (!prgRam) return null;

    const bytes = [];
    for (let i = 0; i < prgRam.length; i++) {
      bytes[i] = prgRam[i];
    }

    return bytes;
  }

  _clockPPU(cpuCycles) {
    let unitCycles =
      this.pendingPPUCycles + cpuCycles * PPU_STEPS_PER_CPU_CYCLE;
    this.pendingPPUCycles = 0;

    const onIntr = (interrupt) => {
      const newCPUCycles = this.cpu.interrupt(interrupt);
      cpuCycles += newCPUCycles;
      unitCycles += newCPUCycles * PPU_STEPS_PER_CPU_CYCLE;
    };

    for (let i = 0; i < unitCycles; i++) {
      this.ppu.step(this.onFrame, onIntr);
    }

    return cpuCycles;
  }

  _clockAPU(cpuCycles) {
    let unitCycles =
      this.pendingAPUCycles + cpuCycles * APU_STEPS_PER_CPU_CYCLE;

    const onIntr = (interrupt) => {
      const newCPUCycles = this.cpu.interrupt(interrupt);
      unitCycles += newCPUCycles * APU_STEPS_PER_CPU_CYCLE;
      this.pendingPPUCycles += newCPUCycles * PPU_STEPS_PER_CPU_CYCLE;
    };

    while (unitCycles >= 1) {
      this.apu.step(this.onSample, onIntr);
      unitCycles--;
    }

    this.pendingAPUCycles = unitCycles;
  }

  _setSaveFile(prgRamBytes) {
    const prgRam = this.context.mapper.prgRam;
    if (!prgRam || !prgRamBytes) return;

    for (let i = 0; i < prgRamBytes.length; i++) {
      prgRam[i] = prgRamBytes[i];
    }
  }
}
