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
			active,
			customIncompleteIcon,
			customIncompleteMessage,
			className,
			onToggle,
			style,
			...rest
		} = this.props;

		const message = active
			? "using_your_emulator"
			: customIncompleteMessage ?? "using_bugged_emulator";
		const statusIcon = active ? "✔️" : customIncompleteIcon ?? "❌";

		return (
			<Tooltip
				title={`${icon} ${name}: ${locales.get(message)}`}
				placement="right"
				onClick={onToggle}
			>
				<span
					className={classNames(
						styles.unit,
						completed && styles.completed,
						className
					)}
					style={style}
					{...rest}
				>
					{icon}: {statusIcon}
				</span>
			</Tooltip>
		);
	}
}
