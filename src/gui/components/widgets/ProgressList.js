import React, { PureComponent } from "react";
import classNames from "classnames";
import styles from "./ProgressList.module.css";

export default class ProgressList extends PureComponent {
	render() {
		return (
			<div className={styles.progressList}>
				<a
					href="https://google.com"
					className={classNames(styles.level, styles.success)}
				/>

				<a
					href="https://bing.com"
					className={classNames(styles.level, styles.failure)}
				/>

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
				<a href="https://google.com" className={classNames(styles.level)} />
			</div>
		);
	}
}
