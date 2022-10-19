import _ from "lodash";
import filesystem from "../../../filesystem";
import locales from "../../../locales";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

const SPACING = 10;

export default class LsCommand extends FilesystemCommand {
	static get name() {
		return "ls";
	}

	async _execute() {
		const path = this._resolve(this._args[0] || "");
		const content = filesystem.ls(path);
		const sortedContent = _.orderBy(
			content,
			["isDirectory", "name"],
			["desc", "asc"]
		);
		const maxNameLength =
			_.maxBy(sortedContent, (it) => it.name.length)?.name.length ?? 0;
		const maxSizeLenght =
			_.maxBy(sortedContent, (it) => it.size.toString().length)?.size.toString()
				.length ?? 0;

		this._terminal.writeln(
			sortedContent
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
}
