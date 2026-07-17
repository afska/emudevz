const {
	app,
	BrowserWindow,
	screen,
	shell,
	ipcMain,
	protocol,
	net,
} = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const steam = require("./steam");
const fs = require("node:fs");
const fsp = require("node:fs/promises");

const isDev = !app.isPackaged;
const isWindows = process.platform === "win32";
const isMacOS = process.platform === "darwin";
const WINDOW_WIDTH = 1280;
const WINDOW_HEIGHT = 800;

app.setName("EmuDevz");

// Match electron-builder appId for correct icon association
if (process.platform === "win32") {
	app.setAppUserModelId("io.r-labs.emudevz");
}

// Enable Steam integrations
steam.registerIpc(ipcMain);
steam.enableOverlay();

// Set up custom app:// protocol
protocol.registerSchemesAsPrivileged([
	{
		scheme: "app",
		privileges: {
			standard: true,
			secure: true,
			corsEnabled: true,
			supportFetchAPI: true,
			stream: true,
			allowServiceWorkers: true,
		},
	},
]);

function createWindow() {
	const iconBase = isDev
		? path.join(__dirname, "..", "public", "icons")
		: path.join(app.getAppPath(), "build", "icons");
	const iconPath = path.join(iconBase, "icon-512x512.png");
	const windowBounds = getPrimaryDisplayWindowBounds();

	// Main window
	const win = new BrowserWindow({
		title: "EmuDevz",
		...windowBounds,
		fullscreen: !isWindows,
		resizable: true,
		autoHideMenuBar: true,
		icon: iconPath,
		backgroundColor: "#000000",
		show: !isWindows,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			spellcheck: false,
		},
	});

	// Disable native menu bar (Alt)
	if (!isDev) win.setMenu(null);

	// Dev: open dev server URL | Prod: serve via app:// protocol
	if (isDev) {
		const devUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:3000";
		win.loadURL(devUrl);
	} else {
		win.loadURL("app://-/index.html");
	}

	const isExternalHttpUrl = (url) => {
		try {
			const nextUrl = new URL(url);
			if (!/^https?:$/.test(nextUrl.protocol)) return false;

			const currentUrl = win.webContents.getURL();
			if (!currentUrl) return true;

			return nextUrl.origin !== new URL(currentUrl).origin;
		} catch {
			return false;
		}
	};

	// Keyboard zoom shortcuts on Windows/Linux:
	// - Ctrl++ or Ctrl+NumpadAdd: Zoom in
	// - Ctrl-- or Ctrl+NumpadSubtract: Zoom out
	// - Ctrl+0: Reset zoom
	win.webContents.on("before-input-event", (event, input) => {
		if (input.type === "keyDown" && input.alt && input.code === "F4") {
			// (force-close on Alt+F4 even if the renderer captures keys)
			event.preventDefault();
			win.close();
			return;
		}

		// Disable back/forward navigation
		if (
			input.type === "keyDown" &&
			(input.key === "BrowserBack" || input.key === "BrowserForward")
		) {
			event.preventDefault();
			return;
		}
		if (
			input.type === "mouseDown" &&
			(input.key === "BrowserBack" || input.key === "BrowserForward")
		) {
			event.preventDefault();
			return;
		}

		if (input.type !== "keyDown") return;

		// Fullscreen toggle
		// Windows/Linux: F11
		// macOS: Ctrl+Cmd+F
		if (
			(!isMacOS && input.code === "F11") ||
			(isMacOS && input.control && input.meta && input.code === "KeyF")
		) {
			// HACK: W11 has a bug where fullscreen electron apps that use the Steam overlay create ghost alt-tab entries
			if (!isWindows) win.setFullScreen(!win.isFullScreen());
			event.preventDefault();
			return;
		}

		const ctrlOrCmd = input.control || input.meta;
		if (!ctrlOrCmd) return;

		const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
		const step = 0.1;

		// Zoom in
		if (
			!input.alt &&
			(input.code === "NumpadAdd" ||
				input.key === "+" ||
				input.key === "=" ||
				input.code === "Digit3" ||
				input.code === "Numpad3")
		) {
			const current = win.webContents.getZoomFactor();
			win.webContents.setZoomFactor(clamp(current + step, 0.5, 3));
			event.preventDefault();
			return;
		}
		// Zoom out
		if (
			!input.alt &&
			(input.code === "NumpadSubtract" ||
				input.key === "-" ||
				input.key === "_" ||
				input.code === "Digit1" ||
				input.code === "Numpad1")
		) {
			const current = win.webContents.getZoomFactor();
			win.webContents.setZoomFactor(clamp(current - step, 0.5, 3));
			event.preventDefault();
			return;
		}
		// Reset zoom
		if (
			!input.alt &&
			(input.key === "0" || input.code === "Digit0" || input.code === "Numpad0")
		) {
			win.webContents.setZoomFactor(1);
			event.preventDefault();
			return;
		}
	});

	// Open external links in the default browser
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (isExternalHttpUrl(url)) {
			shell.openExternal(url);
			return { action: "deny" };
		}
		return { action: "allow" };
	});

	win.webContents.on("will-navigate", (event, url) => {
		if (!isExternalHttpUrl(url)) return;

		event.preventDefault();
		shell.openExternal(url);
	});

	return win;
}

