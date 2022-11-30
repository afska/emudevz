import ChatCommand from "./ChatCommand";
import ClearCommand from "./ClearCommand";
import DebugCommand from "./DebugCommand";
import HelpCommand from "./HelpCommand";
import ReplCommand from "./ReplCommand";
import fsCommands from "./fs";
import TestCommand from "./test/TestCommand";

export default [
	ChatCommand,
	ClearCommand,
	DebugCommand,
	HelpCommand,
	ReplCommand,
	TestCommand,
	...fsCommands,
];
