import { init } from "@rematch/core";
import createLoadingPlugin from "@rematch/loading";
import createRematchPersist from "@rematch/persist";
import storage from "redux-persist/lib/storage";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { createHashHistory } from "history";
import models from "./models";

export const history = createHashHistory();
const reducers = { router: connectRouter(history) };

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
	redux: {
		reducers,
		middlewares: [routerMiddleware(history)],
		devtoolOptions: {},
	},
});

export default store;
