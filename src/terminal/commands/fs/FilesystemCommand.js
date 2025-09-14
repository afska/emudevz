import $path from "path-browserify-esm";
import filesystem, { Drive } from "../../../filesystem";
import { theme } from "../../style";
import Command from "../Command";

const ERROR_PREFIX = /^Error: /;

export default class FilesystemCommand extends Command {
	static get isHelpCollapsed() {
		return true;
	}

	static resolve(
		path,
		isWrite = false,
		workingDirectory = "/",
		shouldConvertSymlinks = true
	) {
		if (path == null) throw new Error("A path is required");

		const absolutePath = filesystem.resolve(path, workingDirectory);
		const processedPath = shouldConvertSymlinks
			? filesystem.process(absolutePath)
			: absolutePath;
		const parsedPath = $path.parse(processedPath);

		if (Drive.INVALID_CHARACTERS.test(parsedPath.base))
			throw new Error(`Invalid name: '${parsedPath.base}'`);

		if (parsedPath.base.length > Drive.MAX_FILE_NAME_LENGTH)
			throw new Error(`Name too long: '${parsedPath.base}'`);

		const isProtectedFile = Drive.isProtectedFile(processedPath);
		const isReadOnlyDir = Drive.isReadOnlyDir(parsedPath.dir);
		if (isWrite && (isProtectedFile || isReadOnlyDir))
			throw new Error(`EPERM: operation not permitted., '${processedPath}'`);

		return processedPath;
	}

	async execute() {
		try {
			await this._execute();
		} catch (e) {
			if (e?.isUserEvent) return;

			const message = e?.message || e?.toString() || "?";
			await this._terminal.writeln(
				"❌  " + theme.ERROR(message.replace(ERROR_PREFIX, ""))
			);
		}
	}

	async _execute() {
		throw new Error("not_implemented");
	}

	_resolve(path, isWrite = false, shouldConvertSymlinks = true) {
		return FilesystemCommand.resolve(
			path,
			isWrite,
			this._shell.workingDirectory,
			shouldConvertSymlinks
		);
	}

	get _fileArgs() {
		return this._args.filter((it) => !it.startsWith("-"));
	}
}
