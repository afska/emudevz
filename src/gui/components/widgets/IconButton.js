import React, { PureComponent } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import classNames from "classnames";
import styles from "./IconButton.module.css";

export default class IconButton extends PureComponent {
	render() {
		const {
			Icon,
			tooltip,
			onClick,
			kind = "inline",
			disabled = false,
			...rest
		} = this.props;

		return (
			<OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
				<span
					className={classNames(
						styles.icon,
						this._getStyle(kind),
						disabled && styles.disabled
					)}
					onClick={() => {
						if (disabled) return;
						onClick();
					}}
					{...rest}
				>
					<Icon />
				</span>
			</OverlayTrigger>
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
