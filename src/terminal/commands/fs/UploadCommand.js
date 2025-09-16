import $path from "path-browserify-esm";
import filesystem from "../../../filesystem";
import extensions from "../../../gui/extensions";
import locales from "../../../locales";
import { filepicker } from "../../../utils";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

export default class UploadCommand extends FilesystemCommand {
	static get name() {
		return "upload";
	}

	async _execute() {
		await new Promise((resolve, reject) => {
			filepicker.open(
				null,
				async (fileContent, fileName) => {
					try {
						if (!fileName) return;

						const [__, customArgs] = extensions.getOptions(fileName);

						const path = `${this._shell.workingDirectory}/${fileName}`;
						const processedPath = this._resolve(path, true);
						const parsedPath = $path.parse(processedPath);
						await this._terminal.writeln(
							`${locales.get("creating_file")} ${theme.ACCENT(
								parsedPath.base
							)}...`
						);
						filesystem.write(processedPath, fileContent, {
							binary: customArgs.binary,
						});
						resolve();
					} catch (e) {
						reject(e);
					}
				},
				resolve
			);
		});
	}
}
