import locales from "../../../../locales";
import { bus } from "../../../../utils";
import Integration from "./Integration";

export default class SuperTiltBro extends Integration {
	state = { stocks: 0, player2: 0, victory: false };

	render() {
		const { stocks, player2, victory } = this.state;

		return (
			<div style={{ width: "100%", textAlign: "center", whiteSpace: "nowrap" }}>
				{victory ? (
					<span>💪💪💪</span>
				) : stocks !== MODE_STOCKS_FIVE ? (
					<span>
						❌ <strong>Stocks</strong>{" "}
						{locales.get("integration_supertiltbro_shouldbesettofive")}
					</span>
				) : player2 !== MODE_PLAYER2_FAIR ? (
					<span>
						❌ <strong>Player 2</strong>{" "}
						{locales.get("integration_supertiltbro_shouldbesettofair")}
					</span>
				) : (
					<span>👀 {locales.get("integration_supertiltbro_playing")}</span>
				)}
			</div>
		);
	}

	onFrame = () => {
		const neees = this.props.getNEEES();
		if (!neees) return;

		const stocks = neees.cpu.memory.read(0x00d9);
		const player2 = neees.cpu.memory.read(0x00da);
		const victory =
			stocks === MODE_STOCKS_FIVE &&
			player2 === MODE_PLAYER2_FAIR &&
			this._checkTiles(neees, VICTORY);

		this.setState({ stocks, player2, victory });

		if (victory) {
			this._disconnectControllers(neees);
			bus.emit("supertiltbro-end");
		}
	};
}

const MODE_STOCKS_FIVE = 4;
const MODE_PLAYER2_FAIR = 2;
const VICTORY = [
	[21, 3, 0xfb],
	[22, 3, 0xee],
	[23, 3, 0xe8],
	[24, 3, 0xf9],
	[25, 3, 0xf4],
	[26, 3, 0xf7],
	[27, 3, 0xfe],
	[26, 5, 0xf4],
	[27, 5, 0xf3],
	[28, 5, 0xea],
];
