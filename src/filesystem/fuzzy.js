import _ from "lodash";
import Drive from "./Drive";

export default {
	search(files, input) {
		return _.orderBy(
			files
				.map((it) => this._findMatches(it, input))
				.filter((it) => it != null),
			[
				(it) => this._sanitize(it.file.name).startsWith(this._sanitize(input)),
				(it) => it.groups.length,
				(it) => it.file.filePath.split("/").length,
				(it) => it.file.filePath,
			],
			["desc", "asc", "asc", "asc"]
		);
	},

	_sanitize(input) {
		return input.replace(Drive.PATH_INVALID_CHARACTERS, "").toLowerCase();
	},

	_findMatches(file, input) {
		if (file.isDirectory) return null;

		const cleanInput = this._sanitize(input);
		const indexes = [];
		let path = this._sanitize(file.filePath);
		let baseIndex = 0;

		if (cleanInput.length === 0) return null;

		for (let i = 0; i < cleanInput.length; i++) {
			const character = cleanInput[i];
			const index = path.indexOf(character);
			if (index < 0) return null;

			indexes.push(baseIndex + index);

			path = path.slice(index + 1);
			baseIndex += index + 1;
		}

		const lastSlashIndex = file.filePath.lastIndexOf("/");
		const dirIndexes = [];
		const fileIndexes = [];
		for (let index of indexes) {
			(index <= lastSlashIndex ? dirIndexes : fileIndexes).push(index);
		}

		return {
			file,
			groups: {
				file:
					lastSlashIndex >= 0
						? this._buildMatchGroups(
								file.filePath.slice(lastSlashIndex + 1),
								fileIndexes.map((it) => it - lastSlashIndex - 1)
						  )
						: this._buildMatchGroups(file.filePath, fileIndexes),
				dir:
					lastSlashIndex >= 0
						? this._buildMatchGroups(
								file.filePath.slice(0, lastSlashIndex),
								dirIndexes
						  )
						: null,
			},
		};
	},

	_buildMatchGroups(filePath, indexes) {
		const groups = [];

		let wasMatching = false;
		for (let i = 0; i < filePath.length; i++) {
			let lastGroup;
			const isMatching = indexes.includes(i);

			lastGroup = groups[groups.length - 1];
			if (!lastGroup || wasMatching !== isMatching)
				groups.push({ text: "", matches: isMatching });

			lastGroup = groups[groups.length - 1];
			lastGroup.text += filePath[i];
			lastGroup.matches = isMatching;

			wasMatching = isMatching;
		}

		return groups;
	},
};
