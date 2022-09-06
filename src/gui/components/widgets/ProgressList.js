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
		const { levels, goTo } = this.props;

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
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									goTo(level.id);
								}}
								className={classNames(styles.level /*, styles.success*/)}
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
		dispatch(push(`/levels/${levelId}`));
	},
});

export default connect(undefined, mapDispatchToProps)(ProgressList);
