import React from "react";
import _ from "lodash";
import { bus } from "../../../../utils";
import Integration from "./Integration";

export default class RavensGate extends Integration {
	state = {
		life: 0,
		maxLife: 0,
		coins: 0,
		keys: 0,
		weaponB: 0xff,
		weaponA: 0xff,
		roomId: 0,
		gameOver: false,
		victory: false,
	};

	render() {
		const {
			life,
			maxLife,
			coins,
			keys,
			weaponB,
			weaponA,
			roomId,
			gameOver,
			victory,
		} = this.state;

		return (
			<div style={{ width: "100%", textAlign: "center", whiteSpace: "nowrap" }}>
				{gameOver ? (
					<span>☠️☠️☠️</span>
				) : victory ? (
					<span>🎉🎉🎉</span>
				) : (
					<span
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<span>
							💓 {life.toString().padStart(2, "0")}/
							{maxLife.toString().padStart(2, "0")}&nbsp;
						</span>
						<span>💰 {coins.toString().padStart(3, "0")}&nbsp;</span>
						<span>🔑 {keys.toString().padStart(2, "0")}&nbsp;</span>
						<span>🅱️ {WEAPONS[weaponB] || WEAPONS.unknown}&nbsp;</span>
						<span>🅰️ {WEAPONS[weaponA] || WEAPONS.unknown}&nbsp;</span>
						<span>🗺️&nbsp;</span>
						<span
							style={{
								display: "flex",
								flexDirection: "column",
								fontSize: 2,
								lineHeight: "normal",
								verticalAlign: "middle",
							}}
						>
							{[
								_.range(0, 8),
								_.range(8, 16),
								_.range(16, 24),
								_.range(24, 32),
								_.range(32, 40),
								_.range(40, 48),
								_.range(48, 56),
								_.range(56, 64),
							].map((row, i) => (
								<span key={i}>
									{row.map((cell) => (roomId === cell ? "🔶" : "🔷")).join("")}
								</span>
							))}
						</span>
					</span>
				)}
			</div>
		);
	}

	onFrame = () => {
		const neees = this.props.getNEEES();
		if (!neees) return;

		const life = neees.cpu.memory.read(0x045f);
		const maxLife = neees.cpu.memory.read(0x0462);
		const coins = neees.cpu.memory.read(0x0460);
		const keys = neees.cpu.memory.read(0x0461);
		const weaponB = neees.cpu.memory.read(0x0321);
		const weaponA = neees.cpu.memory.read(0x0322);
		const roomId = neees.cpu.memory.read(0x0449);
		const gameOver = neees.cpu.memory.read(0x045d) === 1;
		const victory = this._checkTiles(neees, VICTORY);

		this.setState({
			life,
			maxLife,
			coins,
			keys,
			weaponB,
			weaponA,
			roomId,
			gameOver,
			victory,
		});

		if (victory) {
			this._disconnectControllers(neees);
			bus.emit("ravensgate-end");
		}
	};
}

const WEAPONS = {
	0xff: "🚫",
	0x00: "⚔️",
	0x01: "💉",
	0x02: "💣",
	0x03: "🔱",
	0x04: "🔨",
	unknown: "❓",
};
const VICTORY = [
	[5, 22, 0xd8],
	[6, 22, 0x97],
	[7, 22, 0xb8],
	[8, 22, 0x98],
	[9, 22, 0xa7],
	[10, 22, 0x00],
	[11, 22, 0xb7],
	[12, 22, 0xc9],
	[13, 22, 0xe9],
	[14, 22, 0x00],
	[15, 22, 0xc7],
	[16, 22, 0xc9],
	[17, 22, 0xd7],
	[18, 22, 0x00],
	[19, 22, 0xe7],
	[20, 22, 0xf7],
	[21, 22, 0xb8],
	[22, 22, 0xb7],
	[23, 22, 0xd9],
	[24, 22, 0x98],
	[25, 22, 0xa9],
	[26, 22, 0xf6],
];
