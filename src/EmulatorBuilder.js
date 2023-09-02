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
	withUsePartialPPU = false;
	withUsePartialAPU = false;
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

		const mainModule = await this._evaluate(withLastCode);
		let PPU = mainModule.PPU;
		let APU = mainModule.APU;
		if (withLastCode && this.withUserPPU && this.withUsePartialPPU) {
			const partialModule = await this._evaluate(false);
			PPU = partialModule.PPU;
		}
		if (withLastCode && this.withUserAPU && this.withUsePartialAPU) {
			const partialModule = await this._evaluate(false);
			APU = partialModule.APU;
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
			PPU: this.withUserPPU ? PPU : undefined,
			APU: this.withUserAPU ? APU : undefined,
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

	usePartialPPU(use = true) {
		this.withUsePartialPPU = use;
		return this;
	}

	usePartialAPU(use = true) {
		this.withUsePartialAPU = use;
		return this;
	}

	async _evaluate(withLastCode) {
		const javascript = testContext.javascript;
		let mainModule;
		const $ = javascript.prepare(Level.current, withLastCode);
		mainModule = (await $.evaluate()).default;

		return mainModule;
	}
}
