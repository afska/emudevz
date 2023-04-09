import CursedNESEmu from "cursed-nes-emu";
import mappers from "cursed-nes-emu/cartridge/mappers";
import filesystem from "./filesystem";
import Level from "./level/Level";
import testContext from "./terminal/commands/test/context";

export default class EmulatorBuilder {
	withUserCartridge = false;
	withUserCPU = false;
	withUserPPU = false;
	withUserAPU = false;
	withUserController = false;
	withUserConsole = false;
	withUserMappers = false;

	async build(withLastCode = false) {
		if (
			!this.withUserCartridge &&
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

				if (builder.withUserCartridge && !mainModule.Cartridge)
					throw new Error("🐒  `Cartridge` class not found");
				if (builder.withUserCPU && !mainModule.CPU)
					throw new Error("🐒  `CPU` class not found");
				if (builder.withUserPPU && !mainModule.PPU)
					throw new Error("🐒  `PPU` class not found");
				if (builder.withUserAPU && !mainModule.APU)
					throw new Error("🐒  `APU` class not found");
				if (builder.withUserController && !mainModule.Controller)
					throw new Error("🐒  `Controller` class not found");
				if (builder.withUserConsole && !mainModule.Console)
					throw new Error("🐒  `Controle` class not found");
				if (builder.withUserMappers && !mainModule.mappers)
					throw new Error("🐒  `mappers` object not found");

				if (builder.withUserCartridge) builder._patchCartridge(mainModule);
				if (builder.withUserCPU) builder._patchCPU(this, mainModule);
			}

			load(rom, saveFileBytes) {
				return super.load(
					rom,
					saveFileBytes,
					builder.withUserCartridge ? mainModule.Cartridge : undefined
				);
			}
		};
	}

	addUserCartridge(add = true) {
		this.withUserCartridge = add;
		return this;
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

	_patchCartridge(mainModule) {
		mainModule.Cartridge.prototype.createMapper = function () {
			const mapperId = this.header.mapperId;
			const Mapper = mappers[mapperId];
			if (!Mapper) throw new Error(`🐒  Unknown mapper: ${mapperId}.`);
			return new Mapper();
		};
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

		this._patchMemory(console.cpu.memory);
	}

	_patchMemory(memory) {
		this._patchMemoryReads(memory);
		this._patchMemoryWrites(memory);
	}

	_patchMemoryReads(memory) {
		const { withUserPPU, withUserAPU, withUserController } = this;

		memory.readAt = function (address) {
			return this.read(address);
		};

		memory.read2BytesAt = function (address) {
			return this.read16(address);
		};

		const read = memory.read;
		if (!read) throw new Error("🐒  CPU::memory::read(...) not found");

		memory.read = function (address) {
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

	_patchMemoryWrites(memory) {
		const { withUserPPU, withUserAPU, withUserController } = this;

		const write = memory.write;
		if (!write) throw new Error("🐒  CPU::memory::write(...) not found");

		memory.writeAt = function (address, value) {
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
				else if (address === 0x4017)
					return this.apu.registers.apuFrameCounter.writeAt(0, value);
			}

			// Controller ports
			if (!withUserController) {
				if (address === 0x4016)
					return this.controllers[0].port.writeAt(0, value);
			}

			// APU and I/O functionality that is normally disabled
			if (address >= 0x4018 && address <= 0x401f) return 0;

			// Cartridge space: PRG ROM, PRG RAM, and mapper registers
			if (address >= 0x4020 && address <= 0xffff)
				return this.mapper.segments.cpu.writeAt(address - 0x4020, value);

			// Original method call
			return write.call(this, address, value);
		};

		memory.write = function (address, value) {
			return this.mapper.cpuWriteAt(address, value);
		};
	}
}
