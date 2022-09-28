import Level from "../../level/Level";
import Command from "./Command";
import framework from "./test/framework";

const cliHighlight = require("cli-highlight");
cliHighlight.DEFAULT_THEME.keyword = (a) => `pio${a}la`;
const result = cliHighlight.highlight("function() { return 2 * 3 + 'jeje'; }", {
	language: "javascript",
});
console.log(result);

export default class TestCommand extends Command {
	static get name() {
		return "test";
	}

	async execute() {
		const level = Level.current;

		await this._terminal.writeln(
			cliHighlight.highlight("function() { return 2 * 3 + 'jeje'; }", {
				language: "javascript",
			})
		);

		console.log(
			await framework.test(`const {} = $;

		it("2 equals 3", () => {
			(2).should.eql(3);
		});
		`)
		);

		// await this._terminal.writeln("YOU WIN (?");
		// level.advance();
	}
}
