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

		level.setMemory(({ chat }) => {
			chat.isOpen = true;
		});

		while (memory.sectionName !== ChatScript.END_SECTION) {
			const messages = chatScript.getMessagesOf(
				memory.sectionName,
				memory.history
			);
			const responses = chatScript.getResponsesOf(
				memory.sectionName,
				memory.history
			);
			const events = chatScript.getEventsOf(memory.sectionName, memory.history);

			await this._runCode(chatScript.getStartUpCodeOf(memory.sectionName));
			await this._showMessages(messages);

			if (!_.isEmpty(responses)) {
				await this._showChooseAnAnswer();
				await this._showResponses(responses);
				const response = await this._getSelectedResponse(responses);
				this._goTo(response.link, level);
			} else {
				await this._terminal.newline();
				this._terminal.cancelSpeedFlag();
				await this._runCode(
					chatScript.getBeforeEventsCodeOf(memory.sectionName)
				);
				const link = await this._getEventLink(events);
				this._goTo(link, level);
			}
		}

		level.advance();
	}

	onStop() {
		const { stopBlock } = Level.current.memory.chat;
		if (stopBlock != null) {
			if (this._terminal.isExpectingInput)
				this._terminal.write(stopBlock, theme.ACCENT);
			this._terminal.cancelPrompt();
			return false;
		}

		if (this._args.includes("-f")) return false;

		Level.current.setMemory(({ chat }) => {
			chat.isOpen = false;
		});

		return true;
	}

	async _runCode(code) {
		if (code == null) return;

		const level = Level.current;
		const layout = level.$layout;

		// eval scope:
		// eslint-disable-next-line
		const set = (action) => level.setMemory(action);
		// eslint-disable-next-line
		const bus = _bus;

		// TODO: Replace with bus?
		let evalCode = code;
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

	async _showResponses(responses) {
		for (let response of responses)
			await this._terminal.writeln(`${response.number}) ${response.content}`);
	}

	async _getSelectedResponse(responses) {
		let selectedResponse = null;

		while (selectedResponse == null) {
			const getResponse = (x) => {
				if (isFinite(parseInt(x)))
					return responses.find((it) => it.number.toString() === x);

				const candidates = responses.filter((it) =>
					it.content.toLowerCase().includes(x.toLowerCase())
				);
				if (x.length > 0 && candidates.length === 1) return candidates[0];
			};

			try {
				const response = await this._terminal.prompt(
					PROMPT_SYMBOL,
					(x) => getResponse(x) != null,
					theme.INPUT
				);
				selectedResponse = getResponse(response);
			} catch (e) {
				if (e !== "canceled") throw e;
			}
		}

		return selectedResponse;
	}

	async _getEventLink(events) {
		let subscriber;
		const link = await new Promise((resolve) => {
			subscriber = _bus.subscribe(
				_(events)
					.keyBy("content")
					.mapValues((event, k) => () => {
						resolve(event.link);
					})
					.value()
			);
		});
		subscriber.release();

		return link;
	}

	_goTo(sectionName, level) {
		level.setMemory(({ chat }) => {
			chat.sectionName = sectionName;
			chat.history.push(chat.sectionName);
		});
	}
}
