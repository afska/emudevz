import React, { PureComponent } from "react";
import FlashChange from "@avinlab/react-flash-change";
import Table from "react-bootstrap/Table";
import styles from "./CPUDebugger.module.css";

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
	<Table striped bordered size="sm" variant="dark" {...props} />
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
							{["A", "X", "Y", "SP", "PC"].map((name) => {
								return (
									<tr key={name}>
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
								);
							})}
						</tbody>
					</Viewer>

					<Viewer className={styles.registers}>
						<thead>
							<tr className={styles.name}>
								<th>N</th>
								<th>V</th>
								<th>-</th>
								<th>-</th>
								<th>D</th>
								<th>I</th>
								<th>Z</th>
								<th>C</th>
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
						<tbody>
							{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((it, i) => {
								return (
									<tr key={i}>
										<td className={styles.name}>
											<strong>{`$00${it}0`}</strong>
										</td>
										<td>00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00</td>
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
		window.a = this;
	};

	_onResize = () => {
		if (!this._div) return;

		const scale = Math.min(this._div.clientHeight / HEIGHT, 1);
		this._div.style.transform = `scale(${scale})`;
	};
}
