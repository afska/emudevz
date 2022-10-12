import ChatCommand from "./ChatCommand";
import ClearCommand from "./ClearCommand";
import HelpCommand from "./HelpCommand";
import ReplCommand from "./ReplCommand";
import fsCommands from "./fs";
import TestCommand from "./test/TestCommand";

export default [
	ChatCommand,
	ClearCommand,
	HelpCommand,
	ReplCommand,
	TestCommand,
	...fsCommands,
];
