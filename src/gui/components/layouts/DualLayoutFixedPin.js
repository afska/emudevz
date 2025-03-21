import React from "react";
import classNames from "classnames";
import { bus } from "../../../utils";
import Layout from "./Layout";
import styles from "./Layout.module.css";

export default class DualLayoutFixedPin extends Layout {
	static get requiredComponentNames() {
		return ["Left"];
	}

	static get pinLocation() {
		return "Right";
	}

	state = { selected: "Left", Pin: null };

	render() {
		this.requireComponents();
		const { Left } = this.props;
		const { selected, Pin } = this.state;

		return (
			<div className={styles.container} onKeyDownCapture={this.onKeyDown}>
				<div
					className={classNames(
						styles.leftColumn,
						styles.column,
						selected === "Left" ? styles.selected : styles.unselected
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

				{Pin && (
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
						<Pin
							ref={(ref) => {
								this.instances.Pin = ref;
							}}
						/>
					</div>
				)}

				<div
					style={{ display: Pin ? "none" : "block" }}
					className={classNames(
						styles.rightColumn,
						styles.column,
						selected === "Right" ? styles.selected : styles.unselected
					)}
					onMouseDown={(e) => {
						this.setState({ selected: "Right" });
					}}
				></div>
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
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	_onPin = (pin) => {
		this.setState({ Pin: pin.Component }, () => {
			this.instances.Pin.initialize(pin.args, pin.level, this);
			setTimeout(() => {
				this.focus(this.constructor.pinLocation);
			});
		});
	};
}
