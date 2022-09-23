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
			<div className={styles.container}>
				<Table
					striped
					bordered
					size="sm"
					variant="dark"
					className={styles.registers}
				>
					<tbody>
						<tr>
							<td>A</td>
							<td>$00</td>
						</tr>
						<tr>
							<td>X</td>
							<td>$00</td>
						</tr>
						<tr>
							<td>Y</td>
							<td>$00</td>
						</tr>
						<tr>
							<td>SP</td>
							<td>$FF</td>
						</tr>
						<tr>
							<td>PC</td>
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
						<tr>
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
}
