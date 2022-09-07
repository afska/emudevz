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

	static get CONSUMABLE_REGEXP() {
		return /^\(\*\) /;
	}

	static get INHERITANCE_REGEXP() {
		return /^\.\.\./;
	}

	static get LINK_REGEXP() {
		return / \[(\w+)\]$/;
	}

	static getInheritanceOf(string) {
		const parts = string.split(ChatScript.INHERITANCE_REGEXP);
		if (parts.length !== 2) return null;
		return parts[1] || null;
	}

	static getLinkOf(string) {
		const parts = string.split(ChatScript.LINK_REGEXP);
		if (parts.length !== 3) return null;
		return parts[1] || null;
	}

	getMessagesOf(sectionName, history = []) {
		const section = this.content[sectionName];
		if (!section) throw new Error(`Section not found: ${sectionName}`);

		return section.messages.flatMap((rawMessage) => {
			const inheritance = ChatScript.getInheritanceOf(rawMessage);
			if (inheritance) return this.getMessagesOf(inheritance, history);

			return [rawMessage];
		});
	}

	getOptionsOf(sectionName, history = []) {
		const section = this.content[sectionName];
		if (!section) throw new Error(`Section not found: ${sectionName}`);

		return section.responses
			.flatMap((rawResponse) => {
				const inheritance = ChatScript.getInheritanceOf(rawResponse);
				if (inheritance) return this.getOptionsOf(inheritance, history);

				const [response, link] = rawResponse.split(ChatScript.LINK_REGEXP);
				const isConsumable = ChatScript.CONSUMABLE_REGEXP.test(rawResponse);

				return [
					{
						response: response.replace(ChatScript.CONSUMABLE_REGEXP, ""),
						link,
						isConsumable,
					},
				];
			})
			.filter((it) => {
				return !it.isConsumable || !history.includes(it.link);
			})
			.map((it, responseId) => {
				return { ...it, number: parseInt(responseId) + 1 };
			});
	}

	validate() {
		if (this.content.main == null) throw new Error("No main section");

		for (let sectionName in this.content) {
			const section = this.content[sectionName];

			if (!Array.isArray(section.messages))
				throw new Error(`Missing messages: ${this.language}/${sectionName}`);

			if (section.messages.some(this._isMessageInvalid))
				throw new Error(`Invalid messages: ${this.language}/${sectionName}`);

			if (!Array.isArray(section.responses))
				throw new Error(`Missing responses: ${this.language}/${sectionName}`);

			if (section.responses.some(this._isResponseInvalid))
				throw new Error(`Invalid responses: ${this.language}/${sectionName}`);
		}
	}

	_isMessageInvalid = (message) => {
		if (typeof message !== "string") return true;

		const inheritance = ChatScript.getInheritanceOf(message);
		if (inheritance && !this.content[inheritance]) return true;

		return false;
	};

	_isResponseInvalid = (response) => {
		if (typeof response !== "string") return true;

		const inheritance = ChatScript.getInheritanceOf(response);
		if (inheritance) return !this.content[inheritance];

		const link = ChatScript.getLinkOf(response);
		if (!link || (link !== "end" && !this.content[link])) return true;

		return false;
	};
}
