import React, { PureComponent } from "react";
import $path from "path";
import filesystem from "../../filesystem";
import { bus } from "../../utils";
import CodeEditor from "./CodeEditor";
import HorizontalDragList from "./widgets/HorizontalDragList";
import Tab from "./widgets/Tab";
import styles from "./MultiFileCodeEditor.module.css";

export default class MultiFileCodeEditor extends PureComponent {
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
						items={this._memory.openFiles.map((filePath) => ({
							id: filePath,
							render: (isDragging) => this._renderTab(filePath, isDragging),
						}))}
						onSort={(updatedItems) => {
							this._setMemory((content) => {
								content.openFiles = updatedItems.map((it) => it.id);
							});
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
						getCode={() => filesystem.read(this._memory.selectedFile)}
						setCode={(code) => {
							filesystem.write(this._memory.selectedFile, code);
						}}
					/>
				</div>
			</div>
		);
	}

	componentDidMount() {
		this._subscriber = bus.subscribe({
			"level-memory-changed": () => this.forceUpdate(),
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	focus = () => {
		this._editor.focus();
	};

	_renderTab(filePath, isDragging) {
		return (
			<Tab
				title={$path.parse(filePath).base}
				active={this._memory.selectedFile === filePath}
				dragging={isDragging}
				onSelect={() => {
					this._setMemory((content) => {
						content.selectedFile = filePath;
					});
				}}
				canClose={this._memory.openFiles.length > 1}
				onClose={() => this._onFileClose(filePath)}
			/>
		);
	}

	_onFileClose(filePath) {
		const newOpenFiles = this._memory.openFiles.filter((it) => it !== filePath);

		if (this._memory.selectedFile === filePath)
			this._setMemory((content) => {
				content.selectedFile = newOpenFiles[0];
			});

		this._setMemory((content) => {
			content.openFiles = newOpenFiles;
		});
	}

	get _memory() {
		return this._level.memory.content;
	}

	_setMemory(change) {
		this._level.setMemory((memory) => {
			change(memory.content);
		});
	}
}
