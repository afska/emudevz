export default {
	has: false,

	async check() {
		if (window.EmuDevz.isDesktop() && window.steam != null) {
			try {
				const result = await window.steam.isDlcInstalled();
				if (result.ok && result.installed) this.has = true;
				return;
			} catch (err) {}
		}

		return;
	},

	installed() {
		this.check();
		return this.has;
	},
};
