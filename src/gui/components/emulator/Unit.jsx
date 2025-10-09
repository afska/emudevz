import React, { PureComponent } from "react";
import classNames from "classnames";
import locales from "../../../locales";
import Tooltip from "../widgets/Tooltip";
import styles from "./Unit.module.css";

export default class Unit extends PureComponent {
	render() {
		let {
			icon,
			name,
			completed,
			active,
			customInactiveIcon,
			customInactiveMessage,
			customActiveMessage,
			className,
			onToggle,
			suffix = "",
			useConsole = false,
			style,
			...rest
		} = this.props;

		if (useConsole) {
			active = true;
			completed = true;
		}

		const messageKey = active
			? customActiveMessage ?? "using_your_emulator"
			: customInactiveMessage ?? "using_bugged_emulator";
		const statusIcon = active ? "✅" : customInactiveIcon ?? "❌";

		return (
			<Tooltip
				title={`${icon} ${name}: ${locales.get(messageKey)}` + suffix}
				placement="right"
				onClick={onToggle}
			>
				<span
					className={classNames(
						styles.unit,
						completed && styles.completed,
						useConsole && styles.disabled,
						className
					)}
					style={style}
					{...rest}
				>
					{icon} {statusIcon}
				</span>
			</Tooltip>
		);
	}
}
