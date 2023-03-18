import React, { PureComponent } from "react";
import FlashChange from "@avinlab/react-flash-change";
import Table from "react-bootstrap/Table";
import DiffViewer from "react-diff-viewer";
import _ from "lodash";
import Level from "../../level/Level";
import testContext from "../../terminal/commands/test/context";
import { bus, hex } from "../../utils";
import styles from "./NEEESTester.module.css";

const MEMORY_ROWS = 10;
const BASE = 16;
const BYTES_MEMORY = MEMORY_ROWS * BASE;
const BYTES_STACK = MEMORY_ROWS + 1;
const ADDRESS_STACK_END = 0x01ff;

const asm = testContext.asm;

export default class NEEESTester extends PureComponent {
	state = {
		_isInitialized: false,
		_lastCode: "",
		_initialCode: null,
		_memoryStart: 0x4020,
		_mappings: [],
		_selectedCells: [],
		_error: null,
		A: 0x0,
		X: 0x0,
		Y: 0x0,
		SP: 0x0,
		PC: 0x0,
		F_N: 0,
		F_V: 0,
		F_B: 0,
		F_b: 0,
		F_D: 0,
		F_I: 0,
		F_Z: 0,
		F_C: 0,
		memory: new Uint8Array(BYTES_MEMORY),
		stack: new Uint8Array(BYTES_STACK),
	};

	async initialize(args, level) {
		this._level = level;

		this.setState({
			_isInitialized: true,
		});
	}

	render() {
		if (this.state._error)
			return (
				<div className={styles.message}>
					<span>❌ {this.state._error}</span>
				</div>
			);

		return (
			<div className={styles.container}>
				<DiffViewer
					oldValue={"test\ning\ndiffs!\nlet's see"}
					newValue={"test\ning\ndiffs!!! long long diff! loooong!\nlet's see"}
					splitView={true}
					useDarkTheme={true}
					leftTitle={"EmuDevz"}
					rightTitle={"Golden Log"}
					linesOffset={0}
				/>
			</div>
		);
	}

	componentDidMount() {
		this._subscriber = bus.subscribe({
			code: this._onCode,
			step: this._onStep,
			reset: this._onReset,
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	focus = () => {};

	_onCode = (code) => {
		try {
			const { instructions, cpu } = asm.prepare(Level.current, code).compile();
			this._cpu = cpu;

			this.setState(
				{ _lastCode: code, _mappings: instructions, _error: null },
				() => {
					setTimeout(() => {
						this._updateState();
					});
				}
			);
			bus.emit("compiled");
		} catch (e) {
			// if (
			// 	e?.message?.startsWith("Parse Error") ||
			// 	e?.message?.startsWith("Assembly Error")
			// ) {
			// 	e.handled = true;
			// 	this.setState({ _error: e.message });
			// }
			// throw e;
		}
	};

	_onStep = () => {
		this._cpu.step();
		this._updateState();
	};

	_onReset = () => {
		this._onCode(this.state._lastCode);
	};

	_updateState() {
		if (!this._cpu) return;

		const memory = new Uint8Array(BYTES_MEMORY);
		const stack = new Uint8Array(BYTES_STACK);
		for (let i = 0; i < MEMORY_ROWS * BASE; i++)
			memory[i] = this._cpu.memory.readAt(this.state._memoryStart + i);
		for (let i = 0; i < BYTES_STACK; i++)
			stack[i] = this._cpu.memory.readAt(
				ADDRESS_STACK_END - (BYTES_STACK - 1 - i)
			);

		this.setState({
			A: this._cpu.registers.a.value,
			X: this._cpu.registers.x.value,
			Y: this._cpu.registers.y.value,
			SP: this._cpu.sp.value,
			PC: this._cpu.pc.value,
			F_N: +this._cpu.flags.n,
			F_V: +this._cpu.flags.v,
			F_B: 1,
			F_b: 0,
			F_D: +this._cpu.flags.d,
			F_I: +this._cpu.flags.i,
			F_Z: +this._cpu.flags.z,
			F_C: +this._cpu.flags.c,
			memory,
			stack,
		});

		const lineNumber = this.state._mappings.find(
			(it) => asm.CODE_ADDRESS + it.address === this._cpu.pc.value
		)?.lineNumber;

		bus.emit("highlight", {
			line: lineNumber,
			nextAction: lineNumber == null ? "reset" : "step",
		});
		if (lineNumber == null) bus.emit("end");
	}
}

const Value = ({
	value,
	flashDuration = 500,
	style = {},
	prefix = "",
	digits = 2,
}) => {
	return (
		<FlashChange
			value={value}
			flashDuration={flashDuration}
			style={{
				transform: "rotate(-360deg)",
				color: value !== 0 ? "#e5c07b" : "#ffffff",
				...style,
			}}
			flashStyle={{
				transform: "rotate(0deg)",
				background: "rgba(98, 112, 128, 0.5)",
				boxShadow:
					"inset 8px 8px 8px rgb(0 0 0 / 8%), 0 0 8px rgb(200 200 200 / 60%)",
				transition: `transform ${flashDuration}ms, box-shadow ${flashDuration}ms`,
			}}
			compare={(prevProps, nextProps) => {
				return nextProps.value !== prevProps.value;
			}}
		>
			{prefix}
			{hex.format(value, digits)}
		</FlashChange>
	);
};

const Viewer = (props) => (
	<Table striped hover bordered size="sm" variant="dark" {...props} />
);
