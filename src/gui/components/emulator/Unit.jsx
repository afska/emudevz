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
			customInactiveIcon,
			customInactiveMessage,
			customActiveMessage,
			className,
			onToggle,
			suffix = "",
			disabled = false,
			style,
			...rest
		} = this.props;

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
						(completed || disabled) && styles.completed,
						disabled && styles.disabled,
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
