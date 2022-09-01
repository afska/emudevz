import React, { PureComponent } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import styles from "./IconButton.module.css";

export default class IconButton extends PureComponent {
	render() {
		const { Icon, tooltip, ...rest } = this.props;

		return (
			<OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
				<span className={styles.icon} {...rest}>
					<Icon />
				</span>
			</OverlayTrigger>
		);
	}
}
