import _ from "lodash";
import filesystem, { Drive } from "../../../filesystem";
import locales from "../../../locales";
import store from "../../../store";
import { bus } from "../../../utils";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

const LOCATION_DETECT_REGEXP = /📌 {2}(.+:?\d*) 📌/u;
const LOCATION_PARSE_REGEXP = /(\/[^:]+):?(\d*)\b/;
const NEWLINE = /\r?\n/;

export default class FindCommand extends FilesystemCommand {
	static get name() {
		return "find";
	}

	async _execute() {
		const query = this._getQuery();
		if (query.length === 0) return;

		try {
			this._setUpHyperlinkProvider();

			const files = filesystem.lsr(Drive.CODE_DIR);
			for (let entry of files) {
				const filePath = entry.filePath;

				let content;
				try {
					content = filesystem.read(filePath);
				} catch (e) {
					continue;
				}

				const lines = content.split(NEWLINE);
				for (let i = 0; i < lines.length; i++) {
					const lineNumber = i + 1;
					const line = lines[i];
					if (!line.includes(query)) continue;

					await this._terminal.writeln(
						`📌  ${filePath}:${lineNumber} 📌`,
						theme.ACCENT
					);
					await this._terminal.writehlln(`\`\`\`javascript ${line}\`\`\``);
					await this._terminal.newline();
				}
			}

			await this._terminal.writeln(
				locales.get("press_any_key_to_continue"),
				theme.SYSTEM
			);
			await this._terminal.waitForKey();
		} finally {
			this._onClose();
		}
	}

	onStop() {
		this._onClose();
		return true;
	}

	_getQuery() {
		return this._args.join(" ").trim();
	}

	_setUpHyperlinkProvider() {
		const handler = (__, text) => {
			if (this._hasEnded) return;
			const matches = text.match(LOCATION_PARSE_REGEXP);
			const filePath = matches[1];
			const lineNumber = parseInt(matches[2]);

			store.dispatch.savedata.openFile(filePath);
			if (_.isFinite(lineNumber))
				bus.emit("highlight", { line: lineNumber - 1, reason: "find-command" });
		};
		this._linkProvider = this._terminal.registerLinkProvider(
			LOCATION_DETECT_REGEXP,
			handler
		);
		this._linkProvider.end = () => {
			this._linkProvider.dispose();
			this._hasEnded = true;
		};
	}

	_onClose() {
		if (this._linkProvider) this._linkProvider.end();
	}
}
