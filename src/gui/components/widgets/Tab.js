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
			active = false,
			className,
			children,
			...rest
		} = this.props;

		return (
			<div
				className={classNames(
					styles.container,
					active ? styles.active : {},
					className
				)}
				{...rest}
			>
				<span>{title}</span>
				<IconButton
					Icon={FaTimes}
					onClick={onClose}
					className={styles.closeButton}
				/>
			</div>
		);
	}
}
