import React, { PureComponent } from "react";
import hljs from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import classNames from "classnames";
import dictionary from "../../../data/dictionary";
import styles from "./MarkdownView.module.css";

const LINK_FILE_REGEXP = /📄 {1}([a-z0-9/._-]+)/iu;

const marked = new Marked(
	markedHighlight({
		emptyLangClass: "hljs",
		langPrefix: "hljs language-",
		highlight(code, lang, info) {
			const language = hljs.getLanguage(lang) ? lang : "plaintext";
			return hljs.highlight(code, { language }).value;
		},
	})
);

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
		return dictionary
			.parseLinks(parsedContent)
			.replace(LINK_FILE_REGEXP, (label, path) => {
				return `<a class="highlight-link" href="javascript:_openPath_('${path}')">${label}</a>`;
			});
	}
}
