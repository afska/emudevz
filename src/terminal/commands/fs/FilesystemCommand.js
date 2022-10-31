import $path from "path";
import filesystem, { Drive } from "../../../filesystem";
import { theme } from "../../style";
import Command from "../Command";

const ERROR_PREFIX = /^Error: /;

export default class FilesystemCommand extends Command {
	static get isHelpCollapsed() {
		return true;
	}

	async execute() {
		try {
			await this._execute();
		} catch (e) {
			const message = e?.message || e?.toString() || "?";
			this._terminal.writeln(
				"❌  " + theme.ERROR(message.replace(ERROR_PREFIX, ""))
			);
		}
	}

	async _execute() {
		throw new Error("not_implemented");
	}

	_resolve(path, isWrite = false) {
		if (path == null) throw new Error("A path is required");

		const absolutePath = filesystem.resolve(path, this._shell.workingDirectory);
		const parsedPath = $path.parse(absolutePath);

		if (Drive.INVALID_CHARACTERS.test(parsedPath.base))
			throw new Error(`Invalid name: '${parsedPath.base}'`);

		if (parsedPath.base.length > Drive.MAX_FILE_NAME_LENGTH)
			throw new Error(`Name too long: '${parsedPath.base}'`);

		const isMainFile = absolutePath === Drive.MAIN_FILE;
		const isReadOnlyDir = Drive.READONLY_PATHS.some(
			(it) => parsedPath.dir === it
		);
		if (isWrite && (isMainFile || isReadOnlyDir))
			throw new Error(`EPERM: operation not permitted., '${absolutePath}'`);

		return absolutePath;
	}
}
