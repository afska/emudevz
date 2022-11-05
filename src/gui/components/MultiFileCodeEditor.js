import React, { PureComponent } from "react";
import $path from "path";
import { connect } from "react-redux";
import classNames from "classnames";
import filesystem, { Drive } from "../../filesystem";
import CodeEditor from "./CodeEditor";
import FileSearch from "./widgets/FileSearch";
import HorizontalDragList from "./widgets/HorizontalDragList";
import Tab from "./widgets/Tab";
import styles from "./MultiFileCodeEditor.module.css";

class MultiFileCodeEditor extends PureComponent {
	async initialize(args, level, layout) {
		this._args = args;
		this._level = level;
		this._layout = layout;

		this.setState({ _isInitialized: true });
	}

	state = {
		_isInitialized: false,
		isSearching: false,
	};

	render() {
		if (!this.state._isInitialized) return false;

		const { isSearching } = this.state;

		const parsedPath = $path.parse(this.props.selectedFile);
		const isReadOnlyDir = Drive.READONLY_PATHS.some(
			(it) => parsedPath.dir === it
		);

		return (
			<div className={styles.container}>
				<FileSearch
					isSearching={isSearching}
					onSelect={(filePath) => {
						this.props.openFile(filePath);
					}}
					onBlur={() => {
						this.setState({ isSearching: false });
						this._editor.focus();
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
							}}
						/>
					</div>
					<div className={styles.content}>
						<CodeEditor
							ref={(ref) => {
								if (!ref) return;
								ref.initialize(this._args, this._level, this._layout);
								this._editor = ref;
							}}
							getCode={() => filesystem.read(this.props.selectedFile)}
							setCode={(code) => {
								filesystem.write(this.props.selectedFile, code);
							}}
							forceReadOnly={isReadOnlyDir}
							onKeyDown={this._onKeyDown}
						/>
					</div>
				</div>
			</div>
		);
	}

	focus = () => {
		this._editor.focus();
	};

	_renderTab(filePath, isDragging) {
		return (
			<Tab
				title={$path.parse(filePath).base}
				active={this.props.selectedFile === filePath}
				dragging={isDragging}
				onSelect={() => {
					this.props.setSelectedFile(filePath);
				}}
				canClose={this.props.openFiles.length > 1}
				onClose={() => this.props.closeFile(filePath)}
			/>
		);
	}

	_onMouseDownTabs = (e) => {
		if (e.button === 1) e.preventDefault();
	};

	_onWheelTabs = (e) => {
		this._tabs.scrollBy(-e.deltaY, 0);
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
})(MultiFileCodeEditor);
