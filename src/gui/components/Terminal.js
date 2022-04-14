import React, { PureComponent } from "react";
import { XTerm } from "xterm-for-react";
import { FitAddon } from "xterm-addon-fit";

export default class Terminal extends PureComponent {
	fitAddon = new FitAddon();

	render() {
		return (
			<XTerm
				options={{
					cursorBlink: true,
					theme: { background: "#111111" },
				}}
				addons={[this.fitAddon]}
				ref={(ref) => {
					if (!ref) return;
					this.ref = ref;
				}}
			/>
		);
	}

	componentDidMount() {
		const term = this.ref.terminal;
		// term.writeln("\x1b[31;1mWelcome!\x1b[0m");
		// term.write("me@consoletest:~$ ");
		this.fitAddon.fit();

		term.prompt = () => {
			term.write("\r\n$ ");
		};

		// TODO: Use a nicer default font
		term.writeln(
			[
				"    Xterm.js is the frontend component that powers many terminals including",
				"                           \x1b[3mVS Code\x1b[0m, \x1b[3mHyper\x1b[0m and \x1b[3mTheia\x1b[0m!",
				"",
				" ┌ \x1b[1mFeatures\x1b[0m ──────────────────────────────────────────────────────────────────┐",
				" │                                                                            │",
				" │  \x1b[31;1mApps just work                         \x1b[32mPerformance\x1b[0m                        │",
				" │   Xterm.js works with most terminal      Xterm.js is fast and includes an  │",
				" │   apps like bash, vim and tmux           optional \x1b[3mWebGL renderer\x1b[0m           │",
				" │                                                                            │",
				" │  \x1b[33;1mAccessible                             \x1b[34mSelf-contained\x1b[0m                     │",
				" │   A screen reader mode is available      Zero external dependencies        │",
				" │                                                                            │",
				" │  \x1b[35;1mUnicode support                        \x1b[36mAnd much more...\x1b[0m                   │",
				" │   Supports CJK 語 and emoji \u2764\ufe0f            \x1b[3mLinks\x1b[0m, \x1b[3mthemes\x1b[0m, \x1b[3maddons\x1b[0m,            │",
				" │                                          \x1b[3mtyped API\x1b[0m, \x1b[3mdecorations\x1b[0m            │",
				" │                                                                            │",
				" └────────────────────────────────────────────────────────────────────────────┘",
				"",
			].join("\n\r")
		);

		let command;
		const commands = {
			help: {
				f: () => {
					term.writeln(
						[
							"Welcome to xterm.js! Try some of the commands below.",
							"",
							...Object.keys(commands).map(
								(e) => `  ${e.padEnd(10)} ${commands[e].description}`
							),
						].join("\n\r")
					);
					prompt(term);
				},
				description: "Prints this help message",
			},
			ls: {
				f: () => {
					term.writeln(["a", "bunch", "of", "fake", "files"].join("\r\n"));
					term.prompt(term);
				},
				description: "Prints a fake directory structure",
			},
		};

		const prompt = (term) => {
			command = "";
			term.write("\r\n$ ");
		};

		const runCommand = (term, text) => {
			const command = text.trim().split(" ")[0];
			if (command.length > 0) {
				term.writeln("");
				if (command in commands) {
					commands[command].f();
					return;
				}
				term.writeln(`${command}: command not found`);
			}
			prompt(term);
		};

		term.writeln("Below is a simple emulated backend, try running `help`.");
		prompt(term);

		term.onData((e) => {
			switch (e) {
				case "\u0003": // Ctrl+C
					term.write("^C");
					prompt(term);
					break;
				case "\r": // Enter
					runCommand(term, command);
					command = "";
					break;
				case "\u007F": // Backspace (DEL)
					// Do not delete the prompt
					if (term._core.buffer.x > 2) {
						term.write("\b \b");
						if (command.length > 0) {
							command = command.substr(0, command.length - 1);
						}
					}
					break;
				default:
					// Print all other characters for demo
					if (
						(e >= String.fromCharCode(0x20) &&
							e <= String.fromCharCode(0x7b)) ||
						e >= "\u00a0"
					) {
						command += e;
						term.write(e);
					}
			}
		});
	}
}
