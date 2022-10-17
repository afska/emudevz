import React, { PureComponent } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { FaTimes } from "react-icons/fa";
import Level from "../../level/Level";
import { bus } from "../../utils";
import CodeEditor from "./CodeEditor";
import HorizontalDragList from "./widgets/HorizontalDragList";
import IconButton from "./widgets/IconButton";
import styles from "./MultiFileCodeEditor.module.css";

const grid = 8;

const getListStyle = (isDraggingOver) => ({
	background: isDraggingOver ? "lightblue" : "lightgrey",
	display: "flex",
	padding: grid,
	overflow: "auto",
});

const getItemStyle = (isDragging, draggableStyle) => ({
	// some basic styles to make the items look a bit nicer
	userSelect: "none",
	padding: grid * 2,
	margin: `0 ${grid}px 0 0`,

	// change background colour if dragging
	background: isDragging ? "lightgreen" : "grey",

	// styles we need to apply on draggables
	...draggableStyle,
});

export default class MultiFileCodeEditor extends PureComponent {
	async initialize(args, level, layout) {
		this._args = args;
		this._level = level;
		this._layout = layout;

		// TODO: INITIALIZE EDITORS
	}

	state = {
		items: [
			{ id: "1", content: <span>one</span> },
			{ id: "2", content: <span>two</span> },
			{ id: "3", content: <span>three</span> },
		],
	};

	render() {
		return (
			<HorizontalDragList
				items={this.state.items}
				onSort={(updatedItems) => this.setState({ items: updatedItems })}
				getListStyle={getListStyle}
				getItemStyle={getItemStyle}
			/>
		);

		return (
			<div className={styles.container}>
				<HorizontalDragList />
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
