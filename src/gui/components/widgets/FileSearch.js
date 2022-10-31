import React, { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import filesystem, { fuzzy } from "../../../filesystem";
import locales from "../../../locales";
import styles from "./FileSearch.module.css";

const FOLDER = "/code";
const PREFIX = `${FOLDER}/`;
const MAX_RESULTS = 10;

export default function FileSearch(props) {
	const { isSearching, onSelect, onBlur, className, ...rest } = props;

	const [files, setFiles] = useState([]);
	const [input, setInput] = useState("");
	const [selected, setSelected] = useState(0);
	const inputRef = useRef(null);
	useEffect(() => {
		if (isSearching) {
			const newFiles = filesystem.lsr(FOLDER).map((file) => {
				return { ...file, filePath: file.filePath.replace(PREFIX, "") };
			});

			setFiles(newFiles);
			setInput("");
			setSelected(0);
			inputRef.current.focus();
		}
	}, [isSearching]);

	const matches = fuzzy.search(files, input).slice(0, MAX_RESULTS);

	const render = () => {
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

				{matches.length > 0 && (
					<div className={styles.results}>
						{matches.map(({ file, groups }, i) => {
							return (
								<div
									key={i}
									className={classNames(
										styles.result,
										selected === i && styles.selected
									)}
									onMouseMove={() => setSelected(i)}
									onMouseDown={(e) => {
										e.preventDefault();
										_onSelect(file);
									}}
								>
									{_renderGroups(groups.file)}
									{_renderGroups(groups.dir, true)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		);
	};

	const _renderGroups = (groups, isPath) => {
		if (groups == null) return null;

		return groups.map((it, i) => {
			return (
				<span
					key={i}
					className={classNames(
						it.matches && styles.highlight,
						isPath && styles.path,
						isPath && i === 0 && styles.pathStart
					)}
				>
					{it.text}
				</span>
			);
		});
	};

	const _onKeyDown = (e) => {
		const isEsc = e.code === "Escape";
		const isArrowDown = e.code === "ArrowDown";
		const isArrowUp = e.code === "ArrowUp";
		const isEnter = e.code === "Enter";

		if (isEsc) {
			e.preventDefault();
			if (onBlur) onBlur();
			return;
		}

		if (isArrowDown) {
			setSelected((selected + 1) % matches.length);
			e.preventDefault();
			return;
		}

		if (isArrowUp) {
			setSelected((selected === 0 ? matches.length : selected) - 1);
			e.preventDefault();
			return;
		}

		if (isEnter) {
			const match = matches[selected];
			if (match != null) _onSelect(match.file);
			e.preventDefault();
			return;
		}
	};

	const _onSelect = (file) => {
		onSelect(PREFIX + file.filePath);
		onBlur();
	};

	if (!isSearching) return false;
	return render();
}
