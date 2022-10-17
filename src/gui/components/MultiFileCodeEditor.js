import React, { PureComponent } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import DraggableTabs from "react-draggable-tabs";
import { FaPlus, FaTimes } from "react-icons/fa";
import Level from "../../level/Level";
import { bus } from "../../utils";
import CodeEditor from "./CodeEditor";
import IconButton from "./widgets/IconButton";
import styles from "./MultiFileCodeEditor.module.css";

export default class MultiFileCodeEditor extends PureComponent {
	async initialize(args, level, layout) {
		this._args = args;
		this._level = level;
		this._layout = layout;

		// TODO: INITIALIZE EDITORS
	}

	render() {
		return (
			<div className={styles.container}>
				<DraggableTabs
					tabs={[
						{
							id: "/code/index.js",
							content: "index.js",
							active: true,
						},
						{
							id: "/code/CPU.js",
							content: "CPU.js",
						},
						{
							id: "/code/Cartridge.js",
							content: "Cartridge.js",
						},
					]}
					moveTab={(dragIndex, hoverIndex) => {
						console.log(`MOVING FROM ${dragIndex} to ${hoverIndex}`);
					}}
					selectTab={(selectedIndex) => {
						console.log("SELECTED: " + selectedIndex);
					}}
					closeTab={(index) => {
						console.log("CLOSED: " + index);
					}}
				>
					<IconButton
						className={styles.addButton}
						Icon={FaPlus}
						onClick={() => alert("hello")}
					/>
				</DraggableTabs>
				<CodeEditor
					ref={(e) => {
						if (!e) return;
						e.initialize({ readOnly: true }, Level.current);
					}}
					getCode={() => "=> the content"}
					setCode={() => {}}
				/>
				{/*<Tabs
					defaultActiveKey="/code/index.js"
					transition={false}
					tabIndex={-1}
				>
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
								<IconButton Icon={FaTimes} onClick={() => alert("hello")} />
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
								<IconButton Icon={FaTimes} onClick={() => alert("hello")} />
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
								<IconButton Icon={FaTimes} onClick={() => alert("hello")} />
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
