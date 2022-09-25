import React, { PureComponent } from "react";
import FlashChange from "@avinlab/react-flash-change";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Table from "react-bootstrap/Table";
import Tooltip from "react-bootstrap/Tooltip";
import locales from "../../locales";
import { bus, hex } from "../../utils";
import { assembler, runner } from "../../utils/nes";
import CodeEditor from "./CodeEditor";
import styles from "./CPUDebugger.module.css";

const HEIGHT = 300;
const FLASH_DURATION = 500;
const MEMORY_ROWS = 10;
const PC_STYLE = { textDecoration: "underline" };

export default class CPUDebugger extends PureComponent {
	state = {
		_lastCode: "",
		_memoryStart: 0x4020,
		_mappings: [],
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
		memory: new Uint8Array(MEMORY_ROWS * 16),
	};

	async initialize(args, level) {
		this._level = level;
		this._codeEditor = level.$layout.instances[args.codeEditor];

		if (!(this._codeEditor instanceof CodeEditor))
			throw new Error(`Missing \`codeEditor\`: ${args.codeEditor}`);
	}

	render() {
		return (
			<div className={styles.container} ref={this._onRef}>
				<div className={styles.column}>
					<Viewer className={styles.registers}>
						<tbody>
							{["A", "X", "Y", "SP", "PC"].map((name, i) => {
								return (
									<OverlayTrigger
										key={i}
										placement="top"
										overlay={
											<Tooltip>{locales.get(`register_${name}`)}</Tooltip>
										}
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

					<Viewer className={styles.flags}>
						<thead>
							<tr className={styles.name}>
								{["N", "V", "-", "-", "-", "I", "Z", "C"].map((name, i) => {
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
								{["N", "V", "B", "b", "D", "I", "Z", "C"].map((name) => {
									return (
										<td key={name}>
											<Value value={this.state[`F_${name}`]} digits={1} />
										</td>
									);
								})}
							</tr>
						</tbody>
					</Viewer>
				</div>

				<div className={styles.column}>
					<Viewer className={styles.memory}>
						<thead>
							<tr className={styles.name}>
								{[
									"#",
									"0",
									"1",
									"2",
									"3",
									"4",
									"5",
									"6",
									"7",
									"8",
									"9",
									"A",
									"B",
									"C",
									"D",
									"E",
									"F",
								].map((name, i) => {
									return (
										<OverlayTrigger
											key={i}
											placement="top"
											overlay={
												<Tooltip>{locales.get("memory_viewer")}</Tooltip>
											}
										>
											<th>{name}</th>
										</OverlayTrigger>
									);
								})}
							</tr>
						</thead>
						<tbody>
							{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((line, i) => {
								const lineStart = this.state._memoryStart + line * 16;

								return (
									<tr key={i}>
										<td className={styles.name}>
											<strong>${hex.format(lineStart, 4)}</strong>
										</td>
										{[
											0,
											1,
											2,
											3,
											4,
											5,
											6,
											7,
											8,
											9,
											0xa,
											0xb,
											0xc,
											0xd,
											0xe,
											0xf,
										].map((d, i) => {
											return (
												<OverlayTrigger
													key={i}
													placement="top"
													show={
														lineStart + d === this.state.PC ? true : undefined
													}
													overlay={
														<Tooltip>
															${hex.format(lineStart + d, 4)}
															{(() => {
																const line = this.state._mappings.find(
																	(it) =>
																		runner.CODE_ADDRESS + it.address ===
																		lineStart + d
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
															value={this.state.memory[line * 16 + d]}
															style={
																lineStart + d === this.state.PC ? PC_STYLE : {}
															}
															digits={2}
														/>
													</th>
												</OverlayTrigger>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</Viewer>
				</div>
			</div>
		);
	}

	componentDidMount() {
		window.addEventListener("resize", this._onResize);
		bus.on("code", this._onCode);
		bus.on("play", this._onPlay);
		bus.on("reset", this._onReset);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._onResize);
		bus.removeListener("code", this._onCode);
		bus.removeListener("play", this._onPlay);
		bus.removeListener("reset", this._onReset);
	}

	focus = () => {};

	_onCode = (code) => {
		// TODO: HANDLE COMPILE ERRORS

		const bytes = assembler.compile(code);
		const mappings = assembler.inspect(code);
		this._cpu = runner.create(bytes);

		this.setState({ _lastCode: code, _mappings: mappings }, () => {
			setTimeout(() => {
				this._updateState();
			});
		});
	};

	_onPlay = () => {
		if (Date.now() - (this._lastStep || 0) < FLASH_DURATION) return;
		this._lastStep = Date.now();

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
		const memory = new Uint8Array(MEMORY_ROWS * 16);
		for (let i = 0; i < MEMORY_ROWS * 16; i++) {
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

		this._codeEditor.highlight(lineNumber);
		if (lineNumber == null) bus.emit("end");
	}
}

const Value = ({ value, style = {}, prefix = "", digits = 2 }) => {
	return (
		<FlashChange
			value={value}
			flashDuration={FLASH_DURATION}
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
				transition: `transform ${FLASH_DURATION}ms, box-shadow ${FLASH_DURATION}ms`,
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
