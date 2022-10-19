import React, { PureComponent } from "react";
import { FaTimes } from "react-icons/fa";
import classNames from "classnames";
import IconButton from "./IconButton";
import styles from "./Tab.module.css";

export default class Tab extends PureComponent {
	render() {
		const {
			title,
			onClose,
			canClose = true,
			active = false,
			dragging = false,
			className,
			children,
			...rest
		} = this.props;

		return (
			<div
				className={classNames(
					styles.container,
					active ? styles.active : {},
					dragging ? styles.dragging : {},
					className
				)}
				onMouseDown={this._onMouseDown}
				onMouseUp={this._onMouseUp}
				{...rest}
			>
				<span>{title}</span>
				{canClose && (
					<IconButton
						Icon={FaTimes}
						onClick={onClose}
						className={styles.closeButton}
					/>
				)}
			</div>
		);
	}

	_onMouseDown = (e) => {
		if (e.button === 0) {
			this.props.onSelect();
			return;
		}

		if (e.button === 1) {
			e.preventDefault();
			return;
		}
	};

	_onMouseUp = (e) => {
		if (e.button === 1 && this.props.canClose) {
			this.props.onClose();
			return;
		}
	};
}
