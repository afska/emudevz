import { FaTimes } from "react-icons/fa";
import classNames from "classnames";
import locales from "../../../locales";
import { bus } from "../../../utils";
import IconButton from "../widgets/IconButton";
import Layout from "./Layout";
import styles from "./Layout.module.css";

const MARGIN_PERCENT = 30;

export default class TripleRightLayout extends Layout {
	static get requiredComponentNames() {
		return ["Right", "Top", "Bottom"];
	}

	static get pinLocation() {
		return "Top";
	}

	static get secondaryPinLocation() {
		return "Right";
	}

	static defaultProps = { resizable: false };

	state = {
		selected: "Right",
		lastVerticalSelection: "Bottom",
		Pin: null,
		leftWidthPercent: 50,
		topHeightPercent: 50,
		isDragging: false,
		dragType: null,
	};

	render() {
		this.requireComponents();
		const { Right, Top, Bottom } = this.props;
		const { selected, Pin, SecondaryPin } = this.state;

		return (
			<div
				className={styles.container}
				onKeyDownCapture={this.onKeyDown}
				ref={(ref) => {
					this._containerRef = ref;
				}}
				style={{ position: "relative" }}
			>
				<div
					className={classNames(styles.leftColumn, styles.column)}
					style={{
						display: Pin ? "none" : "block",
						width: this.props.resizable
							? `${this.state.leftWidthPercent}%`
							: undefined,
						position: "relative",
					}}
					ref={(ref) => {
						this._leftMainRef = ref;
					}}
				>
					<div
						className={classNames(
							styles.topRow,
							styles.row,
							selected === "Top" ? styles.selected : styles.unselected
						)}
						style={{
							height: this.props.resizable
								? `${this.state.topHeightPercent}%`
								: undefined,
						}}
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

					{/* horizontal resize handle between top and bottom */}
					{this.props.resizable && !Pin && (
						<div
							className={styles.handle}
							onMouseDown={this._onHorizontalHandleMouseDown}
							style={{
								left: 0,
								right: 0,
								top: `calc(${this.state.topHeightPercent}% - 3px)`,
								height: 6,
								cursor: "row-resize",
							}}
						/>
					)}

					<div
						className={classNames(
							styles.bottomRow,
							styles.row,
							selected === "Bottom" ? styles.selected : styles.unselected
						)}
						style={{
							height: this.props.resizable
								? `${100 - this.state.topHeightPercent}%`
								: undefined,
						}}
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
						style={{
							width: this.props.resizable
								? `${this.state.leftWidthPercent}%`
								: undefined,
							position: "relative",
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
						style={{
							width: this.props.resizable
								? `${100 - this.state.leftWidthPercent}%`
								: undefined,
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
					style={{
						display: SecondaryPin ? "none" : "block",
						width: this.props.resizable
							? `${100 - this.state.leftWidthPercent}%`
							: undefined,
					}}
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

				{/* vertical resize handle between left and right */}
				{this.props.resizable && (
					<div
						className={styles.handle}
						onMouseDown={this._onVerticalHandleMouseDown}
						style={{
							top: 0,
							bottom: 0,
							left: `calc(${this.state.leftWidthPercent}% - 3px)`,
							width: 6,
							cursor: "col-resize",
						}}
					/>
				)}
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

	_onVerticalHandleMouseDown = (e) => {
		e.preventDefault();
		e.stopPropagation();
		this._startDrag("vertical");
	};

	_onHorizontalHandleMouseDown = (e) => {
		e.preventDefault();
		e.stopPropagation();
		this._startDrag("horizontal");
	};

	_startDrag(type) {
		this.setState({ isDragging: true, dragType: type });
		window.addEventListener("mousemove", this._onGlobalMouseMove);
		window.addEventListener("mouseup", this._onGlobalMouseUp, { once: true });
	}

	_onGlobalMouseMove = (e) => {
		if (!this.state.isDragging) return;

		if (this.state.dragType === "vertical") {
			const container = this._containerRef;
			if (!container) return;
			const rect = container.getBoundingClientRect();
			const percent = ((e.clientX - rect.left) / rect.width) * 100;
			this.setState(
				{
					leftWidthPercent: this._clamp(
						percent,
						MARGIN_PERCENT,
						100 - MARGIN_PERCENT
					),
				},
				this._emitWindowResize
			);
			return;
		}

		if (this.state.dragType === "horizontal") {
			const left = this._leftMainRef;
			if (!left) return;
			const rect = left.getBoundingClientRect();
			const percent = ((e.clientY - rect.top) / rect.height) * 100;
			this.setState(
				{
					topHeightPercent: this._clamp(
						percent,
						MARGIN_PERCENT,
						100 - MARGIN_PERCENT
					),
				},
				this._emitWindowResize
			);
		}
	};

	_onGlobalMouseUp = () => {
		this.setState({ isDragging: false, dragType: null });
		window.removeEventListener("mousemove", this._onGlobalMouseMove);
		this._emitWindowResize();
	};

	_emitWindowResize = () => {
		window.dispatchEvent(new Event("resize"));
	};

	_clamp(value, min, max) {
		return Math.min(max, Math.max(min, value));
	}

	componentDidMount() {
		this._subscriber = bus.subscribe({
			pin: this._onPin,
			unpin: this._closePin,
			"pin-secondary": this._onSecondaryPin,
			"unpin-secondary": this._closeSecondaryPin,
		});
	}

	componentWillUnmount() {
		this._subscriber.release();

		window.removeEventListener("mousemove", this._onGlobalMouseMove);
		window.removeEventListener("mouseup", this._onGlobalMouseUp);
	}
}
