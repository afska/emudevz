const cliHighlight = require("cli-highlight");

export default {
	highlight(code, language = "javascript") {
		return cliHighlight.highlight(code, {
			language,
		});
	},
};

const plain = (t) => `\x1B[37m${t}\x1B[39m`;
const chalk = {
	blue: (t) => `\u001b[38;5;10m${t}\x1B[39m`, // (green) // `\x1B[94m${t}\x1B[39m`,
	cyan: (t) => `\x1B[36m${t}\x1B[39m`,
	cyanDim: (t) => `\x1B[36m\x1B[2m${t}\x1B[22m\x1B[39m`,
	aqua: (t) => `\u001b[38;5;48m${t}\x1B[39m`,
	green: (t) => `\u001b[38;5;10m${t}\x1B[39m`,
	yellow: (t) => `\x1B[33m${t}\x1B[39m`,
	grey: (t) => `\x1B[90m${t}\x1B[39m`,
	italic: (t) => `\x1B[3m${t}\x1B[23m`,
	bold: (t) => `\x1B[1m${t}\x1B[22m`,
	underline: (t) => `\x1B[4m${t}\x1B[24m`,
};

cliHighlight.DEFAULT_THEME.comment = chalk.grey;
cliHighlight.DEFAULT_THEME.keyword = chalk.blue;
cliHighlight.DEFAULT_THEME.built_in = chalk.cyan;
cliHighlight.DEFAULT_THEME.type = chalk.cyanDim;
cliHighlight.DEFAULT_THEME.literal = chalk.blue;
cliHighlight.DEFAULT_THEME.number = chalk.aqua;
cliHighlight.DEFAULT_THEME.regexp = chalk.green;
cliHighlight.DEFAULT_THEME.string = chalk.green;
cliHighlight.DEFAULT_THEME.subst = plain;
cliHighlight.DEFAULT_THEME.symbol = plain;
cliHighlight.DEFAULT_THEME.class = chalk.blue;
cliHighlight.DEFAULT_THEME.function = chalk.yellow;
cliHighlight.DEFAULT_THEME.title = plain;
cliHighlight.DEFAULT_THEME.params = plain;
cliHighlight.DEFAULT_THEME.params = chalk.aqua;
cliHighlight.DEFAULT_THEME.doctag = chalk.aqua;
cliHighlight.DEFAULT_THEME.meta = chalk.grey;
cliHighlight.DEFAULT_THEME["meta-keyword"] = plain;
cliHighlight.DEFAULT_THEME["meta-string"] = plain;
cliHighlight.DEFAULT_THEME.section = plain;
cliHighlight.DEFAULT_THEME.tag = chalk.grey;
cliHighlight.DEFAULT_THEME.name = chalk.blue;
cliHighlight.DEFAULT_THEME["builtin-name"] = plain;
cliHighlight.DEFAULT_THEME.attr = chalk.cyan;
cliHighlight.DEFAULT_THEME.attribute = plain;
cliHighlight.DEFAULT_THEME.variable = plain;
cliHighlight.DEFAULT_THEME.bullet = plain;
cliHighlight.DEFAULT_THEME.code = plain;
cliHighlight.DEFAULT_THEME.emphasis = chalk.italic;
cliHighlight.DEFAULT_THEME.strong = chalk.bold;
cliHighlight.DEFAULT_THEME.formula = plain;
cliHighlight.DEFAULT_THEME.link = chalk.underline;
cliHighlight.DEFAULT_THEME.quote = plain;
cliHighlight.DEFAULT_THEME["selector-tag"] = plain;
cliHighlight.DEFAULT_THEME["selector-id"] = plain;
cliHighlight.DEFAULT_THEME["selector-class"] = plain;
cliHighlight.DEFAULT_THEME["selector-attr"] = plain;
cliHighlight.DEFAULT_THEME["selector-pseudo"] = plain;
cliHighlight.DEFAULT_THEME["template-tag"] = plain;
cliHighlight.DEFAULT_THEME["template-variable"] = plain;
cliHighlight.DEFAULT_THEME.addition = chalk.green;
cliHighlight.DEFAULT_THEME.deletion = chalk.red;
cliHighlight.DEFAULT_THEME.default = plain;
