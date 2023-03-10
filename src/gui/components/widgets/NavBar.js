import React, { PureComponent } from "react";
import Badge from "react-bootstrap/Badge";
import { FaChevronLeft, FaChevronRight, FaHome, FaTrash } from "react-icons/fa";
import { connect } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import locales from "../../../locales";
import IconButton from "./IconButton";
import ProgressList from "./ProgressList";
// import VolumeSlider from "./VolumeSlider";
import styles from "./NavBar.module.css";

class NavBar extends PureComponent {
	render() {
		const { maxLevelId, chapter, level, goBack, goTo, resetLevel } = this.props;

		const levelIndex = _.findIndex(chapter.levels, (it) => it.id === level.id);

		return (
			<div className={styles.navbar}>
				<div className={classNames(styles.item, styles.text)}>
					<IconButton
						Icon={FaHome}
						tooltip={locales.get("goBack")}
						onClick={goBack}
					/>
					{_.first(chapter.levels).id > 0 && (
						<IconButton
							Icon={FaChevronLeft}
							tooltip={locales.get("chapter_previous")}
							onClick={() => goTo(_.first(chapter.levels).id - 1)}
						/>
					)}
					<span>
						{chapter.number}.{levelIndex + 1} / {chapter.name[locales.language]}{" "}
						/ {level.name[locales.language]}
					</span>
					{level.isUsingSnapshot && (
						<Badge bg="warning" text="dark" className={styles.warning}>
							{locales.get("using_old_snapshot")}
						</Badge>
					)}
					<div className={styles.buttons}>
						{/* <div className={styles.slider}>
							<VolumeSlider navBarMode />
						</div> */}
						{!level.memory.content.multifile && (
							<IconButton
								style={{ marginLeft: 8 }}
								Icon={FaTrash}
								tooltip={locales.get("reset_level")}
								onClick={resetLevel}
							/>
						)}
						{maxLevelId > _.last(chapter.levels).id && (
							<IconButton
								Icon={FaChevronRight}
								tooltip={locales.get("chapter_next")}
								onClick={() => goTo(_.last(chapter.levels).id + 1)}
							/>
						)}
					</div>
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
	goTo: level.goTo,
	resetLevel: level.resetProgress,
});

export default connect(undefined, mapDispatchToProps)(NavBar);
