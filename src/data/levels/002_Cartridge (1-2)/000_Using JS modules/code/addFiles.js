const CODE_DIR = "/code";
const MAIN_FILE = "/code/index.js";

if (!filesystem.exists(CODE_DIR)) filesystem.mkdir(CODE_DIR);
if (!filesystem.exists(MAIN_FILE)) filesystem.write(MAIN_FILE, "");
