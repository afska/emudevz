import React, { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import _ from "lodash";
import filesystem from "../../../filesystem";
import Drive from "../../../filesystem/Drive";
import locales from "../../../locales";
import styles from "./FileSearch.module.css";

const FOLDER = "/code";

export default function FileSearch(props) {
	const { isSearching, onOpen, onBlur, className, ...rest } = props;

	const [files, setFiles] = useState([]);
	const [input, setInput] = useState("");
	const inputRef = useRef(null);
	useEffect(() => {
		if (isSearching) {
			setFiles(filesystem.lsr(FOLDER));
			setInput("");
			inputRef.current.focus();
		}
	}, [isSearching]);

	const render = () => {
		const matches = _.orderBy(
			files.map(_findMatches).filter((it) => it != null),
			[(it) => it.groups.length],
			["asc"]
		);

		return (
			<div className={classNames(styles.container, className)} {...rest}>
				<Form.Control
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder={locales.get("enter_a_file_name")}
					spellCheck={false}
					className={styles.input}
					onBlur={onBlur}
					onKeyDown={_onKeyDown}
					ref={inputRef}
				/>

				<div className={styles.results}>
					{matches.map(({ file, groups }, i) => {
						return (
							<div key={i} className={styles.result}>
								{groups.map((it, j) => {
									return (
										<span
											key={j}
											className={it.matches ? styles.highlight : undefined}
										>
											{it.text}
										</span>
									);
								})}
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	const _findMatches = (file) => {
		const cleanInput = input
			.replace(Drive.PATH_INVALID_CHARACTERS, "")
			.toLowerCase();
		const indexes = [];
		let path = file.filePath.toLowerCase();
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

		return { file, groups: _buildMatchGroups(file.filePath, indexes) };
	};

	const _buildMatchGroups = (filePath, indexes) => {
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
	};

	const _onKeyDown = (e) => {
		const isEsc = e.code === "Escape";

		if (isEsc) {
			e.preventDefault();
			if (onBlur) onBlur();
			return;
		}
	};

	if (!isSearching) return false;
	return render();
}
