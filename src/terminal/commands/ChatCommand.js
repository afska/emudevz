import _ from "lodash";
import Level from "../../level/Level";
import ChatScript from "../../level/chat/ChatScript";
import locales from "../../locales";
import { bus as _bus } from "../../utils";
import { theme } from "../style";
import Command from "./Command";

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

		if (memory.isOpen) {
			await this._terminal.writeln(
				locales.get("command_chat_already_open"),
				theme.SYSTEM
			);
			return;
		}

		memory.isOpen = true;

		while (memory.sectionName !== ChatScript.END_SECTION) {
			const startUpCode = chatScript.getStartUpCodeOf(memory.sectionName);
			const messages = chatScript.getMessagesOf(
				memory.sectionName,
				memory.history
			);
			const options = chatScript.getOptionsOf(
				memory.sectionName,
				memory.history
			);

			await this._runStartUpCode(startUpCode);
			await this._showMessages(messages);
			if (!_.isEmpty(options)) {
				await this._showChooseAnAnswer();
				await this._showOptions(options);
				const selectedOption = await this._getSelectedOption(options);
				this._goTo(selectedOption, memory);
			} else {
				// TODO: WAIT FOR BUS EVENTS
			}
		}

		level.advance();
	}

	onStop() {
		if (this._args.includes("-f")) return false;

		Level.current.memory.chat.isOpen = false;

		return true;
	}

	async _runStartUpCode(startUpCode) {
		if (startUpCode == null) return;

		const layout = Level.current.$layout;

		// eslint-disable-next-line
		const bus = _bus; // (can be used inside eval)

		let evalCode = startUpCode;
		_.forEach(layout.instances, async (__, name) => {
			evalCode = evalCode.replace(
				new RegExp(`{{${name}}}`, "g"),
				`layout.instances["${name}"]`
			);
		});

		eval(evalCode);
	}

	async _showMessages(messages) {
		for (let message of messages)
			await this._terminal.writeln(
				MESSAGE_SYMBOL + message,
				theme.MESSAGE,
				SPEED
			);
	}

	async _showChooseAnAnswer() {
		await this._terminal.newline();
		await this._terminal.writeln(
			locales.get("command_chat_choose_an_answer"),
			theme.SYSTEM
		);
	}

	async _showOptions(options) {
		for (let option of options)
			await this._terminal.writeln(`${option.number}) ${option.response}`);
	}

	async _getSelectedOption(options) {
		let selectedOption = null;

		while (selectedOption == null) {
			const getOption = (x) => {
				if (isFinite(parseInt(x)))
					return options.find((it) => it.number.toString() === x);

				const candidates = options.filter((it) =>
					it.response.toLowerCase().includes(x.toLowerCase())
				);
				if (x.length > 0 && candidates.length === 1) return candidates[0];
			};

			const response = await this._terminal.prompt(
				PROMPT_SYMBOL,
				(x) => getOption(x) != null,
				theme.INPUT
			);

			selectedOption = getOption(response);
		}

		return selectedOption;
	}

	_goTo(selectedOption, memory) {
		memory.sectionName = selectedOption.link;
		memory.history.push(memory.sectionName);
	}
}
