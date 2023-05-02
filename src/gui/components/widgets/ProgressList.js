import React, { PureComponent } from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import locales from "../../../locales";
import Tooltip from "./Tooltip";
import styles from "./ProgressList.module.css";

class ProgressList extends PureComponent {
	render() {
		const { book, chapter, selectedLevelId, goTo } = this.props;

		const levelDefinitions = chapter.levels;
		const nextPendingLevel = book.nextPendingLevelOfChapter(chapter.id);

		return (
			<div className={styles.progressList}>
				{levelDefinitions.map((levelDefinition, i) => {
					return (
						<Tooltip
							key={i}
							title={
								levelDefinition.humanId +
								" " +
								levelDefinition.name[locales.language]
							}
							placement="top"
						>
							<div
								onClick={() => {
									if (book.isUnlocked(levelDefinition.id))
										goTo(levelDefinition.id);
								}}
								className={classNames(
									styles.level,
									levelDefinition.id === nextPendingLevel?.id
										? styles.highlight
										: book.isFinished(levelDefinition.id)
										? styles.success
										: book.isUnlocked(levelDefinition.id)
										? styles.unlocked
										: styles.locked,
									levelDefinition.id === selectedLevelId && styles.selected,
									levelDefinition.unlocksGame && styles.unlocksGame
								)}
							/>
						</Tooltip>
					);
				})}
			</div>
		);
	}
}

const mapDispatchToProps = ({ level }) => ({
	goTo: level.goTo,
});

export default connect(undefined, mapDispatchToProps)(ProgressList);
