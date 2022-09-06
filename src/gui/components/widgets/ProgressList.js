import React, { PureComponent } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import locales from "../../../locales";
import classNames from "classnames";
import styles from "./ProgressList.module.css";

class ProgressList extends PureComponent {
	render() {
		const { maxLevelId, levels, goTo } = this.props;

		return (
			<div className={styles.progressList}>
				{levels.map((level, i) => {
					return (
						<OverlayTrigger
							key={level.id}
							placement="top"
							overlay={
								<Tooltip>
									{i + 1}. {level.name[locales.language]}
								</Tooltip>
							}
						>
							<div
								onClick={() => {
									if (level.id <= maxLevelId) goTo(level.id);
								}}
								className={classNames(
									styles.level,
									level.id < maxLevelId
										? styles.success
										: level.id > maxLevelId
										? styles.locked
										: styles.highlight
								)}
							/>
						</OverlayTrigger>
					);
				})}
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => ({
	goTo(levelId) {
		dispatch(push(`/levels/${levelId}?r=${Math.random()}`));
	},
});

export default connect(undefined, mapDispatchToProps)(ProgressList);
