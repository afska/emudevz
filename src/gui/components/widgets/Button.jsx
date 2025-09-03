import React, { PureComponent } from "react";
import classNames from "classnames";
import styles from "./Button.module.css";

export default class Button extends PureComponent {
	render() {
		const { className, primary = false, ...rest } = this.props;

		return (
			<button
				className={classNames(
					styles.button,
					primary && styles.primary,
					className
				)}
				{...rest}
			/>
		);
	}
}
