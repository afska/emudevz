import React, { PureComponent } from "react";
import ProgressList from "./ProgressList";
import styles from "./NavBar.module.css";

export default class NavBar extends PureComponent {
	render() {
		return (
			<div className={styles.navbar}>
				<div className={styles.item}>Chapter 1: Getting Started</div>
				<div className={styles.item}>
					<ProgressList />
				</div>
			</div>
		);
	}
}
