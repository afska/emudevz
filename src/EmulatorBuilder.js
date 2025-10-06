import BrokenNEEES from "broken-neees";
import Level from "./level/Level";
import testContext from "./terminal/commands/test/context";

export default class EmulatorBuilder {
	withUserCartridge = false;
	withUserCPU = false;
	withUserPPU = false;
	withUserAPU = false;
	withUserController = false;
	withUsePartialPPU = false;
	withUsePartialAPU = false;
	customPPU = null;
	customAPU = null;
	omitReset = false;
	unbroken = false;
	hardware = false;
	withCustomEmulator = false;

	async build(withLastCode = false) {
		if (this.withCustomEmulator) {
			const mainModule = await this._evaluate(true);
			return this._getComponent(mainModule, "Emulator");
		}

		let mainModule = null;
		let CPUMemory = undefined;
		let Cartridge = undefined;
		let Controller = undefined;
		let CPU = undefined;
		let PPU = undefined;
		let APU = undefined;

		let useCPUMemory = !!(
			this.withUserCPU ||
			this.withUserPPU ||
			this.withUserAPU ||
			this.withUserController ||
			this.customPPU ||
			this.customAPU
		);
		// when using user's PPU and APU at the same time, and one of them is only partially
		// completed, there can be crashes due to `CPUMemory` expecting certain properties to exist
		// => in this special case, we fallback to the default bus
		const needsDefaultCPUMemory =
			this.withUserPPU &&
			this.withUserAPU &&
			(this.withUsePartialPPU || this.withUsePartialAPU);
		if (needsDefaultCPUMemory) useCPUMemory = false;

		if (!this.hardware) {
			mainModule = await this._evaluate(withLastCode);
			if (useCPUMemory) {
				CPUMemory = this._getComponent(mainModule, "CPUMemory");
			}
			if (this.withUserCartridge)
				Cartridge = this._getComponent(mainModule, "Cartridge");
			if (this.withUserController) {
				Controller = this._getComponent(mainModule, "Controller");
			}
			if (this.withUserCPU) {
				CPU = this._getComponent(mainModule, "CPU");
			}
			if (this.withUserPPU) {
				PPU = this._getComponent(mainModule, "PPU");
			}
			if (this.withUserAPU) {
				APU = this._getComponent(mainModule, "APU");
			}

			if (withLastCode && this.withUserPPU && this.withUsePartialPPU) {
				const partialModule = await this._evaluate(false);
				if (this.withUserCartridge)
					Cartridge = this._getComponent(partialModule, "Cartridge");
				if (this.withUserController)
					Controller = this._getComponent(partialModule, "Controller");
				if (this.withUserCPU) CPU = this._getComponent(partialModule, "CPU");
				if (useCPUMemory)
					CPUMemory = this._getComponent(partialModule, "CPUMemory");
				PPU = this._getComponent(partialModule, "PPU");
			}
			if (withLastCode && this.withUserAPU && this.withUsePartialAPU) {
				const partialModule = await this._evaluate(false);
				if (this.withUserCartridge)
					Cartridge = this._getComponent(partialModule, "Cartridge");
				if (this.withUserController)
					Controller = this._getComponent(partialModule, "Controller");
				if (this.withUserCPU) CPU = this._getComponent(partialModule, "CPU");
				if (useCPUMemory)
					CPUMemory = this._getComponent(partialModule, "CPUMemory");
				APU = this._getComponent(partialModule, "APU");
			}
		}

		return BrokenNEEES({
			CPUMemory,
			Cartridge,
			CPU,
			PPU: this.customPPU != null ? this.customPPU : PPU,
			APU: this.customAPU != null ? this.customAPU : APU,
			Controller,
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

	useCustomEmulator(use = true) {
		this.withCustomEmulator = use;
		return this;
	}

	async _evaluate(withLastCode) {
		const javascript = testContext.javascript;
		let mainModule;
		const $ = javascript.prepare(Level.current, withLastCode);
		mainModule = (await $.evaluate()).default;

		return mainModule;
	}

	_getComponent(evaluatedModule, componentName) {
		const component = evaluatedModule[componentName];
		if (component == null) throw new Error(`\`${componentName}\` not found`);
		return component;
	}
}
