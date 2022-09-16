import React, { PureComponent } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { connect } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import locales from "../../../locales";
import IconButton from "./IconButton";
import ProgressList from "./ProgressList";
import styles from "./NavBar.module.css";

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
