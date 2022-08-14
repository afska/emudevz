import React from "react";
import Layout from "./Layout";
import classNames from "classnames";
import styles from "./Layout.module.css";

export default class QuadLayout extends Layout {
	state = { selectedY: "top", selectedX: "left" };

	render() {
		if (!this.isReady) return false;

		const { TopLeft, BottomLeft, TopRight, BottomRight } = this.props;
		const { selectedX, selectedY } = this.state;

		return (
			<div className={styles.container} onKeyDownCapture={this.onKeyDown}>
				<div className={classNames(styles.leftColumn, styles.column)}>
					<div
						className={classNames(
							styles.topRow,
							styles.row,
							selectedY === "top" && selectedX === "left" && styles.selected
						)}
						onMouseDown={(e) => {
							this.setState({ selectedY: "top", selectedX: "left" });
						}}
					>
						<TopLeft
							ref={(topLeft) => {
								this.topLeft = topLeft;
							}}
						/>
					</div>

					<div
						className={classNames(
							styles.bottomRow,
							styles.row,
							selectedY === "bottom" && selectedX === "left" && styles.selected
						)}
						onMouseDown={(e) => {
							this.setState({ selectedY: "bottom", selectedX: "left" });
						}}
					>
						<BottomLeft
							ref={(bottomLeft) => {
								this.bottomLeft = bottomLeft;
							}}
						/>
					</div>
				</div>

				<div className={classNames(styles.rightColumn, styles.column)}>
					<div
						className={classNames(
							styles.topRow,
							styles.row,
							selectedY === "top" && selectedX === "right" && styles.selected
						)}
						onMouseDown={(e) => {
							this.setState({ selectedY: "top", selectedX: "right" });
						}}
					>
						<TopRight
							ref={(topRight) => {
								this.topRight = topRight;
							}}
						/>
					</div>

					<div
						className={classNames(
							styles.bottomRow,
							styles.row,
							selectedY === "bottom" && selectedX === "right" && styles.selected
						)}
						onMouseDown={(e) => {
							this.setState({ selectedY: "bottom", selectedX: "right" });
						}}
					>
						<BottomRight
							ref={(bottomRight) => {
								this.bottomRight = bottomRight;
							}}
						/>
					</div>
				</div>
			</div>
		);
	}

	onKeyDown = (e) => {
		const { selectedX, selectedY } = this.state;

		if (e.key === "ArrowRight" && e.altKey) {
			if (selectedX === "left") {
				this.setState({ selectedX: "right" });

				if (selectedY === "top") this.topRight.focus();
				else this.bottomRight.focus();
			}
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowLeft" && e.altKey) {
			if (selectedX === "right") {
				this.setState({ selectedX: "left" });

				if (selectedY === "top") this.topLeft.focus();
				else this.bottomLeft.focus();
			}
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowUp" && e.altKey) {
			if (selectedY === "bottom") {
				this.setState({ selectedY: "top" });

				if (selectedX === "left") this.topLeft.focus();
				else this.topRight.focus();
			}
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowDown" && e.altKey) {
			if (selectedY === "top") {
				this.setState({ selectedY: "bottom" });

				if (selectedX === "left") this.bottomLeft.focus();
				else this.bottomRight.focus();
			}
			e.preventDefault();
			e.stopPropagation();
		}
	};

	_callOnReady() {
		this.props.onReady({
			topLeft: this.topLeft,
			bottomLeft: this.bottomLeft,
			topRight: this.topRight,
			bottomRight: this.bottomRight,
		});
	}
}
