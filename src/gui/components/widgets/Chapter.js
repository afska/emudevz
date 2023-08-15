import React, { PureComponent } from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import locales from "../../../locales";
import Button from "./Button";
import ProgressBar from "./ProgressBar";
import Tooltip from "./Tooltip";
import styles from "./Chapter.module.css";

class Chapter extends PureComponent {
	render() {
		const {
			book,
			chapter,
			goTo,
			optional = false,
			mini = false,
			nested = false,
			right = false,
			left = false,
			className,
			children,
			...rest
		} = this.props;

		const isUnlocked = this._isUnlocked;
		const totalLevels = chapter.levels.length;
		const totalCompleted = chapter.levels.filter((it) => book.isFinished(it.id))
			.length;
		const percentage = Math.round((totalCompleted / totalLevels) * 100);

		const lines = (left || right) && (
			<div
				className={classNames(
					styles.horizontalLines,
					!left && right && styles.horizontalLinesRightOnly
				)}
			>
				{nested && right && <div className={styles.horizontalLineRight} />}
				{nested && left && <div className={styles.horizontalLineLeft} />}
			</div>
		);

		const optionalSuffix = optional ? " " + locales.get("optional") : "";

		return (
			<Tooltip
				title={chapter.description?.[locales.language] + optionalSuffix}
				placement="top"
			>
				<div className={styles.container}>
					{lines}
					{nested && <div className={styles.verticalLine} />}
					<Button
						className={classNames(
							styles.chapter,
							optional && styles.optional,
							(nested || mini) && styles.mini,
							!isUnlocked && styles.locked,
							className
						)}
						onClick={this._go}
						{...rest}
					>
						<span>{chapter.name[locales.language]}</span>

						{isUnlocked ? (
							<ProgressBar percentage={percentage} />
						) : (
							<div>🔒</div>
						)}
					</Button>
					{nested && <div className={styles.verticalLine} />}
					{lines}
				</div>
			</Tooltip>
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
