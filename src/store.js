import { init } from "@rematch/core";
import createLoadingPlugin from "@rematch/loading";
import createRematchPersist from "@rematch/persist";
import storage from "redux-persist/lib/storage";
import models from "./models";

const store = init({
	models,
	plugins: [
		createLoadingPlugin({}),
		createRematchPersist({
			version: 1,
			storage,
			key: "emudevz",
			whitelist: ["savedata"],
		}),
	],
});

export default store;
