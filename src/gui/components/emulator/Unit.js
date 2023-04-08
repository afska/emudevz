import React, { PureComponent } from "react";
import classNames from "classnames";
import locales from "../../../locales";
import Tooltip from "../widgets/Tooltip";
import styles from "./Unit.module.css";

export default class Unit extends PureComponent {
	render() {
		const {
			icon,
			name,
			completed,
			customIncompleteIcon,
			customIncompleteMessage,
			className,
			style,
			...rest
		} = this.props;

		const message = completed
			? "using_your_emulator"
			: customIncompleteMessage ?? "using_bugged_emulator";
		const statusIcon = completed ? "✔️" : customIncompleteIcon ?? "❌";

		return (
			<Tooltip
				title={`${icon} ${name}: ${locales.get(message)}`}
				placement="right"
			>
				<span
					className={classNames(styles.unit, className)}
					style={style}
					{...rest}
				>
					{icon}: {statusIcon}
				</span>
			</Tooltip>
		);
	}
}
