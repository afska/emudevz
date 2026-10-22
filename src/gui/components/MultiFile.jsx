import React, { PureComponent } from "react";
import $path from "path-browserify-esm";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { connect } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import filesystem, { Drive } from "../../filesystem";
import Level from "../../level/Level";
import locales from "../../locales";
import Terminal from "../../terminal/Terminal";
import OpenCommand from "../../terminal/commands/fs/OpenCommand";
import { bus } from "../../utils";
import { checkKeyBinding } from "../../utils/keyBindings";
import extensions from "../extensions";
import { sfx } from "../sound";
import CodeEditor from "./CodeEditor";
import TV from "./TV";
import FileSearch from "./widgets/FileSearch";
import HorizontalDragList from "./widgets/HorizontalDragList";
import IconButton from "./widgets/IconButton";
import Tab from "./widgets/Tab";
import styles from "./MultiFile.module.css";

const DELTA_SCROLL = 150;
const SEARCH_BLUR_DEBOUNCE_TIME = 100;

class MultiFile extends PureComponent {
	static get id() {
		return "MultiFile";
	}

	async initialize(args, level, layout) {
		this._args = args;
		this._level = level;
		this._layout = layout;
		this._views = {};

		this.setState({ _isInitialized: true });
	}

	state = {
		_isInitialized: false,
		isSearching: false,
	};

	render() {
		if (!this.state._isInitialized) return false;

		const { isSearching } = this.state;

		const hotkeyProps = !_.isEmpty(this.props.openFiles)
			? {}
			: {
					tabIndex: 0,
					onKeyDown: this._onKeyDown,
			  };

		return (
			<div
				className={styles.container}
				{...hotkeyProps}
				ref={(ref) => {
					this._container = ref;
				}}
			>
				<FileSearch
					isSearching={isSearching}
					onSelect={(filePath, lineNumber) => {
						const [Component, customArgs] = extensions.getOptions(filePath);

						if (Component === TV && customArgs.type === "rom") {
							OpenCommand.open(filePath);
							this._refresh();
						} else {
							this.props.openFile(filePath);
							this._refresh(lineNumber);
						}
					}}
					onBlur={() => {
						if (
							Date.now() - window.EmuDevz.state.lastOpenNewTabTime <
							SEARCH_BLUR_DEBOUNCE_TIME
						)
							return;

						this.setState({ isSearching: false });
						this.focus();
					}}
				/>

				<div
					className={classNames(
						styles.innerContainer,
						isSearching ? styles.unselected : styles.selected
					)}
				>
					<div
						className={styles.tabs}
						tabIndex={-1}
						ref={(ref) => {
							if (!ref) return;
							this._tabs = ref;
						}}
						onMouseDown={this._onMouseDownTabs}
						onWheel={this._onWheelTabs}
					>
						<IconButton
							Icon={FaChevronLeft}
							tooltip={locales.get("scroll_left")}
							onClick={() => this._onManualScrollTabs(-DELTA_SCROLL)}
							className={styles.tabButton}
						/>
						<HorizontalDragList
							items={this.props.openFiles.map((filePath) => ({
								id: filePath,
								render: (isDragging) => this._renderTab(filePath, isDragging),
							}))}
							onSort={(updatedItems) => {
								this.props.setOpenFiles(updatedItems.map((it) => it.id));
								this._refresh();
							}}
						/>
						<IconButton
							Icon={FaChevronRight}
							tooltip={locales.get("scroll_right")}
							onClick={() => this._onManualScrollTabs(DELTA_SCROLL)}
							className={styles.tabButton}
						/>
						<IconButton
							Icon={FaSearch}
							tooltip={locales.get("search_files")}
							onClick={this._search}
							className={styles.tabButton}
						/>
					</div>
					<div className={styles.content}>
						{this.props.openFiles.map((it) => {
							const [Component, customArgs] = extensions.getOptions(it);
							return this._renderTabbedFile(it, Component, customArgs);
						})}
						{_.isEmpty(this.props.openFiles) && (
							<div
								className={styles.empty}
								dangerouslySetInnerHTML={{
									__html: locales.get("no_open_files"),
								}}
							/>
						)}
					</div>
				</div>
			</div>
		);
	}

