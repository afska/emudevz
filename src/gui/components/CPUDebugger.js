import React, { PureComponent } from "react";
import FlashChange from "@avinlab/react-flash-change";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Table from "react-bootstrap/Table";
import Tooltip from "react-bootstrap/Tooltip";
import locales from "../../locales";
import { bus, hex, nesAssembler } from "../../utils";
import CodeEditor from "./CodeEditor";
import styles from "./CPUDebugger.module.css";

const HEIGHT = 300;
const FLASH_DURATION = 500;

export default class CPUDebugger extends PureComponent {
	state = {
		_line: 0,
		_memoryStart: 0,
		A: 0x0,
		X: 0x0,
		Y: 0x0,
		SP: 0xff,
		PC: 0x0600,
		F_N: 0,
		F_V: 0,
		F_B: 0,
		F_b: 0,
		F_D: 0,
		F_I: 0,
		F_Z: 0,
		F_C: 0,
		memory: new Uint8Array(16 * 10),
	};

	async initialize(args, level) {
		this._level = level;
		this._codeEditor = level.$layout.instances[args.codeEditor];

		if (!(this._codeEditor instanceof CodeEditor))
			throw new Error(`Missing \`codeEditor\`: ${args.codeEditor}`);

		setTimeout(() => {
			this._highlightLine();
		});
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
												<strong>{name}</strong>
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
													overlay={
														<Tooltip>${hex.format(lineStart + d, 4)}</Tooltip>
													}
												>
													<th>
														<Value
															value={this.state.memory[line * 16 + d]}
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
		bus.on("play", this._onPlay);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._onResize);
		bus.removeListener("play", this._onPlay);
	}

	focus = () => {};

	_onPlay = () => {
		console.log(
			nesAssembler.inspect(`LDA #$01
			LDX #$fa
			LDA #$05
			LDY #$ab
			LDA #$08
			LDA #$19`)
		);

		if (Date.now() - (this._lastStep || 0) < FLASH_DURATION) return;
		this._lastStep = Date.now();

		this.setState({ _line: this.state._line + 1 }, () => {
			this._highlightLine();

			// TODO: UNHARDCODE
			if (this.state._line === 1) {
				this.setState({ A: 0x1 });
			} else if (this.state._line === 2) {
				this.setState({ X: 0xfa });
			} else if (this.state._line === 3) {
				this.setState({ A: 0x5 });
			} else if (this.state._line === 4) {
				this.setState({ Y: 0xab });
			} else if (this.state._line === 5) {
				this.setState({ A: 0x8 });
			} else if (this.state._line === 6) {
				this.setState({ A: 0x19 });
			}
		});
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

	_highlightLine() {
		this._codeEditor.highlight(this.state._line);
	}
}

const Value = ({ value, prefix = "", digits = 2 }) => {
	return (
		<FlashChange
			value={value}
			flashDuration={FLASH_DURATION}
			style={{ transform: "rotate(-360deg)" }}
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
