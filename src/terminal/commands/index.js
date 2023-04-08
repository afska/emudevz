import ChatCommand from "./ChatCommand";
import ClearCommand from "./ClearCommand";
import HelpCommand from "./HelpCommand";
import ReplCommand from "./ReplCommand";
import SudoCommand from "./SudoCommand";
import fsCommands from "./fs";
import TestCommand from "./test/TestCommand";

export default [
	ChatCommand,
	ClearCommand,
	HelpCommand,
	ReplCommand,
	SudoCommand,
	TestCommand,
	...fsCommands,
];
