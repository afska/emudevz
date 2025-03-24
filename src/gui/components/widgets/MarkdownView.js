import React, { PureComponent } from "react";
import { marked } from "marked";
import classNames from "classnames";
import dictionary from "../../../data/dictionary";
import styles from "./MarkdownView.module.css";

export default class MarkdownView extends PureComponent {
	render() {
		const { content, className, ...rest } = this.props;

		return (
			<div
				className={classNames(styles.container, "markdown-view", className)}
				dangerouslySetInnerHTML={{ __html: this._htmlContent(content) }}
				{...rest}
			/>
		);
	}

	_htmlContent(content) {
		const parsedContent = marked.parse(content);
		return dictionary.parseLinks(parsedContent);
	}
}
