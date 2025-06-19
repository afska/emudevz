import CPUDebugger from "./CPUDebugger";
import { SingleFileCodeEditor } from "./CodeEditor";
import Console from "./Console";
import Debugger from "./Debugger";
import MultiFile from "./MultiFile";
import NEEESTester from "./NEEESTester";
import TV from "./TV";

export default {
	cpu: CPUDebugger,
	code: SingleFileCodeEditor,
	console: Console,
	debugger: Debugger,
	multifile: MultiFile,
	tv: TV,
	neeestester: NEEESTester,
};
