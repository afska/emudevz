import React, { PureComponent } from "react";
import classNames from "classnames";
import styles from "./Button.module.css";

export default class Button extends PureComponent {
	render() {
		const { className, ...rest } = this.props;

		return <div className={classNames(styles.button, className)} {...rest} />;
	}
}
