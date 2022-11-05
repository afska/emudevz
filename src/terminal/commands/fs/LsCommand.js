import _ from "lodash";
import filesystem from "../../../filesystem";
import locales from "../../../locales";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

const SPACING = 10;
const INDENT = 2;

export default class LsCommand extends FilesystemCommand {
	static get name() {
		return "ls";
	}

	async _execute() {
		const path = this._resolve(this._fileArgs[0] || "");

		if (this._isRecursive) await this._listRecursive(path);
		else await this._listFlat(path);
	}

	async _listFlat(path) {
		const content = filesystem.ls(path);
		const maxNameLength =
			_.maxBy(content, (it) => it.name.length)?.name.length ?? 0;
		const maxSizeLenght =
			_.maxBy(content, (it) => it.size.toString().length)?.size.toString()
				.length ?? 0;

		await this._terminal.writeln(
			content
				.map(({ name, isDirectory, size }) => {
					const style = isDirectory ? theme.MESSAGE : theme.NORMAL;

					return isDirectory
						? style(name) + "/"
						: style(name.padEnd(maxNameLength + SPACING)) +
								theme.ACCENT(
									size.toString().padStart(maxSizeLenght) +
										" " +
										locales.get("bytes")
								);
				})
				.join("\n")
		);
	}

	async _listRecursive(path) {
		await this._terminal.writeln(await this._getTree(path));
	}

	_getTree(path, indent = "") {
		const content = filesystem.ls(path);

		return content
			.flatMap(({ name, isDirectory }, i) => {
				const style = isDirectory ? theme.MESSAGE : theme.NORMAL;
				const isLastItem = i === content.length - 1;
				const indentSymbol = isLastItem ? " " : "│";
				const newIndent = indent + indentSymbol + _.repeat(" ", INDENT + 1);
				const innerContent = isDirectory
					? this._getTree(`${path}/${name}`, newIndent)
					: "";

				// (main)
				const mainSymbol = isLastItem ? "└" : "├";
				let entry =
					indent +
					mainSymbol +
					_.repeat("─", INDENT) +
					" " +
					(isDirectory ? style(name) + "/" : style(name));

				// (inner)
				if (innerContent !== "") entry += "\n" + innerContent;

				return entry;
			})
			.join("\n");
	}

	get _isRecursive() {
		return this._includes("-r");
	}
}
