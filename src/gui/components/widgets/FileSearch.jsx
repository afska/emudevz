import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import $path from "path-browserify-esm";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import filesystem, { fuzzy } from "../../../filesystem";
import Level from "../../../level/Level";
import locales from "../../../locales";
import LsCommand from "../../../terminal/commands/fs/LsCommand";
import { toast } from "../../../utils";
import extensions from "../../extensions";
import styles from "./FileSearch.module.css";

const DIRECTORY = "";
const PREFIX = `${DIRECTORY}/`;
const MAX_RESULTS = 10;
const DEFAULT_FILTER = (name) => true;
const CODE_DIRS = ["/code", "/lib"];
const CODE_EXTENSION = ".js";
const CLASS_REGEXP = /\s*class\s+([A-Za-z0-9_]+)/;

export default forwardRef(function FileSearch(props, ref) {
	const {
		isSearching,
		onSelect,
		onBlur,
		className,
		filter = DEFAULT_FILTER,
		...rest
	} = props;

	const [files, setFiles] = useState([]);
	const [input, setInput] = useState("");
	const [selected, setSelected] = useState(0);
	const [matches, setMatches] = useState([]);
	const inputRef = useRef(null);

	// class index: array of { className, filePath, lineNumber }
	const classIndexRef = useRef(null);

	useImperativeHandle(ref, () => ({
		focus: () => inputRef.current?.focus(),
		blur: () => inputRef.current?.blur(),
	}));

	useEffect(() => {
		if (isSearching) {
			let files = [];
			try {
				files = filesystem.lsr(DIRECTORY);
			} catch (e) {
				console.error(`❌ Cannot list directory: ${DIRECTORY}`);
				console.error(e);
			}
			const newFiles = files
				.map((file) => {
					if (!filter(file.filePath)) return null;

					return {
						...file,
						originalFilePath: file.filePath,
						filePath: file.filePath.replace(PREFIX, ""),
					};
				})
				.filter((it) => it != null);

			setFiles(newFiles);
			setInput("");
			setSelected(0);
			inputRef.current.focus();

			if (classIndexRef.current == null) {
				try {
					const index = [];
					for (const dir of CODE_DIRS) {
						let codeFiles = [];
						try {
							codeFiles = filesystem.lsr(dir);
						} catch (e) {
							continue;
						}
						codeFiles.forEach((file) => {
							if (!file.filePath.endsWith(CODE_EXTENSION)) return;

							let content = "";
							try {
								content = filesystem.read(file.filePath);
							} catch (e) {
								return;
							}
							const lines = content.split("\n");
							lines.forEach((line, idx) => {
								const m = line.match(CLASS_REGEXP);
								if (m) {
									index.push({
										className: m[1],
										filePath: file.filePath,
										lineNumber: idx + 1,
									});
								}
							});
						});
					}

					classIndexRef.current = index;
				} catch (e) {
					console.error("❌ Failed to build class index from code dirs", e);
				}
			}
		} else {
			classIndexRef.current = null;
		}
	}, [isSearching, filter]);

	useEffect(() => {
		const fuzzyMatches = fuzzy.search(files, input).slice(0, MAX_RESULTS);
		let classMatches = [];

		if (input !== "") {
			const inputLower = input.toLowerCase();
			classMatches =
				classIndexRef.current
					?.filter((c) => c.className.toLowerCase().includes(inputLower))
					?.sort((a, b) => {
						const ai = a.className.toLowerCase().indexOf(inputLower);
						const bi = b.className.toLowerCase().indexOf(inputLower);
						return ai - bi;
					})
					?.slice(0, MAX_RESULTS)
					?.map((c) => {
						return {
							isClass: true,
							className: c.className,
							file: {
								originalFilePath: c.filePath,
								filePath: c.filePath.replace(PREFIX, ""),
							},
							lineNumber: c.lineNumber,
						};
					}) ?? [];
		}

		const combined = [...classMatches, ...fuzzyMatches];
		setMatches(combined);
		if (selected >= combined.length) setSelected(0);
	}, [input, files, selected]);

	const _onSelect = (filePath, lineNumber, shouldKeepFocus) => {
		if (!Level.current.canLaunchEmulator() && filePath.endsWith(".neees")) {
			toast.error(locales.get("cant_open_emulator"));
			return;
		}

		if (onSelect) onSelect(filePath, lineNumber);

		if (!shouldKeepFocus && onBlur) {
			onBlur();
		} else {
			window.EmuDevz.state.lastOpenNewTabTime = Date.now();
			setTimeout(() => {
				inputRef.current?.focus();
			});
		}
	};

	const _onSelectFile = (file, lineNumber, event) => {
		if (event.button === 2) return;

		_onSelect(file.originalFilePath, lineNumber, event.button === 1);
	};

	window._openPathFromFileSearch_ = (filePath, event) => {
		if (event.button === 2) return;

		_onSelect(filePath, undefined, event.button === 1);
	};

	const tree = LsCommand.getTree(DIRECTORY, false, undefined, filter).replace(
		/\[\[\[(.+)\]\]\]/g,
		(__, filePath) => {
			const icon = extensions.getTabIcon(filePath);
			const parsedPath = $path.parse(filePath);
			const name = parsedPath.name + parsedPath.ext;

			return (
				icon +
				`<span onmousedown="javascript:_openPathFromFileSearch_('${filePath}', event)" class="${styles.treeLink}">${name}</span>`
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
						{matches.map((match, i) =>
							match.isClass
								? _renderClassMatch(match, i)
								: _renderFileMatch(match, i)
						)}
					</div>
				)}
			</div>
		);
	};

	const _renderClassMatch = (match, i) => {
		const file = match.file;
		const displayName = match.className;
		const inputLower = input.toLowerCase();
		const nameLower = displayName.toLowerCase();
		const matchIndex = input ? nameLower.indexOf(inputLower) : -1;
		const before =
			matchIndex >= 0 ? displayName.slice(0, matchIndex) : displayName;
		const matchText =
			matchIndex >= 0
				? displayName.slice(matchIndex, matchIndex + input.length)
				: "";
		const after =
			matchIndex >= 0 ? displayName.slice(matchIndex + input.length) : "";

		return (
			<div
				key={`class-${file.originalFilePath}-${match.lineNumber}`}
				className={classNames(styles.result, selected === i && styles.selected)}
				onMouseMove={() => setSelected(i)}
				onMouseDown={(e) => {
					e.preventDefault();
					_onSelectFile(file, match.lineNumber, e);
				}}
			>
				<span>📚 </span>
				<span>
					{matchIndex >= 0 ? (
						<>
							{before}
							<span className={styles.highlight}>{matchText}</span>
							{after}
						</>
					) : (
						displayName
					)}
				</span>
				<span style={{ marginLeft: 6 }} className={styles.path}>
					({file.filePath})
				</span>
			</div>
		);
	};

	const _renderFileMatch = (match, i) => {
		const { file, groups } = match;
		const icon = extensions.getTabIcon(file.originalFilePath) + " ";

		return (
			<div
				key={i}
				className={classNames(styles.result, selected === i && styles.selected)}
				onMouseMove={() => setSelected(i)}
				onMouseDown={(e) => {
					e.preventDefault();
					_onSelectFile(file, undefined, e);
				}}
			>
				<span>{icon}</span>
				{_renderGroups(groups.file)}
				{_renderGroups(groups.dir, true)}
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
			if (match != null) {
				if (match.isClass) _onSelectFile(match.file, match.lineNumber);
				else _onSelectFile(match.file);
			}
			e.preventDefault();
			return;
		}
	};

	if (!isSearching) return false;
	return render();
});
