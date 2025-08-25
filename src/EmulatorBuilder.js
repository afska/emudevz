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
		let CPUMemory = null;
		let PPU = null;
		let APU = null;

		let useCPUMemory = !!(
			this.withUserCPU ||
			this.withUserPPU ||
			this.withUserAPU ||
			this.withUserController ||
			this.withUserMappers ||
			this.customPPU ||
			this.customAPU
		);

		if (!this.hardware) {
			mainModule = await this._evaluate(withLastCode);
			CPUMemory = mainModule.CPUMemory;
			PPU = mainModule.PPU;
			APU = mainModule.APU;

			// when using user's PPU and APU at the same time, and one of them is only partially
			// completed, there can be crashes due to `CPUMemory` expecting certain properties to exist
			// => in this special case, we fallback to the default bus
			const needsDefaultCPUMemory =
				this.withUserPPU &&
				this.withUserAPU &&
				(this.withUsePartialPPU || this.withUsePartialAPU);
			if (needsDefaultCPUMemory) useCPUMemory = false;

			if (withLastCode && this.withUserPPU && this.withUsePartialPPU) {
				const partialModule = await this._evaluate(false);
				CPUMemory = partialModule.CPUMemory;
				PPU = partialModule.PPU;
			}
			if (withLastCode && this.withUserAPU && this.withUsePartialAPU) {
				const partialModule = await this._evaluate(false);
				CPUMemory = partialModule.CPUMemory;
				APU = partialModule.APU;
			}
		}

		return BrokenNEEES({
			CPUMemory: useCPUMemory ? CPUMemory : undefined,
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
