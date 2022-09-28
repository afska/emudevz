import Level from "../../level/Level";
import cliHighlighter from "../../utils/cli/cliHighlighter";
import Command from "./Command";
import framework from "./test/framework";

export default class TestCommand extends Command {
	static get name() {
		return "test";
	}

	async execute() {
		const level = Level.current;

		await this._terminal.writeln(
			cliHighlighter.highlight("function() { return 2 * 3 + 'jeje'; }", {
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
