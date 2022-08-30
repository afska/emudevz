import Command from "./Command";
import locales from "../../locales";
import { theme } from "../style";

const SPEED = 30;

// TODO: REFACTOR
export default class ChatCommand extends Command {
	static get name() {
		return "chat";
	}

	async execute() {
		let state = "main";

		while (state !== "end") {
			const content = window.scr[state][locales.language];

			for (let message of content.messages)
				await this._terminal.writeln(`>> ${message}`, theme.MESSAGE, SPEED);

			await this._terminal.newline();
			await this._terminal.writeln("Choose an answer.", theme.SYSTEM);

			const options = content.responses.map((rawResponse, responseId) => {
				const number = parseInt(responseId) + 1;
				const responseParts = rawResponse.split(/\[(\w+)\]/);
				const response = responseParts[0];
				const responseLink = responseParts[1];

				return {
					number,
					response,
					responseLink,
				};
			});

			for (let option of options)
				await this._terminal.writeln(`${option.number}) ${option.response}`);

			let selectedOption = null;
			while (selectedOption == null) {
				const getOption = (x) =>
					options.find((it) => it.number.toString() === x);

				const response = await this._terminal.prompt(
					"?? ",
					(x) => getOption(x) != null,
					theme.INPUT
				);

				selectedOption = getOption(response);
			}

			state = selectedOption.responseLink;
		}
	}
}
