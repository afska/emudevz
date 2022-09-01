import React, { PureComponent } from "react";
import ProgressList from "./ProgressList";
import IconButton from "./IconButton";
import { FaChevronLeft } from "react-icons/fa";
import styles from "./NavBar.module.css";

export default class NavBar extends PureComponent {
	render() {
		return (
			<div className={styles.navbar}>
				<div className={styles.item}>
					<IconButton Icon={FaChevronLeft} tooltip="Go back" />
					<span>Chapter 1: Getting Started</span>
				</div>
				<div className={styles.item}>
					<ProgressList />
				</div>
			</div>
		);
	}
}
