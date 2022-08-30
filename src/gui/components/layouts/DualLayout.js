import React from "react";
import Layout from "./Layout";
import classNames from "classnames";
import styles from "./Layout.module.css";

export default class DualLayout extends Layout {
	state = { selected: "left" };

	render() {
		if (!this.isReady) return false;

		this.require("Left", "Right");
		const { Left, Right } = this.props;
		const { selected } = this.state;

		return (
			<div className={styles.container} onKeyDownCapture={this.onKeyDown}>
				<div
					className={classNames(
						styles.leftColumn,
						styles.column,
						selected === "left" && styles.selected
					)}
					onMouseDown={(e) => {
						this.setState({ selected: "left" });
					}}
				>
					<Left
						ref={(left) => {
							this.left = left;
						}}
					/>
				</div>

				<div
					className={classNames(
						styles.rightColumn,
						styles.column,
						selected === "right" && styles.selected
					)}
					onMouseDown={(e) => {
						this.setState({ selected: "right" });
					}}
				>
					<Right
						ref={(right) => {
							this.right = right;
						}}
					/>
				</div>
			</div>
		);
	}

	onKeyDown = (e) => {
		const { selected } = this.state;

		if (e.key === "ArrowRight" && e.altKey) {
			if (selected === "left") {
				this.setState({ selected: "right" });
				this.right.focus();
			}
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowLeft" && e.altKey) {
			if (selected === "right") {
				this.setState({ selected: "left" });
				this.left.focus();
			}
			e.preventDefault();
			e.stopPropagation();
		}
	};

	_callOnReady() {
		this.props.onReady({
			Left: this.left,
			Right: this.right,
		});
	}
}
