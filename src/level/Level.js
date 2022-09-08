import ChatScript from "./chat/ChatScript";
import layouts from "../gui/components/layouts";
import components from "../gui/components";
import store from "../store";
import _ from "lodash";

export default class Level {
	constructor(metadata, chatScripts) {
		_.extend(this, metadata);

		this.chatScripts = chatScripts;
		this.memory = {
			chat: {
				sectionName: ChatScript.INITIAL_SECTION,
				history: [],
			},
		};
	}

	static get current() {
		return store.getState().level.instance;
	}

	validate() {
		if (this.ui == null) throw new Error("Missing `ui` key");

		if (this.ui.layout == null) throw new Error("Missing `ui.layout` key");
		if (this.ui.components == null)
			throw new Error("Missing `ui.components` key");
		if (this.ui.focus == null) throw new Error("Missing `ui.focus` key");

		const layout = layouts[this.ui.layout];
		if (!layout) throw new Error(`Missing layout: ${this.ui.layout}`);

		layout.requiredComponentNames.forEach((requiredComponentName) => {
			const componentDefinition = this.ui.components[requiredComponentName];

			if (componentDefinition == null)
				throw new Error(
					`Missing component definition: ${requiredComponentName}`
				);

			if (
				!Array.isArray(componentDefinition) ||
				componentDefinition.length !== 2
			)
				throw new Error(
					`Component ${requiredComponentName} must be an array of two elements ([name, args])`
				);

			const [componentName, args] = componentDefinition;
			const component = components[componentName];
			if (!component) throw new Error(`Missing component: ${componentName}`);
			if (!args)
				throw new Error(`Missing args for component: ${componentName}`);
		});

		if (!layout.requiredComponentNames.includes(this.ui.focus))
			throw new Error(`Invalid focus: ${this.ui.focus}`);
	}
}
