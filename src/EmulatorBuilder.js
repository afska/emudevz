import CursedNESEmu from "cursed-nes-emu";
import Level from "./level/Level";
import testContext from "./terminal/commands/test/context";

const javascript = testContext.javascript;

export default class EmulatorBuilder {
	withUserCPU = false;
	withUserPPU = false;
	withUserAPU = false;
	withUserController = false;
	withUserConsole = false;
	withUserMappers = false;

	async build() {
		const $ = javascript.prepare(Level.current);
		const mainModule = (await $.evaluate()).default;

		if (
			!this.withUserCPU &&
			!this.withUserPPU &&
			!this.withUserAPU &&
			!this.withUserController &&
			!this.withUserConsole &&
			!this.withUserMappers
		)
			return CursedNESEmu;

		const builder = this;

		return class Console extends CursedNESEmu {
			constructor(...args) {
				super(...args);

				if (builder.withUserCPU) builder._patchCPU(this, mainModule);
			}
		};
	}

	addUserCPU() {
		this.withUserCPU = true;
	}

	addUserPPU() {
		this.withUserPPU = true;
	}

	addUserAPU() {
		this.withUserAPU = true;
	}

	addUserController() {
		this.withUserController = true;
	}

	addUserConsole() {
		this.withUserConsole = true;
	}

	addUserMappers() {
		this.withUserMappers = true;
	}

	_patchCPU(console, mainModule) {
		console.cpu = new mainModule.CPU();

		if (!this.withUserPPU)
			console.cpu.memory.ppuRegisters = console.ppu.registers.toMemory();
		if (!this.withUserAPU)
			console.cpu.memory.apuRegisters = console.apu.registers.toMemory();

		console.cpu.loadContext = ({ ppu, apu, mapper, controllers }) => {
			// TODO: MOVE TO USER CODE
			console.cpu.memory.ppu = ppu;
			console.cpu.memory.apu = apu;
			console.cpu.memory.mapper = mapper;
			console.cpu.memory.controllers = controllers;
		};

		const Memory = console.cpu.memory.constructor;
		this._patchMemory(Memory);
	}

	_patchMemory(Memory) {
		this._patchMemoryAccessors(Memory);
		this._patchMemoryReads(Memory);
		this._patchMemoryWrites(Memory);
	}

	_patchMemoryAccessors(Memory) {
		Memory.prototype.readAt = function (address) {
			return this.read(address);
		};

		Memory.prototype.writeAt = function (address, value) {
			this.write(address, value);
		};

		Memory.prototype.read2BytesAt = function (address) {
			return this.read16(address);
		};
	}

	_patchMemoryReads(Memory) {
		const { withUserPPU, withUserAPU, withUserController } = this;

		const read = Memory.prototype.read;
		Memory.prototype.read = function (address) {
			// PPU registers
			if (!withUserPPU) {
				if (address >= 0x2000 && address <= 0x2007)
					return this.ppuRegisters[address - 0x2000].readAt(0);
				else if (address >= 0x2008 && address <= 0x3fff)
					return this.ppuRegisters[(address - 0x2008) % 0x0008].readAt(0);
				else if (address === 0x4014) return this.ppu.registers.oamDma.readAt(0);
			}

			// APU registers
			if (!withUserAPU) {
				if (address >= 0x4000 && address <= 0x4013)
					return this.apuRegisters[address - 0x4000].readAt(0);
				else if (address === 0x4015)
					return this.apu.registers.apuMain.readAt(0);
			}

			// Controller ports
			if (!withUserController) {
				if (address === 0x4016) return this.controllers[0].port.readAt(0);
				else if (address === 0x4017) return this.controllers[1].port.readAt(0);
			}

			// APU and I/O functionality that is normally disabled
			if (address >= 0x4018 && address <= 0x401f) return 0;

			// Cartridge space: PRG ROM, PRG RAM, and mapper registers
			if (address >= 0x4020 && address <= 0xffff)
				return this.mapper.segments.cpu.readAt(address - 0x4020);

			// Original method call
			return read.call(this, address);
		};
	}

	_patchMemoryWrites(Memory) {
		const { withUserPPU, withUserAPU, withUserController } = this;

		const write = Memory.prototype.write;
		Memory.prototype.write = function (address, value) {
			// PPU registers
			if (!withUserPPU) {
				if (address >= 0x2000 && address <= 0x2007)
					return this.ppuRegisters[address - 0x2000].writeAt(0, value);
				else if (address >= 0x2008 && address <= 0x3fff)
					return this.ppuRegisters[(address - 0x2008) % 0x0008].writeAt(
						0,
						value
					);
				else if (address === 0x4014)
					return this.ppu.registers.oamDma.writeAt(0, value);
			}

			// APU registers
			if (!withUserAPU) {
				if (address >= 0x4000 && address <= 0x4013)
					return this.apuRegisters[address - 0x4000].writeAt(0, value);
				else if (address === 0x4015)
					return this.apu.registers.apuMain.writeAt(0, value);
			}

			// Controller ports
			if (!withUserController) {
				if (address === 0x4016)
					return this.controllers[0].port.writeAt(0, value);
				else if (address === 0x4017)
					return this.controllers[1].port.writeAt(0, value);
			}

			// APU and I/O functionality that is normally disabled
			if (address >= 0x4018 && address <= 0x401f) return 0;

			// Cartridge space: PRG ROM, PRG RAM, and mapper registers
			if (address >= 0x4020 && address <= 0xffff)
				return this.mapper.cpuWriteAt(address, value);

			// Original method call
			return write.call(this, address, value);
		};
	}
}
