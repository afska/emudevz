import React, { PureComponent } from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import locales from "../../../locales";
import Tooltip from "./Tooltip";
import styles from "./ProgressList.module.css";

class ProgressList extends PureComponent {
	render() {
		const {
			book,
			selectedLevelId,
			maxLevelId,
			levelDefinitions,
			goTo,
		} = this.props;

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
									if (book.isUnlocked(levelDefinition.id, maxLevelId))
										goTo(levelDefinition.id);
								}}
								className={classNames(
									styles.level,
									levelDefinition.id === maxLevelId
										? styles.highlight
										: book.isUnlocked(levelDefinition.id, maxLevelId)
										? styles.success
										: styles.locked,
									levelDefinition.id === selectedLevelId && styles.selected
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