app.whenReady().then(() => {
	// Map app:// protocol to files inside app.asar/build
	if (!isDev) {
		const buildDir = path.join(app.getAppPath(), "build");

		protocol.handle("app", async (request) => {
			const urlObj = new URL(request.url);
			let pathname = urlObj.pathname || "/";
			if (pathname === "/") pathname = "/index.html";

			const decoded = decodeURIComponent(pathname);
			const abs = path.resolve(buildDir, "." + decoded);
			const rel = path.relative(buildDir, abs);
			const safe = rel && !rel.startsWith("..") && !path.isAbsolute(rel);

			const filePath = safe ? abs : path.join(buildDir, "index.html");

			// Music files need Range support
			if (pathname.startsWith("/music/") && pathname.endsWith(".mp3")) {
				const range = request.headers.get("range");
				if (range) {
					const size = (await fsp.stat(filePath)).size;

					const match = range.match(/^bytes=(\d+)-(\d*)$/i);
					if (!match)
						return new Response(null, {
							status: 416,
							headers: { "Content-Range": `bytes */${size}` },
						});

					const start = Number(match[1]);
					const end = match[2]
						? Math.min(Number(match[2]), size - 1)
						: size - 1;

					if (
						!Number.isFinite(start) ||
						!Number.isFinite(end) ||
						start < 0 ||
						end < start ||
						start >= size
					)
						return new Response(null, {
							status: 416,
							headers: { "Content-Range": `bytes */${size}` },
						});

					return new Response(fs.createReadStream(filePath, { start, end }), {
						status: 206,
						headers: {
							"Content-Type": "audio/mpeg",
							"Accept-Ranges": "bytes",
							"Content-Range": `bytes ${start}-${end}/${size}`,
							"Content-Length": String(end - start + 1),
						},
					});
				}
			}

			return net.fetch(pathToFileURL(filePath).toString());
		});
	}

	const win = createWindow();
	if (isWindows) {
		win.maximize();
		win.show();
	}
});

// Open window on start
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
	app.quit();
});

// DevTools button
ipcMain.handle("open-devtools", () => {
	const win = BrowserWindow.getFocusedWindow();
	if (win) win.webContents.openDevTools({ mode: "detach" });
});

function getPrimaryDisplayWindowBounds() {
	const { workArea } = screen.getPrimaryDisplay();

	return {
		x:
			workArea.x + Math.max(0, Math.round((workArea.width - WINDOW_WIDTH) / 2)),
		y:
			workArea.y +
			Math.max(0, Math.round((workArea.height - WINDOW_HEIGHT) / 2)),
		width: WINDOW_WIDTH,
		height: WINDOW_HEIGHT,
	};
}
