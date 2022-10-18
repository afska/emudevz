import React, { PureComponent } from "react";
import $path from "path";
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
		openFiles: ["/code/index.js", "/code/CPU.js", "/code/Cartridge.js"],
		selectedFile: "/code/index.js",
	};

	render() {
		if (!this.state._isInitialized) return false;

		return (
			<div className={styles.container}>
				<div className={styles.tabs} tabIndex={-1}>
					<HorizontalDragList
						items={this.state.openFiles.map((filePath) => ({
							id: filePath,
							render: () => this._renderTab(filePath),
						}))}
						onSort={(updatedItems) =>
							this.setState({ openFiles: updatedItems.map((it) => it.id) })
						}
					/>
				</div>
				<div className={styles.content}>
					<CodeEditor
						ref={(ref) => {
							if (!ref) return;
							ref.initialize(this._args, this._level, this._layout);
							this._editor = ref;
						}}
						getCode={() => "=> content"}
						setCode={() => {}}
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

	_renderTab(filePath) {
		return (
			<Tab
				title={$path.parse(filePath).base}
				active={this.state.selectedFile === filePath}
				onSelect={() => this.setState({ selectedFile: filePath })}
				canClose={this.state.openFiles.length > 1}
				onClose={() => this._onFileClose(filePath)}
			/>
		);
	}

	_onFileClose(filePath) {
		const newOpenFiles = this.state.openFiles.filter((it) => it !== filePath);

		this.setState(
			{
				openFiles: newOpenFiles,
			},
			() => {
				this.setState({
					selectedFile:
						this.state.selectedFile === filePath
							? newOpenFiles[0]
							: this.state.selectedFile,
				});
			}
		);
	}
}
