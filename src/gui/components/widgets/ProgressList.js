import React, { PureComponent } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import locales from "../../../locales";
import classNames from "classnames";
import styles from "./ProgressList.module.css";

export default class ProgressList extends PureComponent {
	render() {
		const { levels } = this.props;

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
								href="https://google.com"
								className={classNames(styles.level /*, styles.success*/)}
							/>
						</OverlayTrigger>
					);
				})}
			</div>
		);
	}
}
