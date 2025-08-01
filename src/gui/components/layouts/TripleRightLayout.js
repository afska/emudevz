import React from "react";
import { FaTimes } from "react-icons/fa";
import classNames from "classnames";
import locales from "../../../locales";
import { bus } from "../../../utils";
import IconButton from "../widgets/IconButton";
import Layout from "./Layout";
import styles from "./Layout.module.css";

export default class TripleLayout extends Layout {
	static get requiredComponentNames() {
		return ["Right", "Top", "Bottom"];
	}

	static get pinLocation() {
		return "Top";
	}

	static get secondaryPinLocation() {
		return "Right";
	}

	state = { selected: "Right", lastVerticalSelection: "Bottom", Pin: null };

	render() {
		this.requireComponents();
		const { Right, Top, Bottom } = this.props;
		const { selected, Pin, SecondaryPin } = this.state;

		return (
			<div className={styles.container} onKeyDownCapture={this.onKeyDown}>
				<div
					className={classNames(styles.leftColumn, styles.column)}
					style={{ display: Pin ? "none" : "block" }}
				>
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

				{Pin && (
					<div
						className={classNames(
							styles.leftColumn,
							styles.column,
							selected === "Top" ? styles.selected : styles.unselected
						)}
						onMouseDown={(e) => {
							this.focus("Top");
						}}
					>
						<IconButton
							Icon={FaTimes}
							tooltip={locales.get("close")}
							onClick={this._closePin}
							className={styles.closePinButton}
						/>
						<Pin
							ref={(ref) => {
								this.instances.Pin = ref;
							}}
						/>
					</div>
				)}

				{SecondaryPin && (
					<div
						className={classNames(
							styles.rightColumn,
							styles.column,
							selected === "Right" ? styles.selected : styles.unselected
						)}
						onMouseDown={(e) => {
							this.focus("Right");
						}}
					>
						<IconButton
							Icon={FaTimes}
							tooltip={locales.get("close")}
							onClick={this._closeSecondaryPin}
							className={styles.closePinButton}
						/>
						<SecondaryPin
							ref={(ref) => {
								this.instances.SecondaryPin = ref;
							}}
						/>
					</div>
				)}

				<div
					className={classNames(
						styles.rightColumn,
						styles.column,
						selected === "Right" ? styles.selected : styles.unselected
					)}
					style={{ display: SecondaryPin ? "none" : "block" }}
					onMouseDown={(e) => {
						this.focus("Right");
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
		if (!!this.state.Pin && instanceName === "Bottom") return;

		this.setState({ selected: instanceName });

		super.focus(instanceName);
	}

	onKeyDown = (e) => {
		const { selected, lastVerticalSelection, Pin } = this.state;

		if (e.key === "ArrowLeft" && e.altKey) {
			if (selected === "Right")
				this.focus(
					!!Pin ? this.constructor.pinLocation : lastVerticalSelection
				);
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
			if (!Pin && selected !== "Top") this.focus("Top");
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowDown" && e.altKey) {
			if (!Pin && selected !== "Bottom") this.focus("Bottom");
			e.preventDefault();
			e.stopPropagation();
		}
	};

	componentDidMount() {
		this._subscriber = bus.subscribe({
			pin: this._onPin,
			unpin: this._closePin,
			"secondary-pin": this._onSecondaryPin,
			"unpin-secondary": this._closeSecondaryPin,
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}
}
