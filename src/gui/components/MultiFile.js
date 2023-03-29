import React, { PureComponent } from "react";
import $path from "path";
import { connect } from "react-redux";
import classNames from "classnames";
import filesystem, { Drive } from "../../filesystem";
import locales from "../../locales";
import { bus } from "../../utils";
import CodeEditor from "./CodeEditor";
import TV from "./TV";
import FileSearch from "./widgets/FileSearch";
import HorizontalDragList from "./widgets/HorizontalDragList";
import Tab from "./widgets/Tab";
import styles from "./MultiFile.module.css";

const EXTENSIONS = {
	".js": [CodeEditor, { language: "javascript" }],
	".asm": [CodeEditor, { language: "asm" }],
	".webp": [TV, { type: "media" }],
	".png": [TV, { type: "media" }],
	".md": [TV, { type: "markdown" }],
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

		return (
			<div className={styles.container}>
				<FileSearch
					isSearching={isSearching}
					onSelect={(filePath) => {
						this.props.openFile(filePath);
						this._refresh();
					}}
					onBlur={() => {
						this.setState({ isSearching: false });
						this._view?.focus();
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
					</div>
					<div className={styles.content}>
						{this.props.openFiles.map((it, i) => {
							const [Component, customArgs] = this._getOptions(it);
							return this._renderTabbedFile(it, i, Component, customArgs);
						})}
						{!this.props.selectedFile && (
							<div className={styles.empty}>{locales.get("no_open_files")}</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	focus = () => {
		this._view?.focus();
	};

	_isReadOnly(filePath) {
		const parsedPath = filePath && $path.parse(filePath);
		return filePath ? Drive.isReadOnlyDir(parsedPath.dir) : true;
	}

	_getOptions(filePath) {
		const extension = $path.parse(filePath).ext;
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
				canClose={this.props.openFiles.length > 1}
				onClose={() => {
					this.props.closeFile(filePath);
					this._refresh();
				}}
				canPin={isReadOnly}
				onPin={() => {
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
			content: filesystem.read(filePath),
		};

		return { args, props };
	}

	_onMouseDownTabs = (e) => {
		if (e.button === 1) e.preventDefault();
	};

	_onWheelTabs = (e) => {
		const delta = e.deltaY;
		this._tabs.scrollBy({ left: -delta, top: 0, behavior: "instant" });
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
			this._view?.focus();
		});
	}

	get _view() {
		return this._views[this.props.selectedFile];
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
