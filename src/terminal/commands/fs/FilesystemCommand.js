import $path from "path";
import { Drive } from "../../../filesystem";
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
			this._terminal.writeln(
				"❌  " + theme.ERROR(e.message.replace(ERROR_PREFIX, ""))
			);
		}
	}

	async _execute() {
		throw new Error("not_implemented");
	}

	_resolve(path, isWrite = false) {
		if (path == null) throw new Error("A path is required");

		process.$setCwd(this._shell.workingDirectory);
		const absolutePath = $path.resolve(path);
		const parsedPath = $path.parse(absolutePath);
		if (isWrite && Drive.READONLY_PATHS.some((it) => parsedPath.dir === it))
			throw new Error(`EPERM: opeartion not permitted., '${absolutePath}'`);

		return absolutePath;
	}
}
