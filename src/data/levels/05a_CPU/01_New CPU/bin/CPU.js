export default class CPU {
  constructor(cpuMemory) {
    this.memory = cpuMemory;
    this.cycle = 0;
    this.extraCycles = 0;
  }
}
