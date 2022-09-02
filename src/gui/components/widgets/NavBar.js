import React, { PureComponent } from "react";
import ProgressList from "./ProgressList";
import IconButton from "./IconButton";
import { FaChevronLeft } from "react-icons/fa";
import locales from "../../../locales";
import classNames from "classnames";
import styles from "./NavBar.module.css";

export default class NavBar extends PureComponent {
	render() {
		const { chapter } = this.props;

		return (
			<div className={styles.navbar}>
				<div className={classNames(styles.item, styles.text)}>
					<IconButton Icon={FaChevronLeft} tooltip="Go back" />
					<span>{chapter.name[locales.language]}</span>
				</div>
				<div className={styles.item}>
					<ProgressList levels={chapter.levels} />
				</div>
			</div>
		);
	}
}
