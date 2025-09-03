import React, { PureComponent } from "react";
import { connect } from "react-redux";
import locales from "../../../locales";
import Button from "./Button";
import ProgressBar from "./ProgressBar";
import Tooltip from "./Tooltip";
import styles from "./LetsPlayChapter.module.css";

class LetsPlayChapter extends PureComponent {
	render() {
		if (!this._isUnlocked) return false;
		const { book, chapter, goTo, className, ...rest } = this.props;

		const totalLevels = chapter.levels.length;
		const totalCompleted = chapter.levels.filter((it) => book.isFinished(it.id))
			.length;
		const percentage = Math.round((totalCompleted / totalLevels) * 100);

		return (
			<Tooltip
				title={
					<div className={styles.tooltip}>
						<div>
							<strong>{chapter.name[locales.language]}</strong>
						</div>
						<div className={styles.small}>
							{locales.get("win_games_here_to_unlock_roms")}
						</div>
						<div className={styles.superSmall}>
							{totalCompleted} / {totalLevels} {locales.get("complete")}
						</div>
						<ProgressBar percentage={percentage} />
					</div>
				}
				placement="top"
			>
				<div className={styles.container}>
					<Button className={className} onClick={this._go} {...rest}>
						👾
					</Button>
				</div>
			</Tooltip>
		);
	}

	get _isUnlocked() {
		const { book, chapter } = this.props;
		return chapter.levels.some((it) => book.isUnlocked(it.id));
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

export default connect(null, mapDispatchToProps)(LetsPlayChapter);
