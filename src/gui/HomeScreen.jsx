import React, { PureComponent } from "react";
import { Layer, Stage } from "@pixi/layers";
import { CRTFilter } from "pixi-filters";
import { PointLight, lightGroup } from "pixi-lights";
import * as PIXI from "pixi.js";
import { Toaster } from "react-hot-toast";
import { connect } from "react-redux";
import Book from "../level/Book";
import locales from "../locales";
import ChapterSelectModal from "./components/modals/ChapterSelectModal";
import CreditsModal from "./components/modals/CreditsModal";
import SettingsModal from "./components/modals/SettingsModal";
import Button from "./components/widgets/Button";
import ToggableButton from "./components/widgets/ToggableButton";
import styles from "./HomeScreen.module.css";

const DESKTOP_ONLY_MSG = "💻 This is a desktop-only experience!";
const ASSET_LOGO = "assets/logo.png";
const ASSET_BACKGROUND = "assets/tiling-background.png";
const UI_SELECTOR = "#ui";
const BACKGROUND_COLOR = 0x000000;
const BACKGROUND_TILE_Y = 60;
const BACKGROUND_ALPHA = 0.35;
const BACKGROUND_SPEED = 2;
const LIGHT_COLOR = 0x854dff;
const LIGHT_LUMINOSITY = 1.5;
const LIGHT_X = 400;
const LIGHT_Y = 50;
const UI_MARGIN = 16;
const SCALE_FACTOR = 0.5;
const CRT_SPEED = 0.25;
const MIN_WIDTH = 512;
const MIN_HEIGHT = 256;

class HomeScreen extends PureComponent {
	state = { fontsLoaded: false };

	render() {
		const {
			gameMode,
			isSettingsOpen,
			isChapterSelectOpen,
			isCreditsOpen,
			setGameMode,
			setSettingsOpen,
			setChapterSelectOpen,
			setCreditsOpen,
		} = this.props;
		const { fontsLoaded } = this.state;

		if (!fontsLoaded) return false;

		return (
			<>
				<Toaster containerClassName="toaster-wrapper" />
				<div className={styles.container} ref={this.onReady} />

				<SettingsModal
					open={isSettingsOpen}
					setSettingsOpen={setSettingsOpen}
				/>

				<ChapterSelectModal
					open={isChapterSelectOpen}
					setChapterSelectOpen={setChapterSelectOpen}
				/>

				<CreditsModal open={isCreditsOpen} setCreditsOpen={setCreditsOpen} />

				<div id="ui" className={styles.ui}>
					<div
						className={styles.box}
						dangerouslySetInnerHTML={{ __html: locales.get("plot") }}
					/>

					<div className={styles.buttons}>
						<div className={styles.button}>
							<ToggableButton
								onClick={this._play}
								options={[
									{
										labelKey: "button_play",
										mode: "campaign",
									},
									{
										labelKey: "mode_free",
										mode: "free",
									},
								]}
								selectedOption={gameMode}
								onOptionSelect={(opt) => setGameMode(opt.mode)}
							/>
						</div>
						<div className={styles.button}>
							<Button onClick={this._support}>
								{locales.get("button_support")}
							</Button>
						</div>
						<div className={styles.button}>
							<Button onClick={this._openSettings}>
								{locales.get("button_settings")}
							</Button>
						</div>
						{window.DESKTOP_MODE && (
							<Button onClick={this._quit}>{locales.get("button_quit")}</Button>
						)}
					</div>

					<div style={{ marginTop: 16, fontSize: 12 }}>
						🧪 {locales.get("_created_by")}{" "}
						<a href="https://r-labs.io" target="_blank" rel="noreferrer">
							[r]labs
						</a>
						{" ❓ "}
						<button
							type="button"
							className="link-button"
							onClick={this._openFAQ}
						>
							{locales.get("_faq")}
						</button>
						{" 🎥 "}
						<a
							href="https://www.youtube.com/watch?v=sBhFulSp4KQ"
							target="_blank"
							rel="noreferrer"
						>
							{locales.get("_trailer")}
						</a>
						{" 🎶 "}
						<a
							href="https://music.youtube.com/playlist?list=OLAK5uy_mo3Gh4YUg4OSMkPn5w1fGnLl2wwUXzcF4&si=tjiwZx8SbbiomHWQ"
							target="_blank"
							rel="noreferrer"
						>
							{locales.get("_ost")}
						</a>
						{" 🌐 "}
						<a
							href="https://discord.gg/mFGDxSxEJu"
							target="_blank"
							rel="noreferrer"
						>
							{locales.get("_community")}
						</a>
						{" 📜 "}
						<button
							type="button"
							className="link-button"
							onClick={this._openCredits}
						>
							{locales.get("_credits")}
						</button>
					</div>
				</div>
			</>
		);
	}

	componentDidMount() {
		if (!this._canPlay()) return;

		document.fonts.ready.then(() => {
			this.setState({ fontsLoaded: true });
		});
	}

	componentWillUnmount() {
		if (this._app) {
			try {
				const gl = this._app.renderer.gl;
				gl.getExtension("WEBGL_lose_context")?.loseContext();
			} catch (e) {
				console.warn(e);
			}

			try {
				this._app.destroy(true, true);
			} catch (e) {
				console.warn(e);
			}
		}
	}

