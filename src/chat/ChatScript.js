import { LANGUAGES } from "../locales";

export default class ChatScript {
	constructor(content) {
		this.content = content;
	}

	validate() {
		if (this.content.main == null) throw new Error("No main section");

		for (let sectionName in this.content) {
			const section = this.content[sectionName];

			for (let language of LANGUAGES) {
				const localizedSection = section[language];
				const slug = `${sectionName}/${language}`;

				if (localizedSection == null)
					throw new Error(`Missing language: ${slug}`);

				if (!Array.isArray(localizedSection.messages))
					throw new Error(`Missing messages: ${slug}`);

				if (localizedSection.messages.some((it) => typeof it !== "string"))
					throw new Error(`Invalid messages: ${slug}`);

				if (!Array.isArray(localizedSection.responses))
					throw new Error(`Missing responses: ${slug}`);

				if (localizedSection.responses.some((it) => typeof it !== "string"))
					throw new Error(`Invalid responses: ${slug}`);

				// TODO: Check all response links
				// TODO: Check at least one response
			}
		}
	}
}
