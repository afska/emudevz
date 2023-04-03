import React, { PureComponent } from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import locales from "../../../locales";
import Button from "./Button";
import styles from "./Chapter.module.css";

class Chapter extends PureComponent {
	render() {
		const {
			book,
			chapter,
			goTo,
			mini = false,
			className,
			children,
			...rest
		} = this.props;

		return (
			<Button
				className={classNames(
					styles.chapter,
					mini ? styles.mini : false,
					className
				)}
				onClick={this._go}
				{...rest}
			>
				<span>{chapter.name[locales.language]}</span>
				<div className={styles.bar} />
			</Button>
		);
	}

	_go = () => {
		const { book, chapter, goTo } = this.props;
		const level =
			book.nextPendingLevelOfChapter(chapter.id) || chapter.levels[0];
		goTo(level.id);
	};
}

const mapDispatchToProps = ({ level }) => ({
	goTo: level.goTo,
});

export default connect(null, mapDispatchToProps)(Chapter);
