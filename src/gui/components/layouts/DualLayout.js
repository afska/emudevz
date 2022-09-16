import React from "react";
import classNames from "classnames";
import Layout from "./Layout";
import styles from "./Layout.module.css";

export default class DualLayout extends Layout {
	static get requiredComponentNames() {
		return ["Left", "Right"];
	}

	state = { selected: "Left" };

	render() {
		this.requireComponents();
		const { Left, Right } = this.props;
		const { selected } = this.state;

		return (
			<div className={styles.container} onKeyDownCapture={this.onKeyDown}>
				<div
					className={classNames(
						styles.leftColumn,
						styles.column,
						selected === "Left" && styles.selected
					)}
					onMouseDown={(e) => {
						this.setState({ selected: "Left" });
					}}
				>
					<Left
						ref={(ref) => {
							this.instances.Left = ref;
						}}
					/>
				</div>

				<div
					className={classNames(
						styles.rightColumn,
						styles.column,
						selected === "Right" && styles.selected
					)}
					onMouseDown={(e) => {
						this.setState({ selected: "Right" });
					}}
				>
					<Right
						ref={(ref) => {
							this.instances.Right = ref;
						}}
					/>
				</div>
			</div>
		);
	}

	focus(instanceName) {
		this.setState({ selected: instanceName });

		super.focus(instanceName);
	}

	onKeyDown = (e) => {
		const { selected } = this.state;

		if (e.key === "ArrowRight" && e.altKey) {
			if (selected === "Left") this.focus("Right");
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowLeft" && e.altKey) {
			if (selected === "Right") this.focus("Left");
			e.preventDefault();
			e.stopPropagation();
		}
	};
}
