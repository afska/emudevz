import CPUDebugger from "./CPUDebugger";
import { SingleFileCodeEditor } from "./CodeEditor";
import Console from "./Console";
import MultiFileCodeEditor from "./MultiFileCodeEditor";
import TV from "./TV";

export default {
	cpu: CPUDebugger,
	code: SingleFileCodeEditor,
	console: Console,
	multicode: MultiFileCodeEditor,
	tv: TV,
};
