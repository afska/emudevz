import React from "react";
import { FaTimes } from "react-icons/fa";
import classNames from "classnames";
import locales from "../../../locales";
import { bus } from "../../../utils";
import IconButton from "../widgets/IconButton";
import Layout from "./Layout";
import styles from "./Layout.module.css";

export default class DualLayout extends Layout {
	static get requiredComponentNames() {
		return ["Left", "Right"];
	}

	static get pinLocation() {
		return "Left";
	}

	static get secondaryPinLocation() {
		return "Right";
	}

	state = { selected: "Left", Pin: null, SecondaryPin: null };

	render() {
		this.requireComponents();
		const { Left, Right, Background = null } = this.props;
		const { selected, Pin, SecondaryPin } = this.state;

		return (
			<div className={styles.container} onKeyDownCapture={this.onKeyDown}>
				<div
					style={{ display: Pin ? "none" : "block" }}
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

				{!!Background && (
					<div
						style={{ display: "none" }}
						className={classNames(
							styles.leftColumn,
							styles.column,
							styles.unselected
						)}
						onMouseDown={(e) => {}}
					>
						<Background
							ref={(ref) => {
								this.instances.Background = ref;
							}}
						/>
					</div>
				)}

				{Pin && (
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
