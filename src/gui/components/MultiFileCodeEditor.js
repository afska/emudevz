import React, { PureComponent } from "react";
import $path from "path";
// import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { FaTimes } from "react-icons/fa";
import Level from "../../level/Level";
import { bus } from "../../utils";
import CodeEditor from "./CodeEditor";
import HorizontalDragList from "./widgets/HorizontalDragList";
import IconButton from "./widgets/IconButton";
import Tab from "./widgets/Tab";
import styles from "./MultiFileCodeEditor.module.css";

export default class MultiFileCodeEditor extends PureComponent {
	async initialize(args, level, layout) {
		this._args = args;
		this._level = level;
		this._layout = layout;

		// TODO: INITIALIZE EDITORS
	}

	state = {
		openFiles: ["/code/index.js", "/code/CPU.js", "/code/Cartridge.js"],
		selectedFile: "/code/index.js",
	};

	render() {
		return (
			<div className={styles.container}>
				<div className={styles.tabs}>
					<HorizontalDragList
						items={this.state.openFiles.map((filePath) => ({
							id: filePath,
							render: (__, index) => (
								<Tab
									title={$path.parse(filePath).name}
									active={this.state.selectedFile === filePath}
									onSelect={() => this.setState({ selectedFile: filePath })}
									canClose={this.state.openFiles.length > 1}
									onClose={() => {
										const newOpenFiles = this.state.openFiles.filter(
											(it) => it !== filePath
										);
										this.setState({
											openFiles: newOpenFiles,
											selectedFile:
												filePath === this.state.selectedFile
													? newOpenFiles[0]
													: this.state.selectedFile,
										});
									}}
									tabIndex={index + 1}
								/>
							),
						}))}
						onSort={(updatedItems) =>
							this.setState({ openFiles: updatedItems.map((it) => it.id) })
						}
					/>
				</div>
				<div className={styles.content}>content</div>

				{/*<Tabs defaultActiveKey="/code/index.js" transition={false}>
					<Tab
						eventKey="/code/index.js"
						title={
							<span
								onClick={(e) => {
									// TODO: FOCUS CodeEditor (grab ref and call .focus())
									// don't add onClick, use instead:
									//       activeKey={key}
									//       onSelect={(k) => setKey(k)}
								}}
							>
								index.js{" "}
								<IconButton
									Icon={FaTimes}
									onClick={() => alert("hello")}
									className={styles.closeButton}
								/>
							</span>
						}
					>
						<CodeEditor
							ref={(e) => {
								if (!e) return;
								e.initialize({ readOnly: true }, Level.current);
							}}
							getCode={() => "=> index.js content"}
							setCode={() => {}}
						/>
					</Tab>
					<Tab
						eventKey="/code/cpu.js"
						title={
							<span>
								CPU.js{" "}
								<IconButton
									Icon={FaTimes}
									onClick={() => alert("hello")}
									className={styles.closeButton}
								/>
							</span>
						}
					>
						<CodeEditor
							ref={(e) => {
								if (!e) return;
								e.initialize({ readOnly: true }, Level.current);
							}}
							getCode={() => "=> CPU.js content"}
							setCode={() => {}}
						/>
					</Tab>
					<Tab
						eventKey="/code/cartridge.js"
						title={
							<span>
								Cartridge.js{" "}
								<IconButton
									Icon={FaTimes}
									onClick={() => alert("hello")}
									className={styles.closeButton}
								/>
							</span>
						}
					>
						<CodeEditor
							ref={(e) => {
								if (!e) return;
								e.initialize({ readOnly: true }, Level.current);
							}}
							getCode={() => "=> Cartridge.js content"}
							setCode={() => {}}
						/>
					</Tab>
				</Tabs>*/}
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
		// TODO: FOCUS CURRENT TAB
	};
}
