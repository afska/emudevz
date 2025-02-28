import BrokenNEEES from "broken-neees";
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
	customPPU = null;
	customAPU = null;
	omitReset = false;
	unbroken = false;
	hardware = false;

	async build(withLastCode = false) {
		let mainModule = null;
		let PPU = null;
		let APU = null;

		if (!this.hardware) {
			mainModule = await this._evaluate(withLastCode);
			PPU = mainModule.PPU;
			APU = mainModule.APU;
			if (withLastCode && this.withUserPPU && this.withUsePartialPPU) {
				const partialModule = await this._evaluate(false);
				PPU = partialModule.PPU;
			}
			if (withLastCode && this.withUserAPU && this.withUsePartialAPU) {
				const partialModule = await this._evaluate(false);
				APU = partialModule.APU;
			}
		}

		const useCPUMemory = !!(
			this.withUserCPU ||
			this.withUserPPU ||
			this.withUserAPU ||
			this.withUserController ||
			this.withUserMappers ||
			this.customPPU ||
			this.customAPU
		);

		return BrokenNEEES({
			CPUMemory: useCPUMemory ? mainModule.CPUMemory : undefined,
			Cartridge: this.withUserCartridge ? mainModule.Cartridge : undefined,
			CPU: this.withUserCPU ? mainModule.CPU : undefined,
			PPU:
				this.customPPU != null
					? this.customPPU
					: this.withUserPPU
					? PPU
					: undefined,
			APU:
				this.customAPU != null
					? this.customAPU
					: this.withUserAPU
					? APU
					: undefined,
			Controller: this.withUserController ? mainModule.Controller : undefined,
			mappers: this.withUserMappers ? mainModule.mappers : undefined,
			omitReset: this.omitReset,
			unbroken: this.unbroken,
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

	setCustomPPU(customPPU = null) {
		this.customPPU = customPPU;
		return this;
	}

	setCustomAPU(customAPU = null) {
		this.customAPU = customAPU;
		return this;
	}

	setHardware(hardware = false) {
		this.hardware = hardware;
		return this;
	}

	setUnbroken(unbroken = false) {
		this.unbroken = unbroken;
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
