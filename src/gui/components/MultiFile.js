import React, { PureComponent } from "react";
import $path from "path";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { connect } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import filesystem, { Drive } from "../../filesystem";
import locales from "../../locales";
import { bus } from "../../utils";
import CodeEditor from "./CodeEditor";
import TV from "./TV";
import FileSearch from "./widgets/FileSearch";
import HorizontalDragList from "./widgets/HorizontalDragList";
import IconButton from "./widgets/IconButton";
import Tab from "./widgets/Tab";
import styles from "./MultiFile.module.css";

const DELTA_SCROLL = 150;

const EXTENSIONS = {
	".js": [CodeEditor, { language: "javascript" }],
	".asm": [CodeEditor, { language: "asm" }],
	".webp": [TV, { type: "media" }],
	".png": [TV, { type: "media" }],
	".md": [TV, { type: "markdown" }],
	".neees": [TV, { type: "rom", binary: true }],
	".nes": [TV, { type: "rom", binary: true }],
};

class MultiFile extends PureComponent {
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

		const hotkeyProps = this.props.selectedFile
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
					onSelect={(filePath) => {
						const [Component, customArgs] = this._getOptions(filePath);

						if (Component === TV && customArgs.type === "rom") {
							this._openPinnedFile(filePath, Component, customArgs);
						} else {
							this.props.openFile(filePath);
							this._refresh();
						}
					}}
					onBlur={() => {
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
							className={styles.scrollButton}
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
							className={styles.scrollButton}
						/>
					</div>
					<div className={styles.content}>
						{this.props.openFiles.map((it, i) => {
							const [Component, customArgs] = this._getOptions(it);
							return this._renderTabbedFile(it, i, Component, customArgs);
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

	focus = () => {
		if (this._view) this._view.focus();
		else this._container.focus();
	};

	_isReadOnly(filePath) {
		const parsedPath = filePath && $path.parse(filePath);
		return filePath ? Drive.isReadOnlyDir(parsedPath.dir) : true;
	}

	_getOptions(filePath) {
		const extension = $path.parse(filePath).ext.toLowerCase();
		return EXTENSIONS[extension] ?? [CodeEditor, { language: "plaintext" }];
	}

	_renderTab(filePath, isDragging) {
		const isReadOnly = this._isReadOnly(filePath);
		const [Component, customArgs] = this._getOptions(filePath);

		return (
			<Tab
				title={Component.tabIcon + $path.parse(filePath).base}
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
				onPin={() => {
					this.props.closeFile(filePath);
					this._openPinnedFile(filePath, Component, customArgs);
				}}
			/>
		);
	}

	_openPinnedFile(filePath, Component, customArgs) {
		const { args } = this._getFileArgsAndProps(filePath, Component, customArgs);

		bus.emit("pin", {
			Component: React.forwardRef((props, ref) => {
				return this._renderPinnedFile(
					filePath,
					Component,
					{ ...customArgs, ...props },
					ref
				);
			}),
			args,
			level: this._level,
		});
	}

	_renderPinnedFile(filePath, Component, customArgs, ref) {
		const { props } = this._getFileArgsAndProps(
			filePath,
			Component,
			customArgs
		);

		return <Component ref={ref} {...props} />;
	}

	_renderTabbedFile(filePath, index, Component, customArgs) {
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
				key={index}
				ref={(ref) => {
					if (!ref) return;
					ref.initialize(args, this._level, this._layout);
					this._views[filePath] = ref;
				}}
				{...props}
				onKeyDown={this._onKeyDown}
			/>
		);
	}

	_getFileArgsAndProps(filePath, Component, customArgs) {
		const isReadOnly = this._isReadOnly(filePath);
		let props = {};

		switch (Component) {
			case CodeEditor: {
				props = {
					getCode: () => filesystem.read(filePath),
					setCode: (code) => {
						filesystem.write(filePath, code);
					},
					forceReadOnly: isReadOnly,
				};
				break;
			}
			default:
		}

		const args = {
			...this._args,
			...customArgs,
			content: filesystem.read(filePath, { binary: !!customArgs.binary }),
		};

		return { args, props };
	}

	_onMouseDownTabs = (e) => {
		if (e.button === 1) e.preventDefault();
	};

	_onWheelTabs = (e) => {
		const delta = -e.deltaY;
		this._tabsScroll.scrollBy({ left: delta, top: 0, behavior: "instant" });
	};

	_onManualScrollTabs = (delta) => {
		this._tabsScroll.scrollBy({
			left: delta,
			top: 0,
			behavior: "smooth",
		});
	};

	_onKeyDown = (e) => {
		const isCtrlP = e.ctrlKey && e.code === "KeyP";
		const isEsc = e.code === "Escape";

		if (isCtrlP) {
			e.preventDefault();
			this.setState({ isSearching: true });
			return;
		}

		if (isEsc && this.state.isSearching) {
			e.preventDefault();
			this.setState({ isSearching: false });
			return;
		}
	};

	_refresh() {
		setTimeout(() => {
			this.focus();
		});
	}

	get _view() {
		return this._views[this.props.selectedFile];
	}

	get _tabsScroll() {
		return this._tabs.querySelector(".horizontalDragList");
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
