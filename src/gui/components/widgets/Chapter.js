import React, { PureComponent } from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import locales from "../../../locales";
import Button from "./Button";
import styles from "./Chapter.module.css";

class Chapter extends PureComponent {
	render() {
		const {
			book,
			chapter,
			goTo,
			comingSoon = false,
			mini = false,
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
					!left && right ? styles.horizontalLinesRightOnly : false
				)}
			>
				{mini && right && <div className={styles.horizontalLineRight} />}
				{mini && left && <div className={styles.horizontalLineLeft} />}
			</div>
		);

		return (
			<div className={styles.container}>
				{lines}
				{mini && <div className={styles.verticalLine} />}
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

					{comingSoon ? (
						<div style={{ fontSize: "xx-small" }}>
							🚧 {locales.get("coming_soon")}
						</div>
					) : isUnlocked ? (
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
				{mini && <div className={styles.verticalLine} />}
				{lines}
			</div>
		);
	}

	get _isUnlocked() {
		const { book, chapter } = this.props;
		return book.isUnlocked(chapter.levels[0].id);
	}

	_go = () => {
		if (!this._isUnlocked || this.props.comingSoon) return;

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
