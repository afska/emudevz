import BrokenNEEES from "broken-neees";
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
	omitReset = false;

	async build(withLastCode = false) {
		if (
			!this.withUserCartridge &&
			!this.withUserCPU &&
			!this.withUserPPU &&
			!this.withUserAPU &&
			!this.withUserController &&
			!this.withUserConsole && // TODO: CONSOLE
			!this.withUserMappers
		)
			return BrokenNEEES();

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

		return BrokenNEEES({
			CPUMemory:
				this.withUserCPU ||
				this.withUserPPU ||
				this.withUserAPU ||
				this.withUserController ||
				this.withUserMappers
					? mainModule.CPUMemory
					: undefined,
			Cartridge: this.withUserCartridge ? mainModule.Cartridge : undefined,
			CPU: this.withUserCPU ? mainModule.CPU : undefined,
			PPU: this.withUserPPU ? mainModule.PPU : undefined,
			APU: this.withUserAPU ? mainModule.APU : undefined,
			Controller: this.withUserController ? mainModule.Controller : undefined,
			mappers: this.withUserMappers ? mainModule.mappers : undefined,
			omitReset: this.omitReset,
		});
	}

	addUserCartridge(add = true) {
		this.withUserCartridge = add;
		return this;
	}

	addUserCPU(add = true, omitReset = false) {
		this.withUserCPU = add;
		this.omitReset = omitReset;
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
}
