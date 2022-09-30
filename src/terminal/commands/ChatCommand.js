import _ from "lodash";
import Level from "../../level/Level";
import ChatScript from "../../level/chat/ChatScript";
import codeEval from "../../level/codeEval";
import locales from "../../locales";
import { bus } from "../../utils";
import { theme } from "../style";
import Command from "./Command";

const MESSAGE_SYMBOL = ">> ";
const PROMPT_SYMBOL = "?? ";
const SPEED = 30;
const LINK_DETECT_REGEXP = /^(\d\d?\) .+)/gu;
const LINK_PARSE_REGEXP = /^(\d\d?)\) .+/u;

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

		this._onOpen();

		while (memory.sectionName !== ChatScript.END_SECTION) {
			const sectionName = memory.sectionName;
			const messages = chatScript.getMessagesOf(
				memory.sectionName,
				memory.history
			);
			const responses = chatScript.getResponsesOf(
				memory.sectionName,
				memory.history
			);
			const events = chatScript.getEventsOf(memory.sectionName, memory.history);

			this._eval(chatScript.getStartUpCodeOf(memory.sectionName));
			await this._showMessages(messages);
			this._eval(chatScript.getAfterMessagesCodeOf(memory.sectionName));
			if (memory.sectionName !== sectionName) continue;

			if (!_.isEmpty(responses)) {
				await this._showChooseAnAnswer();
				await this._showResponses(responses);
				const response = await this._getSelectedResponse(responses);
				this._goTo(response.link);
			} else if (!_.isEmpty(events)) {
				await this._terminal.newline();
				this._terminal.cancelSpeedFlag();
				const link = await this._getEventLink(events);
				this._goTo(link);
			}
		}

		if (memory.winOnEnd) {
			this._onClose();
			level.advance();
			return;
		}

		this._goTo(ChatScript.INITIAL_SECTION);
		this._onClose();
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

		this._onClose();

		return true;
	}

	_onOpen() {
		Level.current.setMemory(({ chat }) => {
			chat.isOpen = true;
		});
	}

	_onClose() {
		Level.current.setMemory(({ chat }) => {
			chat.isOpen = false;
		});
		if (this._linkProvider) this._linkProvider.dispose();
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
		await this._terminal.writeln(locales.get("choose_an_answer"), theme.SYSTEM);
	}

	async _showResponses(responses) {
		for (let response of responses)
			await this._terminal.writeln(`${response.number}) ${response.content}`);
	}

	async _getSelectedResponse(responses) {
		let command = { selectedResponse: null };

		while (command.selectedResponse == null) {
			const getResponse = (x) => {
				if (isFinite(parseInt(x)))
					return responses.find((it) => it.number.toString() === x);

				const candidates = responses.filter((it) =>
					it.content.toLowerCase().includes(x.toLowerCase())
				);
				if (x.length > 0 && candidates.length === 1) return candidates[0];
			};

			try {
				this._linkProvider = this._terminal.registerLinkProvider(
					LINK_DETECT_REGEXP,
					(__, text) => {
						const number = text.match(LINK_PARSE_REGEXP)[1];
						command.selectedResponse = getResponse(number);
						this._terminal.writeln(number);
						this._terminal.cancelPrompt();
					}
				);

				const response = await this._terminal.prompt(
					PROMPT_SYMBOL,
					theme.INPUT,
					(x) => getResponse(x) != null
				);
				command.selectedResponse = getResponse(response);
			} catch (e) {
				if (e !== "canceled") throw e;
			} finally {
				this._linkProvider.dispose();
			}
		}

		return command.selectedResponse;
	}

	async _getEventLink(events) {
		let subscriber;
		const link = await new Promise((resolve) => {
			subscriber = bus.subscribe(
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

	_eval(code) {
		return codeEval.eval(code, {
			goTo: this._goTo,
		});
	}

	_goTo(sectionName) {
		Level.current.setMemory(({ chat }) => {
			chat.sectionName = sectionName;
			chat.history.push(chat.sectionName);
		});
	}
}
