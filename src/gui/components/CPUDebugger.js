import React, { PureComponent } from "react";
import FlashChange from "@avinlab/react-flash-change";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Table from "react-bootstrap/Table";
import Tooltip from "react-bootstrap/Tooltip";
import _ from "lodash";
import locales from "../../locales";
import { bus, hex } from "../../utils";
import { assembler, runner } from "../../utils/nes";
import styles from "./CPUDebugger.module.css";

const HEIGHT = 300;
const REGISTERS = ["A", "X", "Y", "SP", "PC"];
const FLAGS_TEXT = ["N", "V", "-", "-", "-", "I", "Z", "C"];
const FLAGS_KEYS = ["N", "V", "B", "b", "D", "I", "Z", "C"];
const MEMORY_ROWS = 10;
const BASE = 16;
const PC_STYLE = { textDecoration: "underline" };

export default class CPUDebugger extends PureComponent {
	state = {
		_isInitialized: false,
		_hideFlags: false,
		_delay: 500,
		_lastCode: "",
		_memoryStart: 0x4020,
		_mappings: [],
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
		memory: new Uint8Array(MEMORY_ROWS * BASE),
	};

	async initialize(args, level) {
		this._level = level;

		if (Number.isFinite(args.delay)) this.setState({ _delay: args.delay });

		this.setState({ _isInitialized: true, _hideFlags: !!args.hideFlags });
	}

	setDelay(delay) {
		this.setState({ _delay: delay });
	}

	render() {
		if (!this.state._isInitialized) return false;

		return (
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
			</div>
		);
	}

	componentDidMount() {
		window.addEventListener("resize", this._onResize);
		this._subscriber = bus.subscribe({
			code: this._onCode,
			play: this._onPlay,
			reset: this._onReset,
		});
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._onResize);
		this._subscriber.release();
	}

	focus = () => {};

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
										<strong style={name === "PC" ? PC_STYLE : {}}>
											{name}
										</strong>
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
						return (
							<MemoryCell
								key={i}
								rowStart={rowStart}
								row={row}
								column={column}
								memory={this.state.memory}
								PC={this.state.PC}
								mappings={this.state._mappings}
								flashDuration={this.state._delay}
							/>
						);
					})}
				</tr>
			);
		});
	}

	_onCode = (code) => {
		try {
			const { instructions: mappings, bytes } = assembler.compile(code);
			this._cpu = runner.create(bytes);

			this.setState(
				{ _lastCode: code, _mappings: mappings, _error: null },
				() => {
					setTimeout(() => {
						this._updateState();
					});
				}
			);
		} catch (e) {
			if (
				e.message.startsWith("Parse Error") ||
				e.message.startsWith("Assembly Error")
			) {
				e.handled = true;
				this.setState({ _error: e.message });
			}

			throw e;
		}
	};

	_onPlay = () => {
		bus.emit("run-enabled", false);
		setTimeout(() => {
			bus.emit("run-enabled", true);
		}, this.state._delay);

		this._cpu.step();
		this._updateState();
	};

	_onReset = () => {
		this._onCode(this.state._lastCode);
	};

	_onRef = (ref) => {
		this._div = ref;
		this._onResize();
	};

	_onResize = () => {
		if (!this._div) return;

		const scale = Math.min(this._div.clientHeight / HEIGHT, 1);
		this._div.style.transform = `scale(${scale})`;
	};

	_updateState() {
		const memory = new Uint8Array(MEMORY_ROWS * BASE);
		for (let i = 0; i < MEMORY_ROWS * BASE; i++) {
			memory[i] = this._cpu.memory.readAt(this.state._memoryStart + i);
		}

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
		});

		const lineNumber = this.state._mappings.find(
			(it) => runner.CODE_ADDRESS + it.address === this._cpu.pc.value
		)?.lineNumber;

		bus.emit("highlight", lineNumber);
		if (lineNumber == null) bus.emit("end");
	}
}

const MemoryCell = ({
	rowStart,
	row,
	column,
	memory,
	PC,
	mappings,
	flashDuration,
}) => {
	const address = rowStart + column;
	const isPC = address === PC;

	return (
		<OverlayTrigger
			placement="top"
			show={isPC ? true : undefined}
			overlay={
				<Tooltip>
					{isPC && (
						<span>
							<strong className={styles.name} style={PC_STYLE}>
								PC
							</strong>{" "}
							={" "}
						</span>
					)}
					${hex.format(address, 4)}
					{(() => {
						const line = mappings.find(
							(it) => runner.CODE_ADDRESS + it.address === address
						)?.line;

						return line != null ? (
							<div className={styles.sentence}>${line}</div>
						) : null;
					})()}
				</Tooltip>
			}
		>
			<th>
				<Value
					value={memory[row * BASE + column]}
					flashDuration={flashDuration}
					style={isPC ? PC_STYLE : {}}
					digits={2}
				/>
			</th>
		</OverlayTrigger>
	);
};

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
