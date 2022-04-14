import React, { PureComponent } from "react";
import { XTerm } from "xterm-for-react";

export default class Terminal extends PureComponent {
	render() {
		return (
			<XTerm
				options={{
					cursorBlink: true,
					theme: { background: "#111111" },
				}}
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
	}
}
