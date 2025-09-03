import React, { PureComponent } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Table from "react-bootstrap/Table";
import Tooltip from "react-bootstrap/Tooltip";
import _ from "lodash";
import Level from "../../level/Level";
import locales from "../../locales";
import testContext from "../../terminal/commands/test/context";
import { bus, hex } from "../../utils";
import FlashChange from "../../utils/FlashChange";
import TVNoise from "./TVNoise";
import styles from "./CPUDebugger.module.css";

const WIDTH = 600;
const HEIGHT = 300;
const REGISTERS = ["A", "X", "Y", "SP", "PC"];
const FLAGS_TEXT = ["N", "V", "-", "-", "D", "I", "Z", "C"];
const FLAGS_KEYS = ["N", "V", "B", "b", "D", "I", "Z", "C"];
const MEMORY_ROWS = 10;
const BASE = 16;
const BYTES_MEMORY = MEMORY_ROWS * BASE;
const BYTES_STACK = MEMORY_ROWS + 1;
const ADDRESS_STACK_START = 0x0100;
const ADDRESS_STACK_END = 0x01ff;
const CUSTOM_STYLES = {
	SP: {
		textDecoration: "overline",
		background: "rgb(75, 77, 81)",
		borderRadius: 12,
		padding: 4,
	},
	PC: {
		textDecoration: "underline",
	},
};

const asm = testContext.asm;

export default class CPUDebugger extends PureComponent {
	static get id() {
		return "CPUDebugger";
	}

	state = {
		_isInitialized: false,
		_hasCode: false,
		_hideFlags: false,
		_hideStack: false,
		_delay: 500,
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

		if (Number.isFinite(args.delay)) this.setState({ _delay: args.delay });

		this.setState({
			_isInitialized: true,
			_hideFlags: !!args.hideFlags,
			_hideStack: !!args.hideStack,
		});
	}

	setDelay(delay) {
		this.setState({ _delay: delay });
	}

	setMemoryStart(memoryStart) {
		this.setState({ _memoryStart: memoryStart }, () => {
			this._updateState("change-memory-start");
		});
	}

	setSelectedCells(selectedCells) {
		this.setState({ _selectedCells: selectedCells });
	}

	render() {
		if (!this.state._isInitialized) return false;
		if (!this.state._hasCode) return <TVNoise />;

		if (this.state._error)
			return (
				<div
					className={styles.topContainer}
					tabIndex={0}
					ref={this._onContainerRef}
				>
					<div className={styles.message} tabIndex={0}>
						<span>❌ {this.state._error}</span>
					</div>
				</div>
			);

		return (
			<div
				className={styles.topContainer}
				tabIndex={0}
				ref={this._onContainerRef}
			>
				<div className={styles.container} ref={this._onRef}>
					<div className={styles.column}>
						{this._renderRegisters()}
						{this._renderFlags()}
					</div>

					<div className={styles.column}>
						<Viewer className={styles.memory}>
							<thead>{this._renderMemoryViewerHead()}</thead>
							<tbody>{this._renderMemoryViewerContent()}</tbody>
						</Viewer>
					</div>

					<div className={styles.column}>
						<Viewer className={styles.memory}>
							<tbody>{this._renderStack()}</tbody>
						</Viewer>
					</div>
				</div>
			</div>
		);
	}

