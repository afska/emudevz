const steamworks = require("steamworks.js");

const APP_ID = 4260720;
const DLC_APP_ID = 4283970;

let _client = null;

function init() {
	if (_client) return _client;

	try {
		_client = steamworks.init(APP_ID);
		return _client;
	} catch (err) {
		_client = null;
		return null;
	}
}

function enableOverlay() {
	try {
		steamworks.electronEnableSteamOverlay();
	} catch (err) {
		console.warn(err, "⚠️ Failed to enable Steam overlay");
	}
}

function registerIpc(ipcMain) {
	init();

	ipcMain.handle("steam:unlock-achievement", (_event, achievementId) => {
		const client = _client ?? init();
		if (!client) {
			console.warn(
				"⚠️ Cannot unlock achievement: ",
				achievementId,
				" -> ",
				"client not initialized"
			);
			return { ok: false };
		}

		try {
			const ok = client.achievement.activate(achievementId);
			return { ok };
		} catch (err) {
			const reason = err?.message || err?.toString() || "?";
			console.warn(
				"⚠️ Cannot unlock achievement: ",
				achievementId,
				" -> ",
				reason
			);
			return { ok: false, error: reason };
		}
	});

	ipcMain.handle("steam:is-dlc-installed", () => {
		const client = _client ?? init();
		if (!client) {
			console.warn("⚠️ Cannot check DLC status: client not initialized");
			return { ok: false, installed: false };
		}

		try {
			const installed = client.apps.isDlcInstalled(DLC_APP_ID);
			return { ok: true, installed };
		} catch (err) {
			const reason = err?.message || err?.toString() || "?";
			console.warn("⚠️ Cannot check DLC status: ", reason);
			return { ok: false, installed: false, error: reason };
		}
	});

	ipcMain.handle("steam:open-dlc-store", () => {
		const client = _client ?? init();
		if (!client) {
			console.warn("⚠️ Cannot open DLC store: client not initialized");
			return { ok: false };
		}

		try {
			// StoreFlag.None = 0
			// StoreFlag.AddToCart = 1
			// StoreFlag.AddToCartAndShow = 2
			client.overlay.activateToStore(DLC_APP_ID, 1);
			return { ok: true };
		} catch (err) {
			const reason = err?.message || err?.toString() || "?";
			console.warn("⚠️ Cannot open DLC store: ", reason);
			return { ok: false, error: reason };
		}
	});
}

module.exports = {
	init,
	enableOverlay,
	registerIpc,
};
