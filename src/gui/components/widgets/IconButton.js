import React, { PureComponent } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import classNames from "classnames";
import styles from "./IconButton.module.css";

export default class IconButton extends PureComponent {
	render() {
		const { tooltip = null, tooltipPlacement = "top" } = this.props;
		if (!tooltip) return this._renderIcon();

		return (
			<OverlayTrigger
				placement={tooltipPlacement}
				overlay={<Tooltip>{tooltip}</Tooltip>}
			>
				{this._renderIcon()}
			</OverlayTrigger>
		);
	}

	_renderIcon() {
		const {
			Icon,
			tooltip,
			onClick,
			kind = "inline",
			disabled = false,
			className,
			...rest
		} = this.props;

		return (
			<span
				className={classNames(
					styles.icon,
					this._getStyle(kind),
					disabled && styles.disabled,
					className
				)}
				onClick={() => {
					if (disabled) return;
					onClick();
				}}
				{...rest}
			>
				<Icon />
			</span>
		);
	}

	_getStyle(name) {
		switch (name) {
			case "inline":
				return styles.inline;
			case "rounded":
				return styles.rounded;
			default:
				return null;
		}
	}
}
