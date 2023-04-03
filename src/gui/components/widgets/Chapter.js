import React, { PureComponent } from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import locales from "../../../locales";
import Button from "./Button";
import Tooltip from "./Tooltip";
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

		const isUnlocked = this._isUnlocked;
		const totalLevels = chapter.levels.length;
		const totalCompleted = chapter.levels.filter((it) => book.isFinished(it.id))
			.length;
		const percentage = Math.round((totalCompleted / totalLevels) * 100);

		return (
			<Button
				className={classNames(
					styles.chapter,
					mini ? styles.mini : false,
					!isUnlocked ? styles.locked : false,
					className
				)}
				onClick={this._go}
				{...rest}
			>
				<span>{chapter.name[locales.language]}</span>

				{isUnlocked ? (
					<div className={styles.progress}>
						<div className={styles.bar}>
							<span
								className={styles.barFill}
								style={{ width: percentage + "%" }}
							/>
						</div>
					</div>
				) : (
					<div>🔒</div>
				)}
			</Button>
		);
	}

	get _isUnlocked() {
		const { book, chapter } = this.props;
		return book.isUnlocked(chapter.levels[0].id);
	}

	_go = () => {
		if (!this._isUnlocked) return;

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
