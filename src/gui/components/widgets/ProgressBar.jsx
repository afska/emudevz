import React, { PureComponent } from "react";
import classNames from "classnames";
import styles from "./ProgressBar.module.css";

export default class ProgressBar extends PureComponent {
	state = { uncontrolledPercentage: null };

	render() {
		const {
			percentage,
			barFillColor = "#5cb85c",
			animated = true,
			className,
			...rest
		} = this.props;
		const { uncontrolledPercentage, uncontrolledBarFillColor } = this.state;
		const finalPercentage =
			uncontrolledPercentage != null ? uncontrolledPercentage : percentage;
		const finalBarFillColor =
			uncontrolledBarFillColor != null
				? uncontrolledBarFillColor
				: barFillColor;

		return (
			<div className={classNames(styles.progress, className)} {...rest}>
				<div className={styles.bar}>
					<span
						className={classNames(styles.barFill, animated && styles.animated)}
						style={{
							width: finalPercentage + "%",
							backgroundColor: finalBarFillColor,
						}}
					/>
				</div>
			</div>
		);
	}

	setPercentage(percentage) {
		this.setState({ uncontrolledPercentage: percentage });
	}

	setBarFillColor(barFillColor) {
		this.setState({ uncontrolledBarFillColor: barFillColor });
	}
}
