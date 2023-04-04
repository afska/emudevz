import CursedNESEmu from "cursed-nes-emu";
import filesystem from "./filesystem";
import Level from "./level/Level";
import testContext from "./terminal/commands/test/context";

export default class EmulatorBuilder {
	withUserCPU = false;
	withUserPPU = false;
	withUserAPU = false;
	withUserController = false;
	withUserConsole = false;
	withUserMappers = false;

	async build(withLastCode = false) {
		if (
			!this.withUserCPU &&
			!this.withUserPPU &&
			!this.withUserAPU &&
			!this.withUserController &&
			!this.withUserConsole &&
			!this.withUserMappers
		)
			return CursedNESEmu;

		const javascript = testContext.javascript;
		const symlinks = filesystem.symlinks;
		let mainModule;
		try {
			if (withLastCode) filesystem.setSymlinks([]);
			const $ = javascript.prepare(Level.current);
			mainModule = (await $.evaluate()).default;
		} finally {
			if (withLastCode) filesystem.setSymlinks(symlinks);
		}
		const builder = this;

		return class Console extends CursedNESEmu {
			constructor(...args) {
				super(...args);

				if (builder.withUserCPU) builder._patchCPU(this, mainModule);
			}
		};
	}

	addUserCPU(add = true) {
		this.withUserCPU = add;
		return this;
	}

	addUserPPU(add = true) {
		this.withUserPPU = add;
		return this;
	}

	addUserAPU(add = true) {
		this.withUserAPU = add;
		return this;
	}

	addUserController(add = true) {
		this.withUserController = add;
		return this;
	}

	addUserConsole(add = true) {
		this.withUserConsole = add;
		return this;
	}

	addUserMappers(add = true) {
		this.withUserMappers = add;
		return this;
	}

	_patchCPU(console, mainModule) {
		try {
			console.cpu = new mainModule.CPU();
		} catch (e) {
			throw new Error("🐒  Failure instantiating new CPU(): " + e?.message);
		}

		console.cpu.loadContext = ({ ppu, apu, mapper, controllers }) => {
			if (!console.cpu.memory) throw new Error("🐒  CPU::memory not found");

			if (!this.withUserPPU)
				console.cpu.memory.ppuRegisters = console.ppu.registers.toMemory();
			if (!this.withUserAPU)
				console.cpu.memory.apuRegisters = console.apu.registers.toMemory();

			try {
				console.cpu.memory.onLoad(ppu, apu, mapper, controllers);
			} catch (e) {
				throw new Error("🐒  CPU::memory::onLoad(...) failed: " + e?.message);
			}

			try {
				console.cpu.interrupt({
					id: "RESET",
					vector: 0xfffc,
				});
			} catch (e) {
				throw new Error("🐒  RESET interrupt failed: " + e?.message);
			}
		};

		if (!console.cpu.memory) throw new Error("🐒  CPU::memory not found");

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
		if (!read) throw new Error("🐒  CPU::memory::read(...) not found");

		Memory.prototype.read = function (address) {
			// PPU registers
			if (!withUserPPU) {
				if (address >= 0x2000 && address <= 0x2007)
					return this.ppuRegisters.readAt(address - 0x2000);
				else if (address >= 0x2008 && address <= 0x3fff)
					return this.ppuRegisters.readAt((address - 0x2008) % 0x0008);
				else if (address === 0x4014) return this.ppu.registers.oamDma.readAt(0);
			}

			// APU registers
			if (!withUserAPU) {
				if (address >= 0x4000 && address <= 0x4013)
					return this.apuRegisters.readAt(address - 0x4000);
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
		if (!write) throw new Error("🐒  CPU::memory::write(...) not found");

		Memory.prototype.write = function (address, value) {
			// PPU registers
			if (!withUserPPU) {
				if (address >= 0x2000 && address <= 0x2007)
					return this.ppuRegisters.writeAt(address - 0x2000, value);
				else if (address >= 0x2008 && address <= 0x3fff)
					return this.ppuRegisters.writeAt((address - 0x2008) % 0x0008, value);
				else if (address === 0x4014)
					return this.ppu.registers.oamDma.writeAt(0, value);
			}

			// APU registers
			if (!withUserAPU) {
				if (address >= 0x4000 && address <= 0x4013)
					return this.apuRegisters.writeAt(address - 0x4000, value);
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
