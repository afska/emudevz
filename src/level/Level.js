import _ from "lodash";
import components from "../gui/components";
import layouts from "../gui/components/layouts";
import store from "../store";
import bus from "../utils/bus";
import ChatScript from "./chat/ChatScript";

export default class Level {
	constructor(id, metadata, chatScripts, code, media) {
		_.extend(this, metadata);

		this.id = id;
		this.chatScripts = chatScripts;
		this.code = code;
		this.media = media;

		this.memory = {
			chat: {
				isOpen: false,
				sectionName: ChatScript.INITIAL_SECTION,
				history: [],
				winOnEnd: false,
				stopBlock: null,
			},
		};
		this.$layout = null;
	}

	static get current() {
		return store.getState().level.instance;
	}

	get content() {
		return store.getState().files.levels[this.id];
	}

	setMemory(change) {
		change(this.memory);
		bus.emit("level-memory-changed");
	}

	advance() {
		store.dispatch.savedata.advance(this.id);
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
