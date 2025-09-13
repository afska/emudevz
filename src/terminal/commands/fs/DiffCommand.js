import _ from "lodash";
import filesystem, { Drive } from "../../../filesystem";
import Level from "../../../level/Level";
import store from "../../../store";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

const NEWLINE_REGEXP = /\r\n?|\n/g;
const HUNKS_CONTEXT = 3;

export default class DiffCommand extends FilesystemCommand {
	static get name() {
		return "diff";
	}

	async _execute() {
		const state = store.getState().savedata;
		const { completedLevels } = state;
		if (!completedLevels || completedLevels.length === 0) return;

		const currentLevelId = Level.current.id;
		const index = _.findLastIndex(
			completedLevels,
			(it) => it.levelId === currentLevelId
		);
		if (index <= 0) return;
		const previousLevelId = completedLevels[index - 1].levelId;
		const previousSnapshotDir = Drive.snapshotDirOf(previousLevelId);

		try {
			if (!filesystem.exists(previousSnapshotDir)) return;
		} catch (e) {
			return;
		}

		const currentFiles = this._readFilesRecursively(Drive.CODE_DIR);
		const previousFiles = this._readFilesRecursively(previousSnapshotDir);

		const allPaths = _.sortBy(
			_.uniq([...Object.keys(currentFiles), ...Object.keys(previousFiles)])
		);

		for (let relPath of allPaths) {
			const oldContent = previousFiles[relPath] ?? "";
			const newContent = currentFiles[relPath] ?? "";
			if (oldContent === newContent) continue;

			await this._terminal.writeln(
				`--- ${Drive.SNAPSHOTS_DIR}/level-${previousLevelId}/${relPath}`,
				theme.SYSTEM
			);
			await this._terminal.writeln(
				`+++ ${Drive.CODE_DIR}/${relPath}`,
				theme.SYSTEM
			);

			const ops = this._diffLines(
				oldContent.split(NEWLINE_REGEXP),
				newContent.split(NEWLINE_REGEXP)
			);

			const hunks = this._toHunks(ops, HUNKS_CONTEXT);
			for (let h = 0; h < hunks.length; h++) {
				if (h > 0) await this._terminal.writeln("---", theme.ACCENT);
				for (let i = 0; i < hunks[h].length; i++) {
					const { type, text } = hunks[h][i];
					if (type === "added")
						await this._terminal.writeln("+ " + text, theme.DIFF_ADDED);
					else if (type === "removed")
						await this._terminal.writeln("- " + text, theme.DIFF_REMOVED);
					else await this._terminal.writeln("  " + text, theme.NORMAL);
				}
			}
		}
	}

	_readFilesRecursively(rootDir) {
		let map = {};

		try {
			const files = filesystem.lsr(rootDir);
			for (let file of files) {
				if (file.isDirectory) continue;

				const rel = file.filePath.replace(rootDir + "/", "");
				map[rel] = filesystem.read(file.filePath);
			}
		} catch (e) {}

		return map;
	}

	_toHunks(ops, context) {
		let blocks = [];
		let block = null;
		let lastEquals = [];
		let pending = 0;

		for (let op of ops) {
			if (op.type !== "equal") {
				if (block == null) block = [...lastEquals];
				block.push(op);
				pending = context;
				lastEquals = [];
			} else if (block == null) {
				lastEquals.push(op);
				if (lastEquals.length > context) lastEquals.shift();
			} else {
				block.push(op);
				if (pending > 0) pending--;
				if (pending === 0) {
					blocks.push(block);
					block = null;
					lastEquals = [];
				}
			}
		}

		if (block != null) blocks.push(block);
		return blocks;
	}

	_diffLines(oldLines, newLines) {
		const n = oldLines.length;
		const m = newLines.length;
		const dp = Array(n + 1)
			.fill(0)
			.map(() => Array(m + 1).fill(0));

		for (let i = n - 1; i >= 0; i--)
			for (let j = m - 1; j >= 0; j--)
				dp[i][j] =
					oldLines[i] === newLines[j]
						? 1 + dp[i + 1][j + 1]
						: dp[i + 1][j] >= dp[i][j + 1]
						? dp[i + 1][j]
						: dp[i][j + 1];

		let i = 0;
		let j = 0;
		const out = [];
		while (i < n && j < m) {
			if (oldLines[i] === newLines[j]) {
				out.push({ type: "equal", text: newLines[j] });
				i++;
				j++;
				continue;
			}
			if (dp[i + 1][j] >= dp[i][j + 1]) {
				out.push({ type: "removed", text: oldLines[i] });
				i++;
			} else {
				out.push({ type: "added", text: newLines[j] });
				j++;
			}
		}

		while (i < n) out.push({ type: "removed", text: oldLines[i++] });
		while (j < m) out.push({ type: "added", text: newLines[j++] });

		return out;
	}
}
