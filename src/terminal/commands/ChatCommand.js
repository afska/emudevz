import Command from "./Command";
import Level from "../../level/Level";
import ChatScript from "../../level/chat/ChatScript";
import locales from "../../locales";
import { theme } from "../style";

const MESSAGE_SYMBOL = ">> ";
const PROMPT_SYMBOL = "?? ";
const SPEED = 30;

export default class ChatCommand extends Command {
	static get name() {
		return "chat";
	}

	async execute() {
		const level = Level.current;
		const chatScript = level.chatScripts[locales.language];
		const memory = level.memory.chat;

		while (memory.sectionName !== ChatScript.END_SECTION) {
			const messages = chatScript.getMessagesOf(
				memory.sectionName,
				memory.history
			);
			for (let message of messages)
				await this._terminal.writeln(
					MESSAGE_SYMBOL + message,
					theme.MESSAGE,
					SPEED
				);

			await this._terminal.newline();
			await this._terminal.writeln(
				locales.get("command_chat_choose_an_answer"),
				theme.SYSTEM
			);

			const options = chatScript.getOptionsOf(
				memory.sectionName,
				memory.history
			);
			for (let option of options)
				await this._terminal.writeln(`${option.number}) ${option.response}`);

			let selectedOption = null;
			while (selectedOption == null) {
				const getOption = (x) => {
					if (isFinite(parseInt(x)))
						return options.find((it) => it.number.toString() === x);

					const candidates = options.filter((it) =>
						it.response.toLowerCase().includes(x.toLowerCase())
					);
					if (candidates.length === 1) return candidates[0];
				};

				const response = await this._terminal.prompt(
					PROMPT_SYMBOL,
					(x) => getOption(x) != null,
					theme.INPUT
				);

				selectedOption = getOption(response);
			}

			memory.sectionName = selectedOption.link;
			memory.history.push(memory.sectionName);
		}

		level.advance();
	}

	onStop() {
		return !this._args.includes("-f");
	}
}
