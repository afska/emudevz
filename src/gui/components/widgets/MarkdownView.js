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
		let parsedContent = marked.parse(content);

		window._showDefinition_ = (word) => {
			dictionary.showDefinition(word);
		};

		const regexp = dictionary.getRegexp();
		parsedContent = parsedContent.replace(
			regexp,
			(word) =>
				`<a class="dictionary-link" href="javascript:_showDefinition_('${word}')">${word}</a>`
		);
		return parsedContent;
	}
}
