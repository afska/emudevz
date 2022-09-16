import React, { PureComponent } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { connect } from "react-redux";
import classNames from "classnames";
import locales from "../../../locales";
import styles from "./ProgressList.module.css";

class ProgressList extends PureComponent {
	render() {
		const { selectedLevelId, maxLevelId, levelDefinitions, goTo } = this.props;

		return (
			<div className={styles.progressList}>
				{levelDefinitions.map((levelDefinition, i) => {
					return (
						<OverlayTrigger
							key={levelDefinition.id}
							placement="top"
							overlay={
								<Tooltip>
									{i + 1}. {levelDefinition.name[locales.language]}
								</Tooltip>
							}
						>
							<div
								onClick={() => {
									if (levelDefinition.id <= maxLevelId)
										goTo(levelDefinition.id);
								}}
								className={classNames(
									styles.level,
									levelDefinition.id < maxLevelId
										? styles.success
										: levelDefinition.id > maxLevelId
										? styles.locked
										: styles.highlight,
									levelDefinition.id === selectedLevelId && styles.selected
								)}
							/>
						</OverlayTrigger>
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
