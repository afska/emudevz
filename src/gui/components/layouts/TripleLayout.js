import React from "react";
import Layout from "./Layout";
import classNames from "classnames";
import styles from "./Layout.module.css";

export default class TripleLayout extends Layout {
	static componentNames() {
		return ["Left", "Top", "Bottom"];
	}

	state = { selected: "left", lastVerticalSelection: "bottom" };

	render() {
		if (!this.isReady) return false;

		this.requireComponents();
		const { Left, Top, Bottom } = this.props;
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

				<div className={classNames(styles.rightColumn, styles.column)}>
					<div
						className={classNames(
							styles.topRow,
							styles.row,
							selected === "top" && styles.selected
						)}
						onMouseDown={(e) => {
							this.setState({ selected: "top" });
						}}
					>
						<Top
							ref={(top) => {
								this.top = top;
							}}
						/>
					</div>

					<div
						className={classNames(
							styles.bottomRow,
							styles.row,
							selected === "bottom" && styles.selected
						)}
						onMouseDown={(e) => {
							this.setState({ selected: "bottom" });
						}}
					>
						<Bottom
							ref={(bottom) => {
								this.bottom = bottom;
							}}
						/>
					</div>
				</div>
			</div>
		);
	}

	onKeyDown = (e) => {
		const { selected, lastVerticalSelection } = this.state;

		if (e.key === "ArrowRight" && e.altKey) {
			if (selected === "left") {
				this.setState({ selected: lastVerticalSelection });

				if (lastVerticalSelection === "top") this.top.focus();
				else this.bottom.focus();
			}
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowLeft" && e.altKey) {
			if (selected !== "left") {
				this.setState({
					selected: "left",
					lastVerticalSelection: selected,
				});
				this.left.focus();
			}
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowUp" && e.altKey) {
			if (selected !== "top") {
				this.setState({ selected: "top" });
				this.top.focus();
			}
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowDown" && e.altKey) {
			if (selected !== "bottom") {
				this.setState({ selected: "bottom" });
				this.bottom.focus();
			}
			e.preventDefault();
			e.stopPropagation();
		}
	};

	_callOnReady() {
		this.props.onReady({
			Left: this.left,
			Top: this.top,
			Bottom: this.bottom,
		});
	}
}
