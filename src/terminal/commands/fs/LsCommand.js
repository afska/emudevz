import _ from "lodash";
import filesystem from "../../../filesystem";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

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

		this._terminal.writeln(
			sortedContent
				.map(({ name, isDirectory }) => {
					const style = isDirectory ? theme.MESSAGE : theme.NORMAL;
					const suffix = isDirectory ? "/" : "";
					return style(name) + suffix;
				})
				.join("\n")
		);
	}
}
