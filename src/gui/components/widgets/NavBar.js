import React, { PureComponent } from "react";
import ProgressList from "./ProgressList";
import IconButton from "./IconButton";
import { FaChevronLeft } from "react-icons/fa";
import { connect } from "react-redux";
import locales from "../../../locales";
import classNames from "classnames";
import styles from "./NavBar.module.css";
import _ from "lodash";

class NavBar extends PureComponent {
	render() {
		const { maxLevelId, chapter, level, goBack } = this.props;

		const levelIndex = _.findIndex(chapter.levels, (it) => it.id === level.id);

		return (
			<div className={styles.navbar}>
				<div className={classNames(styles.item, styles.text)}>
					<IconButton
						Icon={FaChevronLeft}
						tooltip={locales.get("goBack")}
						onClick={goBack}
					/>
					<span>
						{chapter.number}.{levelIndex + 1} / {chapter.name[locales.language]}{" "}
						/ {level.name[locales.language]}
					</span>
				</div>
				<div className={styles.item}>
					<ProgressList
						selectedLevelId={level.id}
						maxLevelId={maxLevelId}
						levelDefinitions={chapter.levels}
					/>
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = ({ level }) => ({
	goBack: level.goHome,
});

export default connect(undefined, mapDispatchToProps)(NavBar);
