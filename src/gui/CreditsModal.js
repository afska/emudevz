import React, { PureComponent } from "react";
import Modal from "react-bootstrap/Modal";
import locales from "../locales";
import styles from "./CreditsModal.module.css";

const Section = ({ title, children, ...rest }) => {
	return (
		<div style={{ marginBottom: 16 }} {...rest}>
			<h4>{title}</h4>
			<div style={{ fontSize: "small", color: "#cfcfcf", paddingLeft: 16 }}>
				{children}
			</div>
		</div>
	);
};

const Game = ({ emojis, prefix = "", link, author, children, ...rest }) => {
	return (
		<div style={{ display: "flex" }} {...rest}>
			<span style={{ width: 45 }}>{emojis}</span>
			<div>
				{prefix}
				<a href={link} target="_blank" rel="noreferrer">
					{children}
				</a>{" "}
				{!!author && (
					<span>
						(by <strong>{author}</strong>)
					</span>
				)}
			</div>
		</div>
	);
};

export default class CreditsModal extends PureComponent {
	render() {
		const { open } = this.props;

		return (
			<Modal
				show={open}
				onHide={this._onClose}
				centered
				contentClassName={"crt " + styles.modalContent}
			>
				<Modal.Header>
					<Modal.Title>📜 {locales.get("_credits")}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Section title="🧪 Programming">
						Rodrigo Alfonso <strong>(@afska)</strong> /{" "}
						<a href="https://r-labs.io" target="_blank" rel="noreferrer">
							[r]labs
						</a>
					</Section>
					<Section title="🎼 Music">
						Axel Rizzo <strong>(@Synthenia)</strong> /{" "}
						<a
							href="https://open.spotify.com/artist/7ewiTkC0wCMdpx1Wp1z140"
							target="_blank"
							rel="noreferrer"
						>
							Synthenia
						</a>
					</Section>
					<Section title="🎨 Art">
						<li>
							<a
								href="https://x.com/AngryMuffinDSFW"
								target="_blank"
								rel="noreferrer"
							>
								Angry Muffin
							</a>
						</li>
						<li>
							<a
								href="https://www.instagram.com/damiandeamicis"
								target="_blank"
								rel="noreferrer"
							>
								Damian De Amicis
							</a>
						</li>
					</Section>
					<Section title="📚 Source code">
						🛠️{" "}
						<a
							href="https://github.com/afska/emudevz"
							target="_blank"
							rel="noreferrer"
						>
							Fork me on GitHub!
						</a>
					</Section>
					<Section title="🔑 Licenses">
						<Game
							emojis="💿💻"
							prefix={
								<span>
									<strong>Code</strong> is licensed under{" "}
								</span>
							}
							link="https://opensource.org/license/mit"
						>
							The MIT License
						</Game>
						<Game
							emojis="📖✏️"
							prefix={
								<span>
									<strong>Levels</strong> are licensed under{" "}
								</span>
							}
							link="https://creativecommons.org/licenses/by-nc/4.0"
						>
							CC BY-NC 4.0
						</Game>
						<br />
						This game uses open-source software, check{" "}
						<a href="licenses.txt" target="_blank" rel="noreferrer">
							Licenses
						</a>
						.
					</Section>
					<Section title="👾 Homebrew games">
						<div>
							<div>
								<Game
									emojis="💦🏛️"
									link="https://morphcatgames.itch.io/bobl"
									author="Morphcat Games"
								>
									Böbl
								</Game>
								<Game
									emojis="🍒🃏"
									link="https://github.com/pinobatch/croom-nes"
									author="PinoBatch"
								>
									Concentration Room
								</Game>
								<Game
									emojis="🦅🧷"
									link="https://miau6502.itch.io/crowborg"
									author="miau6502"
								>
									Crowborg
								</Game>
								<Game
									emojis="💫🐑"
									link="https://igwgames.com/classic-gaming/do-sheep-dream-of-velcro"
									author="IGW Games"
								>
									Dizzy Sheep Disaster
								</Game>
								<Game
									emojis="💤🐶"
									link="https://igwgames.com/classic-gaming/dream-dog-dilemma"
									author="IGW Games"
								>
									Dream Dog Dilemma
								</Game>

								<Game
									emojis="🙌☁️"
									link="https://github.com/xram64/falling-nes"
									author="xram64"
								>
									Falling
								</Game>
								<Game
									emojis="🌊🐈"
									link="https://igwgames.com/classic-gaming/feline-flood-fiasco"
									author="IGW Games"
								>
									Feline Flood Fiasco
								</Game>
								<Game
									emojis="🦟🍳"
									link="https://dustmop.itch.io/filthy-kitchen"
									author="dustmop"
								>
									Filthy Kitchen
								</Game>
								<Game
									emojis="🧱🐙"
									link="https://mhughson.itch.io/from-below"
									author="Matt Hughson"
								>
									From Below
								</Game>
								<Game
									emojis="⛽💥"
									link="https://johnybot.itch.io/heist"
									author="johnybot"
								>
									Heist
								</Game>
								<Game
									emojis="🌌🔫"
									link="https://gravelstudios.itch.io/isostasy"
									author="Gravel Studios"
								>
									Isostasy (Demo)
								</Game>
								<Game
									emojis="🚀💥"
									link="https://forums.nesdev.org/viewtopic.php?t=22135"
									author="nin-kuuku"
								>
									Jupiter Scope 2
								</Game>
								<Game
									emojis="💎⛏️"
									link="https://mhughson.itch.io/minekart-madness"
									author="Matt Hughson"
								>
									Minekart Madness
								</Game>
								<Game
									emojis="🐸🌍"
									link="https://igwgames.com/classic-gaming/missing-lands"
									author="IGW Games"
								>
									Missing Lands
								</Game>
								<Game
									emojis="🧸 📍"
									link="https://nallebeorn.itch.io/nalleland"
									author="Nallebeorn"
								>
									Nalleland
								</Game>
								<Game
									emojis="🦅⛩️"
									link="https://mercurybd.itch.io/ravens-gate-nes"
									author="MercuryBD"
								>
									Raven's Gate
								</Game>
								<Game
									emojis="🤖🧗"
									link="https://www.bitethechili.com/roboninja-climb"
									author="Bite The Chilli"
								>
									Robo-Ninja Climb
								</Game>
								<Game
									emojis="🕊️🛰️"
									link="https://morphcatgames.itch.io/spacegulls"
									author="Morphcat Games"
								>
									Spacegulls
								</Game>
								<Game
									emojis="🧚🧹"
									link="https://nia-prene.itch.io/star-power-demo"
									author="nia-prene"
								>
									Star Power Demo
								</Game>
								<Game
									emojis="🦸🤸"
									link="https://sgadrat.itch.io/super-tilt-bro"
									author="sgadrat"
								>
									Super Tilt Bro
								</Game>
								<Game
									emojis="📻💡"
									link="https://forums.nesdev.org/viewtopic.php?t=18042"
									author="samophlange"
								>
									Tesla Vs Edison
								</Game>
								<Game
									emojis="🌳🏠"
									link="https://github.com/pinobatch/thwaite-nes"
									author="PinoBatch"
								>
									Thwaite
								</Game>
								<Game
									emojis="🏭🔩"
									link="https://team-disposable.itch.io/trouble-in-2a03"
									author="Team Disposable"
								>
									Trouble At 2A03
								</Game>
								<Game
									emojis="🐺⛓️"
									link="https://lazycow.itch.io/wolfling"
									author="Lazycow"
								>
									Wolfling
								</Game>
								<Game
									emojis="🐺🌲"
									link="https://valdirsalgueiro.itch.io/wolf-spirit"
									author="valdirSalgueiro"
								>
									Wolf Spirit
								</Game>
							</div>
							<div style={{ fontSize: "small", marginTop: 8 }}>
								✅ All these games and test roms were included with the
								permission of their authors. If I made a mistake or you'd like
								your game here, drop me an e-mail!
							</div>
						</div>
					</Section>
					<Section title="🕵️ Test ROMs">
						<Game
							emojis="🧠🔎"
							link="https://www.qmtpro.com/~nes/misc/nestest.txt"
							author="kevtris"
						>
							nestest
						</Game>
						<Game
							emojis="👋🌎"
							link="https://pineight.com/nes/"
							author="PinoBatch"
						>
							Hello world
						</Game>
						<Game
							emojis="📺🔎"
							link="https://pineight.com/nes/"
							author="PinoBatch"
						>
							240p Test Suite
						</Game>
					</Section>
					<Section title="🙏 Thanks to...">
						<Game emojis="🕹️🛠️" link="https://www.nesdev.org">
							NesDev
						</Game>
						<Game
							emojis="👌💻"
							link="https://skilldrick.github.io/easy6502"
							author="skilldrick"
						>
							Easy 6502
						</Game>
					</Section>
				</Modal.Body>
			</Modal>
		);
	}

	_onClose = () => {
		this.props.setCreditsOpen(false);
	};
}
