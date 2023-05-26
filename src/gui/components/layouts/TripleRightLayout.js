import React from "react";
import classNames from "classnames";
import Layout from "./Layout";
import styles from "./Layout.module.css";

export default class TripleLayout extends Layout {
	static get requiredComponentNames() {
		return ["Right", "Top", "Bottom"];
	}

	state = { selected: "Right", lastVerticalSelection: "Bottom" };

	render() {
		this.requireComponents();
		const { Right, Top, Bottom } = this.props;
		const { selected } = this.state;

		return (
			<div className={styles.container} onKeyDownCapture={this.onKeyDown}>
				<div className={classNames(styles.leftColumn, styles.column)}>
					<div
						className={classNames(
							styles.topRow,
							styles.row,
							selected === "Top" ? styles.selected : styles.unselected
						)}
						onMouseDown={(e) => {
							this.setState({ selected: "Top" });
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
							this.setState({ selected: "Bottom" });
						}}
					>
						<Bottom
							ref={(ref) => {
								this.instances.Bottom = ref;
							}}
						/>
					</div>
				</div>

				<div
					className={classNames(
						styles.rightColumn,
						styles.column,
						selected === "Right" ? styles.selected : styles.unselected
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
		const { selected, lastVerticalSelection } = this.state;

		if (e.key === "ArrowLeft" && e.altKey) {
			if (selected === "Right") this.focus(lastVerticalSelection);
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowRight" && e.altKey) {
			if (selected !== "Right") {
				this.setState({ lastVerticalSelection: selected });
				this.focus("Right");
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
