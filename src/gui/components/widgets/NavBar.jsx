import React, { PureComponent } from "react";
import Badge from "react-bootstrap/Badge";
import Marquee from "react-fast-marquee";
import {
	FaCalculator,
	FaChevronLeft,
	FaChevronRight,
	FaClock,
	FaCog,
	FaHome,
	FaMusic,
	FaPause,
	FaPlay,
	FaTrash,
} from "react-icons/fa";
import { connect } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import Book from "../../../level/Book";
import Level from "../../../level/Level";
import locales from "../../../locales";
import { bus } from "../../../utils";
import music from "../../sound/music";
import CalculatorModal from "../modals/CalculatorModal";
import FreeModeSettingsModal from "../modals/FreeModeSettingsModal";
import ImageDiffModal from "../modals/ImageDiffModal";
import LevelHistoryModal from "../modals/LevelHistoryModal";
import IconButton from "./IconButton";
import ProgressList from "./ProgressList";
import VolumeSlider from "./VolumeSlider";
import styles from "./NavBar.module.css";

class NavBar extends PureComponent {
	state = {
		isCalculatorOpen: false,
		isFreeModeSettingsOpen: false,
		imageDiffSequence: null,
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
			setChapterSelectOpen,
		} = this.props;

		const isFreeMode = level.id === Book.FREE_MODE_LEVEL;
		const levelDefinition = book.getLevelDefinitionOf(level.id);
		const firstLevelDefinition = _.first(chapter.levels);
		const lastLevelDefinition = _.last(chapter.levels);
		const canRunEmulator = Level.current.canLaunchEmulatorFromNavbar(chapter);

		return (
			<div className={styles.navbar}>
				<FreeModeSettingsModal
					open={this.state.isFreeModeSettingsOpen}
					onClose={this._closeFreeModeSettings}
				/>
				<CalculatorModal
					open={this.state.isCalculatorOpen}
					onClose={this._closeCalculator}
				/>

				<LevelHistoryModal
					open={this.state.isLevelHistoryOpen}
					onClose={this._closeLevelHistory}
				/>

				<ImageDiffModal
					sequence={this.state.imageDiffSequence}
					onClose={this._closeImageDiff}
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
						{!chapter.isSpecial && <span>{levelDefinition.humanId} / </span>}
						{!isFreeMode && (
							<span
								className="highlight-link"
								onClick={() => {
									setChapterSelectOpen(true);
								}}
							>
								{chapter.name[locales.language]} /{" "}
							</span>
						)}
						{level.name[locales.language]}
					</span>
					{level.isUsingSnapshot && (
						<Badge
							bg="warning"
							text="dark"
							className={classNames(
								styles.warning,
								"d-none d-lg-block d-xl-block"
							)}
						>
							{locales.get("using_old_snapshot")}
						</Badge>
					)}
					<div className={styles.buttons}>
						{isFreeMode && (
							<IconButton
								style={{ marginRight: 8 }}
								Icon={FaCog}
								tooltip={locales.get("free_mode_settings")}
								onClick={this._openFreeModeSettings}
							/>
						)}
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
							Icon={music.isPaused ? FaPause : FaMusic}
							tooltip={
								trackInfo ? (
									<Marquee style={{ width: 150 }} gradient={false}>
										🎶 {trackInfo.artist} 🎼 {trackInfo.title}&nbsp;
									</Marquee>
								) : (
									"?"
								)
							}
							onClick={(e) => {
								this._onMusicChange(() => music.next());
							}}
							onContextMenu={(e) => {
								e.preventDefault();
								this._onMusicChange(() => music.previous());
							}}
						/>
						{book.canReset(level) && (
							<IconButton
								style={{ marginLeft: 8 }}
								Icon={FaTrash}
								tooltip={locales.get("reset_level")}
								onClick={resetLevel}
							/>
						)}
						{!isFreeMode && (
							<IconButton
								style={{ marginLeft: 8 }}
								Icon={FaClock}
								tooltip={locales.get("level_history")}
								onClick={() => this._openLevelHistory()}
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
				{!isFreeMode && (
					<div className={styles.item}>
						<ProgressList
							book={book}
							chapter={chapter}
							selectedLevelId={level.id}
						/>
					</div>
				)}
			</div>
		);
	}

	_openCalculator = () => {
		this.setState({ isCalculatorOpen: true });
	};

	_closeCalculator = () => {
		this.setState({ isCalculatorOpen: false });
	};

	_openFreeModeSettings = () => {
		this.setState({ isFreeModeSettingsOpen: true });
	};

	_closeFreeModeSettings = () => {
		this.setState({ isFreeModeSettingsOpen: false });
	};

	_openLevelHistory = () => {
		this.setState({ isLevelHistoryOpen: true });
	};

	_closeLevelHistory = () => {
		this.setState({ isLevelHistoryOpen: false });
	};

	_runEmulator = () => {
		Level.current.launchEmulator();
	};

	_setImageDiff = (sequence) => {
		this.setState({
			imageDiffSequence: sequence,
		});
	};

	_closeImageDiff = () => {
		this._setImageDiff(null);
	};

	_onMusicChange = (action) => {
		if (music.isPaused) music.resume();
		else {
			if (window.EmuDevz.isRunningEmulator()) music.pause();
			else action();
		}

		this.forceUpdate();
	};

	componentDidMount() {
		this._subscriber = bus.subscribe({
			"new-listeners": () => this.forceUpdate(),
			"image-diff": this._setImageDiff,
			"pause-music": () => {
				this.forceUpdate();
			},
			"resume-music": () => {
				this.forceUpdate();
			},
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
	setChapterSelectOpen: level.setChapterSelectOpen,
});

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
