import React from "react";
import classNames from "classnames";
import Layout from "./Layout";
import styles from "./Layout.module.css";

export default class TripleLayout extends Layout {
	static get requiredComponentNames() {
		return ["Left", "Top", "Bottom"];
	}

	state = { selected: "Left", lastVerticalSelection: "Bottom" };

	render() {
		this.requireComponents();
		const { Left, Top, Bottom } = this.props;
		const { selected } = this.state;

		return (
			<div className={styles.container} onKeyDownCapture={this.onKeyDown}>
				<div
					className={classNames(
						styles.leftColumn,
						styles.column,
						selected === "Left" ? styles.selected : styles.unselected
					)}
					onMouseDown={(e) => {
						this.focus("Left");
					}}
				>
					<Left
						ref={(ref) => {
							this.instances.Left = ref;
						}}
					/>
				</div>

				<div className={classNames(styles.rightColumn, styles.column)}>
					<div
						className={classNames(
							styles.topRow,
							styles.row,
							selected === "Top" ? styles.selected : styles.unselected
						)}
						onMouseDown={(e) => {
							this.focus("Top");
						}}
					>
						<Top
							ref={(ref) => {
								this.instances.Top = ref;
							}}
						/>
					</div>

					<div
						className={classNames(
							styles.bottomRow,
							styles.row,
							selected === "Bottom" ? styles.selected : styles.unselected
						)}
						onMouseDown={(e) => {
							this.focus("Bottom");
						}}
					>
						<Bottom
							ref={(ref) => {
								this.instances.Bottom = ref;
							}}
						/>
					</div>
				</div>
			</div>
		);
	}

	focus(instanceName) {
		this.setState({ selected: instanceName });

		super.focus(instanceName);
	}

	onKeyDown = (e) => {
		const { selected, lastVerticalSelection } = this.state;

		if (e.key === "ArrowRight" && e.altKey) {
			if (selected === "Left") this.focus(lastVerticalSelection);
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowLeft" && e.altKey) {
			if (selected !== "Left") {
				this.setState({ lastVerticalSelection: selected });
				this.focus("Left");
			}
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowUp" && e.altKey) {
			if (selected !== "Top") this.focus("Top");
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowDown" && e.altKey) {
			if (selected !== "Bottom") this.focus("Bottom");
			e.preventDefault();
			e.stopPropagation();
		}
	};
}
