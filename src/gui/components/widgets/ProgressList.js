import React, { PureComponent } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import classNames from "classnames";
import styles from "./ProgressList.module.css";

export default class ProgressList extends PureComponent {
	render() {
		return (
			<div className={styles.progressList}>
				<OverlayTrigger
					placement="top"
					overlay={
						<Tooltip id={`tooltip-1`}>
							Tooltip on <strong>top</strong>.
						</Tooltip>
					}
				>
					<a
						href="https://google.com"
						className={classNames(styles.level, styles.success)}
					/>
				</OverlayTrigger>

				<a
					href="https://google.com"
					className={classNames(styles.level, styles.success)}
				/>
				<a
					href="https://google.com"
					className={classNames(styles.level, styles.success)}
				/>
				<a href="https://google.com" className={classNames(styles.level)} />
				<a href="https://google.com" className={classNames(styles.level)} />
				<a href="https://google.com" className={classNames(styles.level)} />
				<a href="https://google.com" className={classNames(styles.level)} />
				<a href="https://google.com" className={classNames(styles.level)} />
				<a href="https://google.com" className={classNames(styles.level)} />
				<a href="https://google.com" className={classNames(styles.level)} />
				<a
					href="https://google.com"
					className={classNames(styles.level, styles.success)}
				/>
			</div>
		);
	}
}
