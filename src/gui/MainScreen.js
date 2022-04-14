import React, { PureComponent } from "react";
import { CodeEditor, Terminal, TV } from "./components";
import classNames from "classnames";
import styles from "./MainScreen.module.css";

export default class MainScreen extends PureComponent {
	state = { selected: "left", lastVerticalSelection: "bottom" };

	get isReady() {
		return document.querySelector("body").clientWidth > 0;
	}

	render() {
		if (!this.isReady) return false;

		const { selected } = this.state;

		return (
			<div className={styles.container}>
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
					<CodeEditor />
				</div>

				<div className={classNames(styles.rightColumn, styles.column)}>
					<div
						className={classNames(
							styles.topRow,
							styles.row,
							selected === "top" && styles.selected
						)}
						id="preview"
						onMouseDown={(e) => {
							this.setState({ selected: "top" });
						}}
					>
						<TV />
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
						<Terminal />
					</div>
				</div>
			</div>
		);
	}

	onKeyDown = (e) => {
		const { selected, lastVerticalSelection } = this.state;

		if (e.key === "ArrowRight" && e.altKey) {
			if (selected === "left")
				this.setState({ selected: lastVerticalSelection });
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowLeft" && e.altKey) {
			if (selected !== "left")
				this.setState({
					selected: "left",
					lastVerticalSelection: selected,
				});
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowUp" && e.altKey) {
			if (selected === "bottom") this.setState({ selected: "top" });
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowDown" && e.altKey) {
			if (selected === "top") this.setState({ selected: "bottom" });
			e.preventDefault();
			e.stopPropagation();
		}
	};

	componentDidMount() {
		const $interval = setInterval(() => {
			if (this.isReady) {
				clearInterval($interval);
				this.forceUpdate();
			}
		}, 1);

		window.addEventListener("keydown", this.onKeyDown);
	}

	componentWillUnmount() {
		window.removeEventListener("keydown", this.onKeyDown);
	}
}
