import React, { PureComponent } from "react";
import FlashChange from "@avinlab/react-flash-change";
import tools6502 from "@neshacker/6502-tools";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Table from "react-bootstrap/Table";
import Tooltip from "react-bootstrap/Tooltip";
import locales from "../../locales";
import styles from "./CPUDebugger.module.css";

// TODO: REMOVE
console.log(tools6502);
window.tools = tools6502;

const HEIGHT = 300;

const Value = ({ value, prefix = "", digits = 2 }) => {
	return (
		<FlashChange
			value={value}
			flashDuration={500}
			style={{ transform: "rotate(-360deg)" }}
			flashStyle={{
				transform: "rotate(0deg)",
				boxShadow:
					"inset 8px 8px 8px rgb(0 0 0 / 8%), 0 0 8px rgb(200 200 200 / 60%)",
				transition: "transform 500ms, box-shadow 500ms",
			}}
			compare={(prevProps, nextProps) => {
				return nextProps.value !== prevProps.value;
			}}
		>
			{prefix}
			{value.toString(16).toUpperCase().padStart(digits, 0)}
		</FlashChange>
	);
};

const Viewer = (props) => (
	<Table striped hover bordered size="sm" variant="dark" {...props} />
);

export default class CPUDebugger extends PureComponent {
	state = {
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
	};

	async initialize(args, level) {
		this._level = level;
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

					<Viewer className={styles.registers}>
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
							{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((it, i) => {
								return (
									<tr key={i}>
										<td className={styles.name}>
											<strong>{`$00${it}0`}</strong>
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
														<Tooltip>
															$
															{(parseInt(`00${it}0`, 16) + d)
																.toString(16)
																.toUpperCase()
																.padStart(4, 0)}
														</Tooltip>
													}
												>
													<th>00</th>
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

	focus = () => {};

	componentDidMount() {
		window.addEventListener("resize", this._onResize);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._onResize);
	}

	_onRef = (ref) => {
		this._div = ref;
		this._onResize();
	};

	_onResize = () => {
		if (!this._div) return;

		const scale = Math.min(this._div.clientHeight / HEIGHT, 1);
		this._div.style.transform = `scale(${scale})`;
	};
}
