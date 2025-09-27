import $path from "path-browserify-esm";
import Level from "../level/Level";
import store from "../store";

export function getActiveRomExtensions() {
	const isFreeMode = Level.current?.isFreeMode() || false;
	if (isFreeMode) {
		const configured =
			store.getState().savedata.freeModeSetings?.romExtension || ".gb";
		const ext = configured.toLowerCase();
		return [ext.startsWith(".") ? ext : "." + ext];
	}

	return [".neees", ".nes"];
}

export function isRomFileForCurrentMode(filePath) {
	const extension = $path.parse(filePath).ext.toLowerCase();
	return getActiveRomExtensions().includes(extension);
}

export function getFilePickerFilter() {
	return getActiveRomExtensions().join(",");
}
