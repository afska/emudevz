export default class ChatScript {
	constructor(content) {
		this.content = content;
	}

	validate() {
		if (this.content.main == null) throw new Error("No main section");

		for (let sectionName in this.content) {
			const section = this.content[sectionName];

			if (!Array.isArray(section.messages))
				throw new Error(`Missing messages: ${sectionName}`);

			if (section.messages.some((it) => typeof it !== "string"))
				throw new Error(`Invalid messages: ${sectionName}`);

			if (!Array.isArray(section.responses))
				throw new Error(`Missing responses: ${sectionName}`);

			if (section.responses.some((it) => typeof it !== "string"))
				throw new Error(`Invalid responses: ${sectionName}`);
		}
	}
}
