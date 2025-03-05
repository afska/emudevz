import React, { useEffect, useRef, useState } from "react";
import $path from "path-browserify-esm";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import filesystem, { fuzzy } from "../../../filesystem";
import Level from "../../../level/Level";
import locales from "../../../locales";
import LsCommand from "../../../terminal/commands/fs/LsCommand";
import extensions from "../../extensions";
import styles from "./FileSearch.module.css";

const DIRECTORY = "";
const PREFIX = `${DIRECTORY}/`;
const MAX_RESULTS = 10;

export default function FileSearch(props) {
	const { isSearching, onSelect, onBlur, className, ...rest } = props;

	const [files, setFiles] = useState([]);
	const [input, setInput] = useState("");
	const [selected, setSelected] = useState(0);
	const [matches, setMatches] = useState([]);
	const inputRef = useRef(null);
	useEffect(() => {
		if (isSearching) {
			let files = [];
			try {
				files = filesystem.lsr(DIRECTORY);
			} catch (e) {
				console.error(`❌ Cannot list directory: ${DIRECTORY}`);
				console.error(e);
			}
			const newFiles = files.map((file) => {
				return {
					...file,
					originalFilePath: file.filePath,
					filePath: file.filePath.replace(PREFIX, ""),
				};
			});

			setFiles(newFiles);
			setInput("");
			setSelected(0);
			inputRef.current.focus();
		}
	}, [isSearching]);

	useEffect(() => {
		const matches = fuzzy.search(files, input).slice(0, MAX_RESULTS);
		setMatches(matches);
		if (selected >= matches.length) setSelected(0);
	}, [input, files, selected]);

	window._openPath_ = (filePath) => {
		onSelect(filePath);
	};

	const tree = LsCommand.getTree(DIRECTORY, false).replace(
		/\[\[\[(.+)\]\]\]/g,
		(__, filePath) => {
			const icon = extensions.getTabIcon(filePath);
			const parsedPath = $path.parse(filePath);
			const name = parsedPath.name + parsedPath.ext;

			return (
				icon +
				`<span onclick="javascript:_openPath_('${filePath}')" class="${styles.treeLink}">${name}</span>`
			);
		}
	);

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
				{matches.length === 0 && tree && (
					<pre
						onMouseDown={(e) => {
							e.preventDefault();
						}}
						className={styles.tree}
						dangerouslySetInnerHTML={{ __html: tree }}
					/>
				)}
				{matches.length > 0 && (
					<div className={styles.results}>
						{matches.map(({ file, groups }, i) => {
							const icon = extensions.getTabIcon(file.originalFilePath) + " ";

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
									<span>{icon}</span>
									{_renderGroups(groups.file)}
									{_renderGroups(groups.dir, true)}
								</div>
							);
						})}
					</div>
				)}
				{!Level.current.canLaunchEmulator() &&
					matches[selected]?.file.filePath.endsWith(".neees") && (
						<pre className={styles.warning}>
							{locales.get("cant_open_emulator")}
						</pre>
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
		const isCtrlP = e.ctrlKey && e.code === "KeyP";

		if (isEsc || isCtrlP) {
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
		onSelect(file.originalFilePath);
		onBlur();
	};

	if (!isSearching) return false;
	return render();
}
