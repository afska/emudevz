import React, { PureComponent } from "react";
import hljs from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { connect } from "react-redux";
import classNames from "classnames";
import dictionary from "../../../level/dictionary";
import { dlc, image as imageUtils } from "../../../utils";
import { INVERTABLE_IMAGES } from "../../theme";
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

class MarkdownView extends PureComponent {
	render() {
		const {
			content,
			className,
			invertTransparentImages,
			dispatch,
			...rest
		} = this.props;

		return (
			<div
				className={classNames(styles.container, "markdown-view", className)}
				dangerouslySetInnerHTML={{ __html: this._htmlContent(content) }}
				tabIndex={-1}
				{...rest}
			/>
		);
	}

	_htmlContent(content) {
		const parsedContent = marked.parse(content);
		const withLinks = dictionary
			.parseLinks(parsedContent)
			.replace(LINK_FILE_REGEXP, (label, path) => {
				return `<a class="highlight-link" href="javascript:_openPath_('${path}')">${label}</a>`;
			});

		if (!this.props.invertTransparentImages) return withLinks;

		let html = withLinks;
		for (const baseName of INVERTABLE_IMAGES) {
			const pattern = new RegExp(`(src="[^"]*${baseName}[^"]*\\.png")`, "g");
			html = html.replace(pattern, (fullMatch) => {
				const srcMatch = fullMatch.match(/src="([^"]+)"/);
				if (!srcMatch) return fullMatch;
				const originalPath = srcMatch[1];
				const invertedPath = imageUtils.getInvertedPngPath(originalPath);
				if (invertedPath === originalPath) return fullMatch;
				return fullMatch.replace(originalPath, invertedPath);
			});
		}

		return html;
	}
}

const mapStateToProps = ({ savedata }) => ({
	invertTransparentImages:
		(dlc.installed() && savedata.invertTransparentImages) || false,
});

export default connect(mapStateToProps)(MarkdownView);
