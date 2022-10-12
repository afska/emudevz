import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class RmCommand extends FilesystemCommand {
	static get name() {
		return "rm";
	}

	async _execute() {
		const path = this._resolve(this._args[0], true);

		try {
			filesystem.rm(path);
		} catch (e) {
			if (!e.message.startsWith("Error: EISDIR")) throw e;

			try {
				filesystem.rmdir(path);
			} catch (e) {
				if (!e.message.startsWith("Error: ENOTEMPTY")) throw e;

				// TODO: LOCALIZE
				await this._terminal.writeln(
					"This has FILES!!! Are you freaking sure? (y/N)"
				);
				const key = await this._terminal.waitForKey();
				if (key.toLowerCase() === "y") {
					await this._terminal.writeln("Deleting recursively...");
					// TODO: DELETE RECURSIVELY
				}
			}
		}
	}
}
