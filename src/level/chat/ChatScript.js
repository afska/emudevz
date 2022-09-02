import _ from "lodash";

export default class ChatScript {
	constructor(content) {
		_.extend(this, content);
	}

	validate() {
		if (this.main == null) throw new Error("No main section");

		for (let sectionName in this) {
			const section = this[sectionName];

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
