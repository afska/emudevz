import React, { PureComponent } from "react";
import Table from "react-bootstrap/Table";
import styles from "./CPUDebugger.module.css";

export default class CPUDebugger extends PureComponent {
	state = {};

	async initialize(args, level) {
		this._level = level;
	}

	render() {
		const {} = this.state;

		return (
			<div
				className={styles.container}
				ref={(ref) => {
					this._div = ref;
				}}
			>
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
							<td>$00</td>
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
		);
	}

	focus = () => {};

	componentDidMount() {
		window.addEventListener("resize", this._onResize);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._onResize);
	}

	_onResize = (e) => {
		if (!this._div) return;

		const scale = Math.min(this._div.clientHeight / 300, 1);
		this._div.style.transform = `scale(${scale})`;
	};
}
