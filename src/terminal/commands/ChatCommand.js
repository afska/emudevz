import escapeStringRegexp from "escape-string-regexp";
import _ from "lodash";
import Level from "../../level/Level";
import ChatScript from "../../level/chat/ChatScript";
import codeEval from "../../level/codeEval";
import locales from "../../locales";
import { bus } from "../../utils";
import { CANCELED } from "../errors";
import highlighter from "../highlighter";
import { theme } from "../style";
import Command from "./Command";

const MESSAGE_SYMBOL = ">> ";
const SELECTION_SYMBOL = "=> ";
const MESSAGE_SPEED = 30;

// eslint-disable-next-line
const LINK_DETECT_REGEXP = _.template("(^${responses}$)");
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
			if (memory.sectionName !== sectionName) continue;

			await this._showMessages(messages);

			this._eval(chatScript.getAfterMessagesCodeOf(memory.sectionName));
			if (memory.sectionName !== sectionName) continue;

			if (!_.isEmpty(responses)) {
				await this._showChooseAnAnswer();
				await this._showResponses(responses);
				const response = await this._getSelectedResponse(responses);
				if (response.link === ChatScript.END_SECTION) this._showDisconnected();
				this._goTo(response.link);
			} else if (!_.isEmpty(events)) {
				if (!_.isEmpty(messages)) await this._terminal.newline();
				this._terminal.cancelSpeedFlag();
				const link = await this._getEventLink(events);
				this._goTo(link);
			} else {
				await this._terminal.newline();
				this._showDisconnected();
				this._goTo(ChatScript.END_SECTION);
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
			if (this._terminal.isExpectingKey)
				this._terminal.writeln(stopBlock, theme.ACCENT);
			this._terminal.cancelKey();
			return false;
		}

		if (this._includes("-f")) return false;

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
		if (this._linkProvider) this._linkProvider.end();
	}

	async _showDisconnected() {
		await this._terminal.writeln(locales.get("disconnected"), theme.COMMENT);
	}

	async _showMessages(messages) {
		for (let message of messages)
			await this._terminal.writeln(
				MESSAGE_SYMBOL + message,
				theme.MESSAGE,
				MESSAGE_SPEED,
				true
			);
	}

	async _showChooseAnAnswer() {
		await this._terminal.newline();
		await this._terminal.writeln(locales.get("choose_an_answer"), theme.SYSTEM);
	}

	async _showResponses(responses) {
		if (responses.length > 9) throw new Error("More than 9 responses");

		for (let response of responses)
			await this._terminal.writehlln(this._buildResponseText(response));
	}

	async _getSelectedResponse(responses) {
		let command = { selectedResponse: null };

		const getResponse = (x) => {
			if (isFinite(parseInt(x)))
				return responses.find((it) => it.number.toString() === x);
			return null;
		};

		try {
			this._setUpHyperlinkProvider(command, responses, getResponse);

			while (command.selectedResponse == null) {
				try {
					const response = await this._terminal.waitForKey();
					command.selectedResponse = getResponse(response);
				} catch (e) {
					if (e !== CANCELED) throw e;
				}
			}
			await this._showResponse(command.selectedResponse);
		} finally {
			this._linkProvider.end();
		}

		return command.selectedResponse;
	}

	async _showResponse(response) {
		await this._terminal.write(SELECTION_SYMBOL, theme.ACCENT);
		await this._terminal.writeln(response.number.toString(), theme.COMMENT);
		await this._terminal.newline();
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

	_setUpHyperlinkProvider(command, responses, getResponse) {
		const regexp = new RegExp(
			LINK_DETECT_REGEXP({
				responses: responses
					.map((response) => {
						const escapedText = escapeStringRegexp(
							this._buildResponseText(response).replace(
								highlighter.SILENT_CHARACTERS,
								""
							)
						);
						return `(${escapedText})`;
					})
					.join("|"),
			}),
			"u"
		);
		const handler = async (__, text) => {
			if (command.hasEnded) return;
			const number = text.match(LINK_PARSE_REGEXP)[1];
			command.selectedResponse = getResponse(number);
			this._terminal.cancelKey();
		};
		this._linkProvider = this._terminal.registerLinkProvider(regexp, handler);
		this._linkProvider.end = () => {
			this._linkProvider.dispose();
			command.hasEnded = true;
		};
	}

	_buildResponseText(response) {
		return `${response.number}) ${response.content}`;
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