	componentDidMount() {
		window.addEventListener("resize", this._onResize);
		this._subscriber = bus.subscribe({
			code: this._onCode,
			step: this._onStep,
			reset: this._onReset,
		});
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._onResize);
		this._subscriber.release();
	}

	focus = () => {
		this._container.focus();
	};

	_renderRegisters() {
		return (
			<Viewer className={styles.registers}>
				<tbody>
					{REGISTERS.map((name, i) => {
						return (
							<OverlayTrigger
								key={i}
								placement="top"
								overlay={<Tooltip>{locales.get(`register_${name}`)}</Tooltip>}
							>
								<tr>
									<td className={styles.name}>
										<strong style={CUSTOM_STYLES[name] || {}}>{name}</strong>
									</td>
									<td>
										<Value
											value={this.state[name]}
											flashDuration={this.state._delay}
											prefix="$"
											digits={name === "PC" ? 4 : 2}
										/>
									</td>
								</tr>
							</OverlayTrigger>
						);
					})}
				</tbody>
			</Viewer>
		);
	}

	_renderFlags() {
		if (this.state._hideFlags) return false;

		return (
			<Viewer className={styles.flags}>
				<thead>
					<tr className={styles.name}>
						{FLAGS_TEXT.map((name, i) => {
							return (
								<OverlayTrigger
									key={i}
									placement="top"
									overlay={
										<Tooltip>
											{locales.get(
												`register_flags_${name}`,
												locales.get("register_flags_U")
											)}
										</Tooltip>
									}
								>
									<th>{name}</th>
								</OverlayTrigger>
							);
						})}
					</tr>
				</thead>
				<tbody>
					<tr>
						{FLAGS_KEYS.map((name) => {
							return (
								<td key={name}>
									<Value
										value={this.state[`F_${name}`]}
										flashDuration={this.state._delay}
										digits={1}
									/>
								</td>
							);
						})}
					</tr>
				</tbody>
			</Viewer>
		);
	}

	_renderMemoryViewerHead() {
		return (
			<tr className={styles.name}>
				{["#"]
					.concat(_.range(0, BASE).map((it) => it.toString(BASE).toUpperCase()))
					.map((name, i) => {
						return (
							<OverlayTrigger
								key={i}
								placement="top"
								overlay={<Tooltip>{locales.get("memory_viewer")}</Tooltip>}
							>
								<th>{name}</th>
							</OverlayTrigger>
						);
					})}
			</tr>
		);
	}

	_renderMemoryViewerContent() {
		return _.range(0, MEMORY_ROWS).map((row, i) => {
			const rowStart = this.state._memoryStart + row * BASE;

			return (
				<tr key={i}>
					<td className={styles.name}>
						<strong>${hex.format(rowStart, 4)}</strong>
					</td>
					{_.range(0, BASE).map((column, i) => {
						return this._renderMemoryCell({
							key: i,
							rowStart,
							row,
							column,
						});
					})}
				</tr>
			);
		});
	}

	_renderMemoryCell({ key, rowStart, row, column }) {
		const { memory, PC, _mappings, _delay } = this.state;
		const address = rowStart + column;
		const isPC = address === PC;

		return (
			<OverlayTrigger
				key={key}
				placement="top"
				show={isPC ? true : undefined}
				overlay={
					<Tooltip style={isPC ? { opacity: 0.75 } : {}}>
						<div className="memoryTooltip">
							{isPC && (
								<span>
									<strong className={styles.name} style={CUSTOM_STYLES.PC}>
										PC
									</strong>{" "}
									={" "}
								</span>
							)}
							${hex.format(address, 4)}
							{(() => {
								const instruction = _.findLast(_mappings, (it) => {
									const instructionAddress = asm.CODE_ADDRESS + it.address;
									return (
										address >= instructionAddress &&
										address < instructionAddress + it.size
									);
								});
								const line = instruction?.line;

								return line != null ? (
									<div className={styles.sentence}>
										{line}
										<div className={styles.sentenceByteCount}>
											({locales.get("byte")}{" "}
											{1 + address - (asm.CODE_ADDRESS + instruction.address)}/
											{instruction.size})
										</div>
									</div>
								) : null;
							})()}
						</div>
					</Tooltip>
				}
			>
				<td
					className={
						this.state._selectedCells.includes(address)
							? styles.selectedCell
							: ""
					}
				>
					<Value
						value={memory[row * BASE + column]}
						flashDuration={_delay}
						style={isPC ? CUSTOM_STYLES.PC : {}}
						digits={2}
					/>
				</td>
			</OverlayTrigger>
		);
	}

	_renderStack() {
		if (this.state._hideStack) return false;

		const { stack, SP, _delay } = this.state;

		return Array.from(stack).map((byte, i) => {
			const address = ADDRESS_STACK_END - (BYTES_STACK - 1 - i);
			const isSP = address === ADDRESS_STACK_START + SP;

			return (
				<OverlayTrigger
					key={i}
					placement="top"
					overlay={<Tooltip>{locales.get("stack")}</Tooltip>}
				>
					<tr>
						<td className={styles.name}>
							<strong>${hex.format(address, 4)}</strong>
						</td>
						<td>
							<Value
								value={byte}
								flashDuration={_delay}
								style={isSP ? CUSTOM_STYLES.SP : {}}
								digits={2}
							/>
						</td>
					</tr>
				</OverlayTrigger>
			);
		});
	}

	_onCode = (code) => {
		this.setState({ _hasCode: true });

		try {
			const { instructions, cpu } = asm.prepare(Level.current, code).compile();
			this._cpu = cpu;

			this.setState(
				{ _lastCode: code, _mappings: instructions, _error: null },
				() => {
					setTimeout(() => {
						this._updateState("code-changed");
					});
				}
			);
			bus.emit("compiled");
		} catch (e) {
			if (
				e?.message?.startsWith("Parse Error") ||
				e?.message?.startsWith("Assembly Error")
			) {
				e.handled = true;
				this.setState({ _error: e.message });
			}

			throw e;
		}
	};

	_onStep = () => {
		bus.emit("run-enabled", false);
		setTimeout(() => {
			bus.emit("run-enabled", true);
		}, this.state._delay);

		this._cpu.step();
		this._updateState("step");
	};

	_onReset = () => {
		this._onCode(this.state._lastCode);
	};

	_onContainerRef = (ref) => {
		this._container = ref;
	};

	_onRef = (ref) => {
		this._div = ref;
		this._onResize();
	};

	_onResize = () => {
		if (!this._div) return;

		const scale = Math.min(
			this._div.clientWidth / WIDTH,
			this._div.clientHeight / HEIGHT,
			1
		);
		this._div.style.transform = `scale(${scale})`;
	};

	_updateState(reason) {
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

		const lineIndex = this.state._mappings.find(
			(it) => asm.CODE_ADDRESS + it.address === this._cpu.pc.value
		)?.lineIndex;

		bus.emit("highlight", {
			line: lineIndex,
			nextAction: lineIndex == null ? "reset" : "step",
			reason,
		});
		if (lineIndex == null) bus.emit("end");
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
