const PLUMBER_HASHES = [
	"ea343f4e445a9050d4b4fbac2c77d0693b1d0922", // 1
	"a03e7e526e79df222e048ae22214bca2bc49c449", // 3
];

export default {
	unlockRomBasedAchievementIfNeeded(bytes) {
		if (!window.crypto?.subtle) return;

		window.crypto.subtle
			.digest("SHA-1", bytes)
			.then((hashBuffer) => {
				const hashArray = Array.from(new Uint8Array(hashBuffer));
				const hashHex = hashArray
					.map((b) => b.toString(16).padStart(2, "0"))
					.join("");

				if (PLUMBER_HASHES.includes(hashHex)) {
					this.unlock("misc-plumber");
				}
			})
			.catch((err) => {
				console.error("Error computing ROM hash", err);
			});
	},

	unlockErrorBasedAchievementIfNeeded(error, settings) {
		if (error?.message?.includes("This looks bad!")) {
			this.unlock("misc-hang");
			return;
		}

		if (error?.message?.includes("Invalid opcode")) {
			const { useHardware, useCPU } = settings;
			if (!useHardware && !useCPU) this.unlock("misc-cpu-bugs");
			return;
		}
	},

	unlock(achievementId) {
		if (window.EmuDevz.isDesktop() && window.steam != null) {
			window.steam.unlockAchievement(achievementId);
		} else {
			console.info("Imaginary achievement unlocked: ", achievementId);
		}
	},
};
