import React, { PureComponent } from "react";
import classNames from "classnames";
import Tooltip from "./Tooltip";
import styles from "./IconButton.module.css";

export default class IconButton extends PureComponent {
	render() {
		const { tooltip = null, tooltipPlacement = "top" } = this.props;
		if (!tooltip) return this._renderIcon();

		return (
			<Tooltip title={tooltip} placement={tooltipPlacement}>
				{this._renderIcon()}
			</Tooltip>
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
			$ref,
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
				ref={$ref}
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
