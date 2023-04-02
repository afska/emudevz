import React, { PureComponent } from "react";
import Badge from "react-bootstrap/Badge";
import Marquee from "react-fast-marquee";
import {
	FaCalculator,
	FaChevronLeft,
	FaChevronRight,
	FaComment,
	FaHome,
	FaMusic,
	FaTrash,
} from "react-icons/fa";
import { connect } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import locales from "../../../locales";
import { analytics } from "../../../utils";
import music from "../../sound/music";
import CalculatorModal from "./CalculatorModal";
import IconButton from "./IconButton";
import ProgressList from "./ProgressList";
import VolumeSlider from "./VolumeSlider";
import styles from "./NavBar.module.css";

class NavBar extends PureComponent {
	state = { isCalculatorOpen: false };

	render() {
		const {
			chapter,
			level,
			book,
			maxLevelId,
			trackInfo,
			goBack,
			goToPrevious,
			goToNext,
			resetLevel,
		} = this.props;

		const levelDefinition = book.getLevelDefinitionOf(level.id);

		return (
			<div className={styles.navbar}>
				<CalculatorModal
					open={this.state.isCalculatorOpen}
					onClose={this._closeCalculator}
				/>

				<div className={classNames(styles.item, styles.text)}>
					<IconButton
						Icon={FaHome}
						tooltip={locales.get("go_back")}
						onClick={goBack}
					/>
					{_.first(chapter.levels).globalId > 0 && (
						<IconButton
							Icon={FaChevronLeft}
							tooltip={locales.get("chapter_previous")}
							onClick={() => goToPrevious(_.first(chapter.levels).id)}
						/>
					)}
					<span>
						{levelDefinition.humanId} / {chapter.name[locales.language]} /{" "}
						{level.name[locales.language]}
					</span>
					{level.isUsingSnapshot && (
						<Badge bg="warning" text="dark" className={styles.warning}>
							{locales.get("using_old_snapshot")}
						</Badge>
					)}
					<div className={styles.buttons}>
						<IconButton
							style={{ marginRight: 32 }}
							Icon={FaCalculator}
							tooltip={locales.get("calculator")}
							onClick={this._openCalculator}
						/>
						<div className={styles.slider} style={{ marginRight: 12 }}>
							<VolumeSlider className="navbar-volume-slider" />
						</div>
						<IconButton
							Icon={FaMusic}
							tooltip={
								trackInfo ? (
									<Marquee style={{ width: 150 }} gradient={false}>
										🎶 {trackInfo.artist} 🎼 {trackInfo.title}&nbsp;
									</Marquee>
								) : (
									"?"
								)
							}
							onClick={() => music.next()}
						/>
						<IconButton
							style={{ marginLeft: 8 }}
							Icon={FaComment}
							tooltip={"Send feedback"}
							onClick={() =>
								analytics.requestFeedback(
									"navbar",
									"What do you think of the game? 👀"
								)
							}
						/>
						{(!level.memory.content.multifile || level.id === maxLevelId) && (
							<IconButton
								style={{ marginLeft: 8 }}
								Icon={FaTrash}
								tooltip={locales.get("reset_level")}
								onClick={resetLevel}
							/>
						)}
						{book.isFinished(_.last(chapter.levels).id, maxLevelId) && (
							<IconButton
								Icon={FaChevronRight}
								tooltip={locales.get("chapter_next")}
								onClick={() => goToNext(_.last(chapter.levels).id)}
							/>
						)}
					</div>
				</div>
				<div className={styles.item}>
					<ProgressList
						book={book}
						selectedLevelId={level.id}
						maxLevelId={maxLevelId}
						levelDefinitions={chapter.levels}
					/>
				</div>
			</div>
		);
	}

	_openCalculator = () => {
		this.setState({ isCalculatorOpen: true });
	};

	_closeCalculator = () => {
		this.setState({ isCalculatorOpen: false });
	};
}

const mapStateToProps = ({ book, savedata }) => ({
	book: book.instance,
	maxLevelId: savedata.levelId,
	trackInfo: savedata.trackInfo,
});
const mapDispatchToProps = ({ level }) => ({
	goBack: level.goHome,
	goToPrevious: level.goToPrevious,
	goToNext: level.goToNext,
	resetLevel: level.resetProgress,
});

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
