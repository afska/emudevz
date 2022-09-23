import React, { PureComponent } from "react";
import FlashChange from "@avinlab/react-flash-change";
import Table from "react-bootstrap/Table";
import styles from "./CPUDebugger.module.css";

const HEIGHT = 300;

const Value = ({ value }) => {
	return (
		<FlashChange
			value={value}
			style={{ transform: "rotate(-360deg)" }}
			flashStyle={{
				transform: "rotate(0deg)",
				transition: "transform 200ms, background 200ms",
			}}
			compare={(prevProps, nextProps) => {
				return nextProps.value !== prevProps.value;
			}}
		>
			{value}
		</FlashChange>
	);
};

export default class CPUDebugger extends PureComponent {
	state = { A: 0 };

	async initialize(args, level) {
		this._level = level;
	}

	render() {
		const { A } = this.state;

		return (
			<div className={styles.container} ref={this._onRef}>
				<div className={styles.column}>
					<Table
						striped
						bordered
						size="sm"
						variant="dark"
						className={styles.registers}
					>
						<tbody>
							<tr>
								<td className={styles.name}>
									<strong>A</strong>
								</td>
								<td>
									<Value value={A} />
								</td>
							</tr>
							<tr>
								<td className={styles.name}>
									<strong>X</strong>
								</td>
								<td>$00</td>
							</tr>
							<tr>
								<td className={styles.name}>
									<strong>Y</strong>
								</td>
								<td>$00</td>
							</tr>
							<tr>
								<td className={styles.name}>
									<strong>SP</strong>
								</td>
								<td>$FF</td>
							</tr>
							<tr>
								<td className={styles.name}>
									<strong>PC</strong>
								</td>
								<td>$0621</td>
							</tr>
						</tbody>
					</Table>

					<Table
						striped
						bordered
						size="sm"
						variant="dark"
						className={styles.registers}
					>
						<thead>
							<tr className={styles.name}>
								<th>N</th>
								<th>V</th>
								<th>-</th>
								<th>B</th>
								<th>D</th>
								<th>I</th>
								<th>Z</th>
								<th>C</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>0</td>
								<td>0</td>
								<td>1</td>
								<td>1</td>
								<td>0</td>
								<td>0</td>
								<td>1</td>
								<td>1</td>
							</tr>
						</tbody>
					</Table>
				</div>

				<div className={styles.column}>
					<Table
						striped
						bordered
						size="sm"
						variant="dark"
						className={styles.memory}
					>
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
					</Table>
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
