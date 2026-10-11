const fs = require("fs");
const sortFiles = require("./_sort");

const directory = "src/data/locales";
const arg = process.argv[2];
const files = arg
	? [arg.endsWith(".js") ? arg : `${directory}/${arg}.js`]
	: fs
			.readdirSync(directory)
			.filter((file) => file.endsWith(".js"))
			.map((file) => `${directory}/${file}`);

sortFiles(files);
