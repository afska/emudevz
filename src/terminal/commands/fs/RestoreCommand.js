import $path from "path-browserify-esm";
import _ from "lodash";
import filesystem, { Drive } from "../../../filesystem";
import Level from "../../../level/Level";
import locales from "../../../locales";
import store from "../../../store";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

export default class RestoreCommand extends FilesystemCommand {
	static get name() {
		return "restore";
	}

	async _execute() {
		const completedLevels = store.getState().savedata.completedLevels;
		if (completedLevels.length === 0) return await this._notAvailable();

		const currentLevelId = Level.current.id;
		let index = _.findLastIndex(
			completedLevels,
			(it) => it.levelId === currentLevelId
		);
		if (index <= 0) index = completedLevels.length; // (not completed level)

		const previousLevelId = completedLevels[index - 1].levelId;
		const previousSnapshotDir = Drive.snapshotDirOf(previousLevelId);

		if (!filesystem.exists(previousSnapshotDir))
			return await this._notAvailable();

		const restoreTargets = this._fileArgs
			.map((it) => filesystem.resolve(it, this._shell.workingDirectory))
			.filter((it) => it.startsWith(Drive.CODE_DIR));
		if (restoreTargets.length === 0) {
			await this._restoreAllFiles(previousSnapshotDir);
			return;
		}

		await this._restoreSelectedFiles(previousSnapshotDir, restoreTargets);
	}

	async _restoreAllFiles(snapshotDirectory) {
		if (!(await this._confirm(true))) return;

		// ensure we can write to /code/*
		this._resolve(`${Drive.CODE_DIR}/_`, true);

		filesystem.rmrf(Drive.CODE_DIR);
		filesystem.cpr(snapshotDirectory, Drive.CODE_DIR);
	}

	async _restoreSelectedFiles(snapshotDirectory, restoreTargets) {
		if (!(await this._confirm(false, restoreTargets))) return;

		// ensure we can write to /code/*
		this._resolve(`${Drive.CODE_DIR}/_`, true);

		for (let inputArgument of restoreTargets) {
			const destinationPath = this._resolve(inputArgument, true);
			const relativePath = $path.relative(Drive.CODE_DIR, destinationPath);
			const sourcePath = `${snapshotDirectory}/${relativePath}`;

			if (filesystem.exists(sourcePath)) {
				filesystem.rmrff(destinationPath);
				filesystem.mkdirp($path.parse(destinationPath).dir);
				filesystem.cpr(sourcePath, destinationPath);
			} else {
				filesystem.rmrff(destinationPath);
			}
		}
	}

	async _confirm(isAll, items = []) {
		if (isAll) {
			await this._terminal.writehlln(locales.get("restore_warning_all"));
		} else {
			await this._terminal.writehlln(locales.get("restore_warning_paths"));
			await this._terminal.writeln(
				items.map((it) => theme.MESSAGE(it)).join("\n")
			);
		}
		const key = await this._terminal.waitForKey();
		return key.toLowerCase() === "y";
	}
}
