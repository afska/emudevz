import _ from "lodash";
import filesystem, { Drive } from "../filesystem";
import components from "../gui/components";
import TV from "../gui/components/TV";
import layouts from "../gui/components/layouts";
import locales from "../locales";
import store from "../store";
import { theme } from "../terminal/style";
import { analytics, toast } from "../utils";
import bus from "../utils/bus";
import Book from "./Book";
import ChatScript from "./chat/ChatScript";

const NEWLINE_REGEXP = /\n|\r\n|\r/;

export default class Level {
	constructor(id, metadata, chatScripts, { code, tests, media, bin }) {
		_.extend(this, metadata);

		this.id = id;
		this.chatScripts = chatScripts;
		this.code = code;
		this.tests = tests;
		this.media = media;
		this.bin = bin;

		this.memory = _.merge(
			{
				chat: {
					isOpen: false,
					sectionName: ChatScript.INITIAL_SECTION,
					history: [],
					winOnEnd: false,
					stopBlock: null,
				},
				content: {
					multifile: false,
					useTemp: false,
					protected: false,
					temp: "",
				},
			},
			this.memory
		);
		this.$layout = null;
	}

	static get current() {
		return store.getState().level.instance;
	}

	get content() {
		if (this.memory.content.multifile) return { main: Drive.MAIN_FILE };

		return this.memory.content.useTemp ? this.tempContent : this.storedContent;
	}

	set content(value) {
		if (this.memory.content.useTemp)
			this.setMemory((memory) => {
				memory.content.temp = value;
			});
		else store.dispatch.content.setCurrentLevelContent(value);
	}

	get hasStoredContent() {
		return !_.isEmpty(this.storedContent);
	}

	get storedContent() {
		return store.getState().content.levels[this.id] || "";
	}

	get tempContent() {
		return this.memory.content.temp;
	}

	get localizedHelp() {
		const book = Book.current;
		const chapter = book.getChapterOf(this.id);

		const help = chapter.help[locales.language];
		if (!help) return null;

		const levelDefinition = book.getLevelDefinitionOf(this.id);
		const lines = help.split(NEWLINE_REGEXP);

		return lines
			.map((it, i) =>
				this.help?.addLines?.includes(i + 1) ? theme.BG_NEW(it) : it
			)
			.filter((__, i) => levelDefinition.helpLines.includes(i + 1))
			.join("\n");
	}

	get isCompleted() {
		const book = Book.current;
		return book.isFinished(this.id);
	}

	fillContentFromTemp() {
		if (!this.hasStoredContent)
			store.dispatch.content.setCurrentLevelContent(this.tempContent);
	}

	setMemory(change) {
		change(this.memory);
		bus.emit("level-memory-changed");
	}

	advance() {
		this._saveSnapshotIfNeeded();
		this.unlockLetsPlayLevelIfNeeded(this.letsPlayUnlock);
		analytics.track("level_completed", {
			id: this.id,
			name: this.name.en,
		});

		if (!store.dispatch.savedata.advance(this.id))
			store.dispatch.level.goHome();
	}

	launchEmulator(rom = null) {
		if (!bus.isListeningTo("pin")) {
			const tvRom = this.$layout.findInstance(
				TV,
				(it) => it.state.type === "rom"
			);
			if (tvRom != null) tvRom.setContent(rom, "rom");
		}

		bus.emit("pin", {
			Component: TV,
			args: { content: rom, type: "rom" },
			level: this,
		});
	}

	launchStream(rom = null) {
		bus.emit("pin", {
			Component: TV,
			args: { content: rom, type: "stream" },
			level: this,
		});
	}

	startEffect(effectName) {
		document.querySelector("body").className = effectName;
	}

	stopEffect() {
		document.querySelector("body").className = "";
	}

	init() {
		this.validate();

		const { isUsingSnapshot } = Drive.init(this.id);
		store.dispatch.savedata.closeNonExistingFiles();
		this.isUsingSnapshot = isUsingSnapshot;
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

	unlockLetsPlayLevelIfNeeded(letsPlayLevelId) {
		if (letsPlayLevelId == null) return;

		const book = Book.current;
		if (!book.isUnlocked(letsPlayLevelId)) {
			store.dispatch.savedata.unlockLetsPlayLevel(letsPlayLevelId);

			toast.normal(
				<span
					onClick={() => {
						store.dispatch.level.goTo(letsPlayLevelId);
					}}
				>
					👾{" "}
					<span className="toast-link">
						{locales.get("letsplay_unlock_msg1")}{" "}
						<strong>{locales.get("letsplay_unlock_msg2")}</strong>{" "}
						{locales.get("letsplay_unlock_msg3")}
					</span>
				</span>,
				{
					duration: 10000,
				}
			);
		}
	}

	_saveSnapshotIfNeeded() {
		if (!this.memory.content.multifile) return;

		const snapshotDir = Drive.snapshotDirOf(this.id);

		if (!filesystem.exists(snapshotDir))
			filesystem.cpr(Drive.CODE_DIR, snapshotDir);
	}
}
