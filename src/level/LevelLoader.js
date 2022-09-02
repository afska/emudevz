import Level from "./Level";
import JSZip from "jszip";
import YAML from "yaml";

export default class LevelLoader {
	constructor(zipContent) {
		this.zipContent = zipContent;
	}

	async load() {
		const zip = await JSZip.loadAsync(this.zipContent);
		const rawMeta = await zip.file("meta.json").async("string");
		const rawChat = await zip.file("chat/en.yml").async("string"); // TODO: LOCALIZE

		const meta = JSON.parse(rawMeta);
		const chat = YAML.parse(rawChat);

		meta.chat = chat;

		const level = new Level(meta);
		level.validate();
		return level;
	}
}
