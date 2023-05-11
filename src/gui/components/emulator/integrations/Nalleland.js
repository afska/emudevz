import React from "react";
import locales from "../../../../locales";
import { bus } from "../../../../utils";
import Integration from "./Integration";

export default class Nalleland extends Integration {
	state = { mode: 0, lives: 0, victory: false };

	render() {
		const { mode, lives, victory } = this.state;

		const isLimitedLivesDisabled = (mode & MODE_LIMITED_LIVES_MASK) === 0;

		return (
			<div style={{ width: "100%", textAlign: "center", whiteSpace: "nowrap" }}>
				{victory ? (
					<span>🏆🏆🏆</span>
				) : mode === MODE_LIMITED_LIVES ? (
					<span>
						💓 <strong>{lives}</strong>{" "}
						{locales.get("integration_nalleland_lives")}
					</span>
				) : (
					<span>
						❌{" "}
						{isLimitedLivesDisabled
							? locales.get("integration_nalleland_wrong_mode_start1")
							: locales.get("integration_nalleland_wrong_mode_start2")}
						<strong>
							{locales.get("integration_nalleland_limited_lives")}
						</strong>
						{isLimitedLivesDisabled
							? locales.get("integration_nalleland_wrong_mode_end1")
							: locales.get("integration_nalleland_wrong_mode_end2")}
					</span>
				)}
			</div>
		);
	}

	onFrame = () => {
		const neees = this.props.getNEEES();
		if (!neees) return;

		this._moveTV(-15);

		const mode = neees.cpu.memory.readAt(0x0047);
		const lives = neees.cpu.memory.readAt(0x03ca);
		const victory = this._checkTiles(neees, VICTORY);

		this.setState({ mode, lives, victory });

		if (victory) {
			this._disconnectControllers(neees);
			bus.emit("nalleland-end");
		}
	};
}

const MODE_LIMITED_LIVES = 4;
const MODE_LIMITED_LIVES_MASK = 0b100;
const VICTORY = [
	[13, 10, 0xdf],
	[14, 10, 0xd2],
	[15, 10, 0xcc],
	[16, 10, 0xdd],
	[17, 10, 0xd8],
	[18, 10, 0xdb],
	[19, 10, 0xe2],
];
