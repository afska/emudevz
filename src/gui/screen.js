import Level from "../level/Level";
import store from "../store";

const DEFAULT_WIDTH = 256;
const DEFAULT_HEIGHT = 240;

export function getActiveScreenSize() {
	const isFreeMode = Level.current?.isFreeMode() || false;
	if (isFreeMode) {
		const settings = store.getState().savedata.freeModeSetings;
		const width = settings?.screenWidth ?? 100;
		const height = settings?.screenHeight ?? 100;
		return { width, height };
	}

	return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
}
