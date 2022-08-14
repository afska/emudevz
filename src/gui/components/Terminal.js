import React, { PureComponent } from "react";
import { XTerm } from "xterm-for-react";
import { FitAddon } from "xterm-addon-fit";
import styles from "./Terminal.module.css";

export default class Terminal extends PureComponent {
	fitAddon = new FitAddon();

	render() {
		return (
			<div
				className={styles.xtermContainer}
				onKeyDownCapture={this._onKeyDownCapture}
			>
				<XTerm
					className={styles.xtermContainer}
					options={{
						cursorBlink: true,
						theme: { background: "#111111" },
					}}
					addons={[this.fitAddon]}
					ref={(ref) => {
						this.ref = ref;
					}}
				/>
			</div>
		);
	}

	focus = () => {
		this.ref.terminal.focus();
	};

	_onResize = () => {
		this.fitAddon.fit();
	};

	_onKeyDownCapture = (e) => {
		if (
			(e.code === "ArrowLeft" ||
				e.code === "ArrowRight" ||
				e.code === "ArrowUp" ||
				e.code === "ArrowDown") &&
			e.altKey
		)
			e.preventDefault();
	};

	componentDidMount() {
		window.addEventListener("resize", this._onResize);
		this._onResize();

		const term = this.ref.terminal;
		// term.writeln("\x1b[31;1mWelcome!\x1b[0m");
		// term.write("me@emudevz:~$ ");

		term.prompt = () => {
			term.write("\r\n$ ");
		};

		term.writeln(["Jeje"].join("\n\r"));

		let command;
		const commands = {
			clear: {
				f: () => {
					term.clear();
					prompt(term);
				},
				description: "Clears everything",
			},
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

	componentWillUnmount() {
		window.removeEventListener("resize", this.resize);
	}
}
