import React, { PureComponent } from "react";
import Badge from "react-bootstrap/Badge";
import Marquee from "react-fast-marquee";
import {
	FaCalculator,
	FaChevronLeft,
	FaChevronRight,
	FaComment,
	FaExclamationCircle,
	FaHome,
	FaMusic,
	FaPlay,
	FaTrash,
	FaTrashRestore,
} from "react-icons/fa";
import { connect } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import Level from "../../../level/Level";
import locales from "../../../locales";
import { analytics, bus } from "../../../utils";
import music from "../../sound/music";
import CalculatorModal from "./CalculatorModal";
import IconButton from "./IconButton";
import ProgressList from "./ProgressList";
import VolumeSlider from "./VolumeSlider";
import styles from "./NavBar.module.css";

class NavBar extends PureComponent {
	state = {
		isCalculatorOpen: false,
		areYouSureRollback: false,
	};

	render() {
		const {
			chapter,
			level,
			book,
			trackInfo,
			goBack,
			goToPrevious,
			goToNext,
			resetLevel,
			rollbackLevel,
		} = this.props;

		const levelDefinition = book.getLevelDefinitionOf(level.id);
		const firstLevelDefinition = _.first(chapter.levels);
		const lastLevelDefinition = _.last(chapter.levels);
		const canRunEmulator = bus.isListeningTo("pin");

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
					{book.canGoToPreviousChapter(chapter) && (
						<IconButton
							Icon={FaChevronLeft}
							tooltip={locales.get("chapter_previous")}
							onClick={() => goToPrevious(firstLevelDefinition.id)}
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
						{book.canUseEmulator && canRunEmulator && (
							<IconButton
								style={{ marginRight: 8 }}
								Icon={FaPlay}
								tooltip={locales.get("run_emulator")}
								onClick={this._runEmulator}
							/>
						)}
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
						{book.canReset(level) && (
							<IconButton
								style={{ marginLeft: 8 }}
								Icon={FaTrash}
								tooltip={locales.get("reset_level")}
								onClick={resetLevel}
							/>
						)}
						{book.canRollback(level) && !this.state.areYouSureRollback && (
							<IconButton
								style={{ marginLeft: 8 }}
								Icon={FaTrashRestore}
								tooltip={locales.get("rollback")}
								onClick={() => this.setState({ areYouSureRollback: true })}
							/>
						)}
						{book.canRollback(level) && this.state.areYouSureRollback && (
							<IconButton
								style={{ marginLeft: 8, color: "#ff2d2d" }}
								Icon={FaExclamationCircle}
								tooltip={locales.get("rollback_sure")}
								onClick={() => rollbackLevel(level)}
							/>
						)}
						{book.canGoToNextChapter(chapter) && (
							<IconButton
								Icon={FaChevronRight}
								tooltip={locales.get("chapter_next")}
								onClick={() => goToNext(lastLevelDefinition.id)}
							/>
						)}
					</div>
				</div>
				<div className={styles.item}>
					<ProgressList
						book={book}
						chapter={chapter}
						selectedLevelId={level.id}
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

	_runEmulator = () => {
		Level.current.launchEmulator();
	};

	componentDidMount() {
		this._subscriber = bus.subscribe({
			"new-listeners": () => this.forceUpdate(),
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}
}

const mapStateToProps = ({ book, savedata }) => ({
	book: book.instance,
	trackInfo: savedata.trackInfo,
});
const mapDispatchToProps = ({ level }) => ({
	goBack: level.goHome,
	goToPrevious: level.goToPrevious,
	goToNext: level.goToNext,
	resetLevel: level.resetProgress,
	rollbackLevel: level.rollback,
});

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
