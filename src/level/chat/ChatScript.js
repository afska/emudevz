import codeEval from "../codeEval";

const REGEXP = {
	if: /^<(.+)> /,
	modifier: /^\(.\) /,
	consumable: /^\(\*\) /,
	key: /^\(k\) /,
	lock: /^\(l\) /,
	inheritance: /^\.\.\./,
	link: / \[(\w+)\]$/,
};

export default class ChatScript {
	constructor(content, language) {
		this.content = content;
		this.language = language;
	}

	static get INITIAL_SECTION() {
		return "main";
	}

	static get END_SECTION() {
		return "end";
	}

	static getInheritanceOf(string) {
		const parts = string.split(REGEXP.inheritance);
		if (parts.length !== 2) return null;

		return parts[1] || null;
	}

	static getLinkOf(string) {
		const parts = string.split(REGEXP.link);
		if (parts.length !== 3) return null;

		return parts[1] || null;
	}

	getMessagesOf(sectionName, history = []) {
		const section = this.content[sectionName];
		if (!section) throw new Error(`Section not found: ${sectionName}`);

		return this._processIfs(section.messages).flatMap((rawMessage) => {
			const inheritance = ChatScript.getInheritanceOf(rawMessage);
			if (inheritance) return this.getMessagesOf(inheritance, history);

			return [rawMessage];
		});
	}

	getResponsesOf(sectionName, history) {
		return this.getOptionsOf("responses", sectionName, history);
	}

	getEventsOf(sectionName, history) {
		return this.getOptionsOf("events", sectionName, history);
	}

	getOptionsOf(field, sectionName, history = []) {
		const section = this.content[sectionName];
		if (!section) throw new Error(`Section not found: ${sectionName}`);
		if (!Array.isArray(section[field])) return [];

		return this._processIfs(section[field])
			.flatMap((rawContent) => {
				const inheritance = ChatScript.getInheritanceOf(rawContent);
				if (inheritance) return this.getOptionsOf(field, inheritance, history);

				const [content, link] = rawContent.split(REGEXP.link);
				const isConsumable = REGEXP.consumable.test(rawContent);
				const isKey = REGEXP.key.test(rawContent);
				const isLock = REGEXP.lock.test(rawContent);

				return [
					{
						content: content.replace(REGEXP.modifier, ""),
						link,
						isConsumable,
						isKey,
						isLock,
					},
				];
			})
			.filter((it, __, responses) => {
				if (it.isConsumable) return !history.includes(it.link);
				if (it.isLock) {
					const keyResponses = responses.filter((r) => r.isKey);
					return keyResponses.every((r) => history.includes(r.link));
				}

				return true;
			})
			.map((it, responseId) => {
				return { ...it, number: parseInt(responseId) + 1 };
			});
	}

	getStartUpCodeOf(sectionName) {
		const section = this.content[sectionName];
		if (!section) throw new Error(`Section not found: ${sectionName}`);

		return section.run || null;
	}

	getAfterMessagesCodeOf(sectionName) {
		const section = this.content[sectionName];
		if (!section) throw new Error(`Section not found: ${sectionName}`);

		return section["run-after-messages"] || null;
	}

	validate() {
		if (this.content.main == null) throw new Error("No main section");

		for (let sectionName in this.content) {
			const section = this.content[sectionName];

			if (!Array.isArray(section.messages))
				throw new Error(`Missing messages: ${this.language}/${sectionName}`);

			if (section.messages.some(this._isMessageInvalid))
				throw new Error(`Invalid messages: ${this.language}/${sectionName}`);

			if (!Array.isArray(section.responses) && !Array.isArray(section.events))
				throw new Error(
					`Missing responses/events: ${this.language}/${sectionName}`
				);

			if (Array.isArray(section.responses) && Array.isArray(section.events))
				throw new Error(
					`Invalid section with responses AND events: ${this.language}/${sectionName}`
				);

			if (
				Array.isArray(section.responses) &&
				section.responses.some(this._isResponseOrEventInvalid)
			)
				throw new Error(`Invalid responses: ${this.language}/${sectionName}`);

			if (
				Array.isArray(section.events) &&
				section.events.some(this._isResponseOrEventInvalid)
			)
				throw new Error(`Invalid events: ${this.language}/${sectionName}`);
		}
	}

	_isMessageInvalid = (message) => {
		if (typeof message !== "string") return true;

		message = this._stripIf(message);
		const inheritance = ChatScript.getInheritanceOf(message);
		if (inheritance && !this.content[inheritance]) return true;

		return false;
	};

	_isResponseOrEventInvalid = (responseOrEvent) => {
		if (typeof responseOrEvent !== "string") return true;

		responseOrEvent = this._stripIf(responseOrEvent);
		const inheritance = ChatScript.getInheritanceOf(responseOrEvent);
		if (inheritance) return !this.content[inheritance];

		const link = ChatScript.getLinkOf(responseOrEvent);
		if (!link || (link !== ChatScript.END_SECTION && !this.content[link]))
			return true;

		return false;
	};

	_processIfs = (strings) => {
		return strings
			.filter((string) => {
				const hasIf = REGEXP.if.test(string);
				if (!hasIf) return true;

				const condition = string.match(REGEXP.if)[1];
				return !!codeEval.eval(condition);
			})
			.map(this._stripIf);
	};

	_stripIf = (string) => string.replace(REGEXP.if, "");
}
