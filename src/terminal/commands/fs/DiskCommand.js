import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

export default class DiskCommand extends FilesystemCommand {
	static get name() {
		return "disk";
	}

	async _execute() {
		const fmtSize = (n) => {
			if (n == null) return "?";

			const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"]; // IEC
			let value = Number(n);
			let i = 0;
			while (value >= 1024 && i < units.length - 1) {
				value /= 1024;
				i++;
			}
			const decimals = i === 0 ? 0 : value < 10 ? 2 : 1;
			return value.toFixed(decimals) + " " + units[i];
		};
		const fmtPercent = (used, total) => {
			if (total == null || total === 0 || used == null) return "?%";
			return ((used / total) * 100).toFixed(1) + "%";
		};

		let used = null;
		let total = null;

		try {
			const estimate = await navigator?.storage?.estimate?.();
			used = estimate?.usage ?? null;
			total = estimate?.quota ?? null;
		} catch {}

		const line =
			theme.ACCENT(fmtSize(used)) +
			theme.NORMAL(" / ") +
			theme.ACCENT(fmtSize(total)) +
			theme.NORMAL(" (") +
			theme.ACCENT(fmtPercent(used, total)) +
			theme.NORMAL(")");

		await this._terminal.writeln(line);
	}
}
