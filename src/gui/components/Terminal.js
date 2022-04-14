import React, { PureComponent } from "react";
import ConsoleEmulator from "react-console-emulator";

const commands = {
	echo: {
		description: "Echo a passed string.",
		usage: "echo <string>",
		fn: function () {
			return `${Array.from(arguments).join(" ")}`;
		},
	},
};

export default class Terminal extends PureComponent {
	render() {
		return (
			<ConsoleEmulator
				commands={commands}
				welcomeMessage={"Welcome to the React terminal!"}
				promptLabel={"me@consoletest:~$"}
				style={{
					backgroundColor: "#424242",
					width: "100%",
					height: "100%",
					borderRadius: 0,
				}}
				contentStyle={{ height: "5vh" }}
			/>
		);
	}
}
