import React, { PureComponent } from "react";
import { FaTimes } from "react-icons/fa";
import classNames from "classnames";
import IconButton from "./IconButton";
import styles from "./Tab.module.css";

export default class Tab extends PureComponent {
	render() {
		const {
			title,
			onSelect,
			onClose,
			canClose = true,
			active = false,
			className,
			children,
			...rest
		} = this.props;

		// TODO: SELECT ON CLICK / ENTER
		return (
			<div
				className={classNames(
					styles.container,
					active ? styles.active : {},
					className
				)}
				onClick={onSelect}
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
}