	onReady = (div) => {
		if (!div) return;

		const loader = new PIXI.Loader();
		loader.reset();
		loader.add("logo", ASSET_LOGO);
		loader.add("background", ASSET_BACKGROUND);

		const sprites = {};
		let logoHeight = 0;
		loader.load((loader, resources) => {
			sprites.logo = new PIXI.Sprite(resources.logo.texture);
			sprites.background = new PIXI.TilingSprite(resources.background.texture);
			logoHeight = resources.logo.texture.height;
		});

		let error = false;
		loader.onError.add(() => {
			error = true;
		});

		loader.onComplete.add(() => {
			if (error) {
				alert("Error loading assets.");
				return;
			}

			sprites.background.tilePosition.y = BACKGROUND_TILE_Y;
			sprites.background.alpha = BACKGROUND_ALPHA;

			const app = new PIXI.Application({
				resizeTo: div,
				backgroundColor: BACKGROUND_COLOR,
			});
			this._app = app;

			app.stage = new Stage();
			const crtFilter = this._createCRTFilter();
			app.stage.filters = [crtFilter];
			app.stage.filterArea = app.screen;

			const lightContainer = new PIXI.Container();
			const light = new PointLight(LIGHT_COLOR, LIGHT_LUMINOSITY);
			lightContainer.addChild(light);

			app.stage.addChild(
				sprites.background,
				sprites.logo,
				new Layer(lightGroup),
				lightContainer
			);

			app.ticker.add(function (delta) {
				sprites.background.width = app.renderer.width;
				sprites.background.height = app.renderer.height;

				const logoScale = (app.renderer.height / logoHeight) * SCALE_FACTOR;
				sprites.logo.scale.x = logoScale;
				sprites.logo.scale.y = logoScale;

				const ui = document.querySelector(UI_SELECTOR);
				if (ui) {
					ui.style.display =
						app.renderer.width >= MIN_WIDTH && app.renderer.height >= MIN_HEIGHT
							? "flex"
							: "none";

					const uiScale = Math.min(
						(app.renderer.width / ui.clientWidth) * SCALE_FACTOR,
						(app.renderer.height / ui.clientHeight) * SCALE_FACTOR,
						1
					);
					ui.style.transform = `translate(-50%, 0) scale(${uiScale})`;
					window.app = app;

					sprites.logo.position.x =
						app.renderer.width / 2 - sprites.logo.width / 2;
					sprites.logo.position.y =
						app.renderer.height / 2 -
						(sprites.logo.height + ui.clientHeight * uiScale) / 2;
					light.x = sprites.logo.x + LIGHT_X * logoScale;
					light.y = sprites.logo.y + LIGHT_Y * logoScale;

					ui.style.top = `${
						sprites.logo.position.y + sprites.logo.height + UI_MARGIN
					}px`;
				}

				crtFilter.time += delta * CRT_SPEED;
				sprites.background.tilePosition.x -= delta * BACKGROUND_SPEED;
			});

			div.appendChild(app.view);
		});
	};

	_createCRTFilter() {
		return new CRTFilter({
			curvature: 5,
			lineWidth: 5,
			lineContrast: 0.25,
			noise: 0.2,
			noiseSize: 1,
			vignetting: 0.3,
			vignettingAlpha: 1,
			vignettingBlur: 0.3,
			seed: 0,
			time: 10,
		});
	}

	_openSettings = () => {
		this.props.setSettingsOpen(true);
	};

	_openCredits = () => {
		this.props.setCreditsOpen(true);
	};

	_play = () => {
		if (!this._canPlay()) return;

		switch (this.props.gameMode) {
			case "free":
				return this._playFreeMode();
			default:
				return this._playCampaign();
		}
	};

	_playCampaign = () => {
		if (this.props.maxChapterNumber > 1) this.props.setChapterSelectOpen(true);
		else this.props.play();
	};

	_playFreeMode = () => {
		this.props.goTo(Book.FREE_MODE_LEVEL);
	};

	_openFAQ = () => {
		if (!this._canPlay()) return;

		this.props.goTo(Book.FAQ_LEVEL);
	};

	_support = () => {
		window.open("https://buymeacoffee.com/afska");
	};

	_quit = () => {
		window.close();
	};

	_canPlay() {
		if (isMobile()) {
			alert(DESKTOP_ONLY_MSG);
			return false;
		}

		return true;
	}
}

const mapStateToProps = ({ level, savedata }) => ({
	maxChapterNumber: savedata.maxChapterNumber,
	gameMode: savedata.gameMode,
	isSettingsOpen: level.isSettingsOpen,
	isChapterSelectOpen: level.isChapterSelectOpen,
	isCreditsOpen: level.isCreditsOpen,
});
const mapDispatchToProps = ({ level, savedata }) => ({
	play: level.goToLastLevel,
	goTo: level.goTo,
	setGameMode: savedata.setGameMode,
	setSettingsOpen: level.setSettingsOpen,
	setChapterSelectOpen: level.setChapterSelectOpen,
	setCreditsOpen: level.setCreditsOpen,
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

function isMobile() {
	let check = false;
	(function (a) {
		if (
			/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
				a
			) ||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
				a.substr(0, 4)
			)
		)
			check = true;
	})(navigator.userAgent || navigator.vendor || window.opera);
	return check;
}
