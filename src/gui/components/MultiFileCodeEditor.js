import React, { PureComponent } from "react";
import $path from "path";
import { connect } from "react-redux";
import filesystem from "../../filesystem";
import CodeEditor from "./CodeEditor";
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
	};

	render() {
		if (!this.state._isInitialized) return false;

		return (
			<div className={styles.container}>
				<div className={styles.tabs} tabIndex={-1}>
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
					/>
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
				onClose={() => this._onFileClose(filePath)}
			/>
		);
	}

	_onFileClose(filePath) {
		const newOpenFiles = this.props.openFiles.filter((it) => it !== filePath);

		if (this.props.selectedFile === filePath)
			this.props.setSelectedFile(newOpenFiles[0]);

		this.props.setOpenFiles(newOpenFiles);
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
		setOpenFiles: savedata.setOpenFiles,
		setSelectedFile: savedata.setSelectedFile,
	};
};

export default connect(mapStateToProps, mapDispatchToProps, null, {
	forwardRef: true,
})(MultiFileCodeEditor);
