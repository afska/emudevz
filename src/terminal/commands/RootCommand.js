import filesystem, { Drive } from "../../filesystem";
import Level from "../../level/Level";
import locales from "../../locales";
import store from "../../store";
import { theme } from "../style";
import Command from "./Command";

export default class RootCommand extends Command {
	static get name() {
		return "root";
	}

	static get isHidden() {
		return true;
	}

	async execute() {
		window.ROOT_USER = true;

		if (this.isUnlock) {
			await this._unlockGames();
			return;
		}

		if (this.isUndo) {
			await this._undoLevel();
			return;
		}

		await this._terminal.writehlln(locales.get("root_enabled"), theme.WARNING);
	}

	async _unlockGames() {
		const level = Level.current;
		level.unlockLetsPlayLevelIfNeeded("lets-play-spacegulls");
		level.unlockLetsPlayLevelIfNeeded("lets-play-nalleland");
		level.unlockLetsPlayLevelIfNeeded("lets-play-jupiter-scope-2");
		level.unlockLetsPlayLevelIfNeeded("lets-play-ravens-gate");
		level.unlockLetsPlayLevelIfNeeded("lets-play-dizzy-sheep-disaster");
		level.unlockLetsPlayLevelIfNeeded("lets-play-trouble-at-2a03");
		level.unlockLetsPlayLevelIfNeeded("lets-play-super-tilt-bro");
		level.unlockLetsPlayLevelIfNeeded("lets-play-wolf-spirit");
		level.unlockLetsPlayLevelIfNeeded("lets-play-minekart-madness");
		level.unlockLetsPlayLevelIfNeeded("lets-play-tesla-vs-edison");
		level.unlockLetsPlayLevelIfNeeded("lets-play-heist");
		level.unlockLetsPlayLevelIfNeeded("lets-play-feline-flood-fiasco");
		level.unlockLetsPlayLevelIfNeeded("lets-play-falling");
		level.unlockLetsPlayLevelIfNeeded("lets-play-from-below");
		level.unlockLetsPlayLevelIfNeeded("lets-play-robo-ninja-climb");

		await this._terminal.writehlln(
			locales.get("root_games_unlocked"),
			theme.SYSTEM
		);
	}

	async _undoLevel() {
		const state = store.getState().savedata;
		const { completedLevels } = state;
		if (!completedLevels || completedLevels.length === 0) return;

		const last = completedLevels[completedLevels.length - 1];
		const levelId = last.levelId;
		const snapshotDir = Drive.snapshotDirOf(levelId);

		try {
			if (filesystem.exists(snapshotDir)) filesystem.rmrf(snapshotDir);
		} catch (e) {
			// ignore
		}

		store.dispatch.savedata.undoCompletedLevel();

		await this._terminal.writehlln(
			locales.get("root_undid_level") + `"${levelId}"`,
			theme.SYSTEM
		);
	}

	get isUnlock() {
		return this._includes("-unlockgames");
	}

	get isUndo() {
		return this._includes("-undo");
	}
}
