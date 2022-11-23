import React, { PureComponent } from "react";
import classNames from "classnames";
import styles from "./MarkdownView.module.css";

export default class MarkdownView extends PureComponent {
	render() {
		const { content, className, ...rest } = this.props;

		return (
			<div className={classNames(styles.container, className)} {...rest}>
				{content}
			</div>
		);
	}
}
