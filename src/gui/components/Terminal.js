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
		this.ref.terminal.writeln("\x1b[31;1mWelcome!\x1b[0m");
		this.ref.terminal.write("me@consoletest:~$ ");
		this.fitAddon.fit();
	}
}