	componentDidMount() {
		this._subscriber = bus.subscribe({
			"file-search": this._focusAndSearch,
			"file-opened": this._onFileOpened,
			"file-closed": this._onFileClosed,
			"file-written": () => this.forceUpdate(),
			"root-enabled": () => this.forceUpdate(),
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	focus = () => {
		if (this._view) this._view.focus();
		else this._container.focus();
	};

	_focusAndSearch = () => {
		Level.current.closeDebugger();
		const name = this._layout.getInstanceName(this);
		this._layout.focus(name);
		this._search();
	};

	_onFileOpened = ({ filePath }) => {
		sfx.play("open");
		setTimeout(() => {
			this._scrollToTab(filePath);
		});
	};

	_onFileClosed = () => {
		sfx.play("close");
		this._scrollToSelectedTab();
	};

	_search = () => {
		this.setState({ isSearching: true });
	};

	_isReadOnly(filePath) {
		const parsedPath = filePath && $path.parse(filePath);
		return filePath ? Drive.isReadOnlyDir(parsedPath.dir) : true;
	}

	_renderTab(filePath, isDragging) {
		const isReadOnly = this._isReadOnly(filePath);
		const tabIcon = extensions.getTabIcon(filePath);
		const [Component, customArgs] = extensions.getOptions(filePath);

		const base = $path.parse(filePath).base;
		const isMd = base.endsWith(".md");
		const isMdTxt = base.endsWith(".md.txt");
		const canToggleMd = !isReadOnly && (isMd || isMdTxt);
		const onToggleMd = () => {
			try {
				const dir = $path.parse(filePath).dir;
				const newBase = isMd
					? base + ".txt"
					: base.replace(/\.md\.txt$/, ".md");
				const newPath = (dir === "/" ? "" : dir) + "/" + newBase;

				if (filesystem.exists(newPath)) return;

				filesystem.mv(filePath, newPath);
				this.props.closeFile(filePath);
				this.props.openFile(newPath);
				this.props.setSelectedFile(newPath);
				this._refresh();
			} catch (err) {
				toast.error(locales.get("operation_failed"));
			}
		};

		return (
			<Tab
				data-filepath={filePath}
				title={tabIcon + $path.parse(filePath).base}
				active={this.props.selectedFile === filePath}
				dragging={isDragging}
				onSelect={() => {
					this.props.setSelectedFile(filePath);
					this._refresh();
				}}
				canClose={true}
				onClose={() => {
					this.props.closeFile(filePath);
					this._refresh();
				}}
				canPin={this._layout.supportsPin && isReadOnly}
				canToggleMd={canToggleMd}
				onToggleMd={onToggleMd}
				onPin={() => {
					this.props.closeFile(filePath);
					this._openPinnedFile(filePath, Component, customArgs);
				}}
				tooltip={filePath}
			/>
		);
	}

	_openPinnedFile(filePath, Component, customArgs) {
		const { args } = this._getFileArgsAndProps(filePath, Component, customArgs);

		bus.emit("pin", {
			Component: React.forwardRef((props, ref) => {
				return this._renderPinnedFile(filePath, Component, ref);
			}),
			args: { ...args, isPinned: true },
			level: this._level,
		});
	}

	_renderPinnedFile(filePath, Component, ref) {
		const { props } = this._getFileArgsAndProps(filePath, Component);

		return <Component ref={ref} {...props} />;
	}

	_renderTabbedFile(filePath, Component, customArgs) {
		const { args, props } = this._getFileArgsAndProps(
			filePath,
			Component,
			customArgs
		);

		return (
			<Component
				style={{
					display: filePath === this.props.selectedFile ? "block" : "none",
				}}
				key={filePath}
				ref={(ref) => {
					if (!ref) return;
					ref.initialize(args, this._level, this._layout);
					this._views[filePath] = ref;
				}}
				{...props}
				addon={this._renderTemplateAddon(filePath)}
				onKeyDown={this._onKeyDown}
				filePath={filePath}
			/>
		);
	}

	_renderTemplateAddon(filePath) {
		if (!filePath.startsWith(Drive.TMPL_DIR)) return false;

		const workingCopyPath = filePath.replace(Drive.TMPL_DIR, Drive.CODE_DIR);
		const isFileCreated = filesystem.exists(workingCopyPath);

		const onClick = () => {
			if (isFileCreated) OpenCommand.open(workingCopyPath);
			else Terminal.tryCreateFile(workingCopyPath, filesystem.read(filePath));
		};

		return (
			<div className={styles.template} onClick={onClick}>
				<span>
					{locales.get("template_file")}
					<br />
					<span className={styles.templateClick}>
						{isFileCreated
							? locales.get("template_file_click_existing")
							: locales.get("template_file_click_unexisting")}
					</span>
					<br />
					<strong className={styles.templateClick}>📝 {workingCopyPath}</strong>
				</span>
			</div>
		);
	}

	_getFileArgsAndProps(filePath, Component, customArgs = {}) {
		const isReadOnly = this._isReadOnly(filePath);
		let props = {};

		switch (Component) {
			case CodeEditor: {
				props = {
					getCode: () => {
						try {
							const code = filesystem.read(filePath);
							return code;
						} catch (err) {
							return "";
						}
					},
					setCode: (code) => {
						try {
							filesystem.write(filePath, code, { silent: true });
						} catch (err) {
							console.error(err);
							this._closeSelectedFile();
						}
					},
					forceReadOnly: isReadOnly,
					disableCompileDebounce: true,
				};
				break;
			}
			default:
		}

		let content = null;
		try {
			content = filesystem.read(filePath, { binary: !!customArgs.binary });
		} catch (err) {
			console.error(`❌ Cannot read file: ${filePath}`);
			console.error(err);
		}

		const args = {
			...this._args,
			...customArgs,
			content,
		};

		return { args, props };
	}

	_onMouseDownTabs = (e) => {
		if (e.button === 1) e.preventDefault();
	};

	_onWheelTabs = (e) => {
		const delta = -e.deltaY;
		this._tabsScroll?.scrollBy({ left: delta, top: 0, behavior: "instant" });
	};

	_onManualScrollTabs = (delta) => {
		this._tabsScroll?.scrollBy({
			left: delta,
			top: 0,
			behavior: "smooth",
		});
	};

	_scrollToSelectedTab = () => {
		this._scrollToTab(this.props.selectedFile);
	};

	_scrollToTab = (filePath) => {
		const scroll = this._tabsScroll;
		if (!scroll || !filePath) return;

		const element = Array.from(scroll.querySelectorAll("[data-filepath]")).find(
			(it) => it.dataset.filepath === filePath
		);
		if (!element) return;

		const containerRect = scroll.getBoundingClientRect();
		const rect = element.getBoundingClientRect();
		const targetLeft =
			scroll.scrollLeft +
			(rect.left - containerRect.left) -
			containerRect.width / 2 +
			rect.width / 2;

		scroll.scrollTo({ left: targetLeft, behavior: "smooth" });
	};

	_closeSelectedFile = () => {
		if (_.isEmpty(this.props.openFiles)) return;

		this.props.closeFile(this.props.selectedFile);
	};

	_onKeyDown = (e) => {
		const isEsc = e.code === "Escape";

		if (checkKeyBinding(e, "fileSearch")) {
			e.preventDefault();
			this._search();
			return;
		}

		const isCloseFile =
			checkKeyBinding(e, "closeFile") ||
			(window.EmuDevz.isDesktop() && checkKeyBinding(e, "closeFileDesktop"));
		if (isCloseFile) {
			e.preventDefault();
			this._closeSelectedFile();
			this._refresh();
			return;
		}

		if (window.EmuDevz.isDesktop()) {
			const isNextTab = checkKeyBinding(e, "nextTab");
			const isPreviousTab = checkKeyBinding(e, "previousTab");

			if (isNextTab || isPreviousTab) {
				e.preventDefault();
				const { openFiles, selectedFile } = this.props;
				if (_.isEmpty(openFiles)) return;

				const length = openFiles.length;
				const index = Math.max(0, openFiles.indexOf(selectedFile));
				const next = (index + (isPreviousTab ? -1 : 1) + length) % length;
				const nextFile = openFiles[next];
				this._scrollToTab(nextFile);
				this.props.setSelectedFile(nextFile);
				this._refresh();
				return;
			}
		}

		if (isEsc && this.state.isSearching) {
			e.preventDefault();
			this.setState({ isSearching: false });
			return;
		}
	};

	_refresh(lineNumber = null) {
		setTimeout(() => {
			this.focus();

			if (lineNumber != null) {
				bus.emit("highlight", { line: lineNumber - 1, reason: "file-search" });
			}
		});
	}

	get _view() {
		return this._views[this.props.selectedFile];
	}

	get _tabsScroll() {
		return this._tabs?.querySelector(".horizontalDragList");
	}
}

const mapStateToProps = ({ savedata }) => {
	return {
		openFiles: savedata.openFiles,
		selectedFile: savedata.selectedFile,
	};
};
const mapDispatchToProps = ({ savedata }) => {
	return {
		openFile: savedata.openFile,
		setOpenFiles: savedata.setOpenFiles,
		setSelectedFile: savedata.setSelectedFile,
		closeFile: savedata.closeFile,
	};
};

export default connect(mapStateToProps, mapDispatchToProps, null, {
	forwardRef: true,
})(MultiFile);
