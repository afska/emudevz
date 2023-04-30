import React, { PureComponent } from "react";
import classNames from "classnames";
import styles from "./ProgressBar.module.css";

export default class ProgressBar extends PureComponent {
	render() {
		const {
			percentage,
			barFillColor = "#5cb85c",
			className,
			...rest
		} = this.props;

		return (
			<div className={classNames(styles.progress, className)} {...rest}>
				<div className={styles.bar}>
					<span
						className={styles.barFill}
						style={{ width: percentage + "%", backgroundColor: barFillColor }}
					/>
				</div>
			</div>
		);
	}
}
