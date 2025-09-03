import locales from "../../../../locales";
import { bus } from "../../../../utils";
import Integration from "./Integration";

export default class TeslaVsEdison extends Integration {
	state = { mode: 0, damage: 0, victory: false };

	render() {
		const { mode, damage, victory } = this.state;

		const isVsCom = mode === MODE_VS_COM;

		return (
			<div style={{ width: "100%", textAlign: "center", whiteSpace: "nowrap" }}>
				{victory ? (
					<span>📻📻📻</span>
				) : isVsCom ? (
					<span>
						💡💥 <strong>{damage}</strong>/{MAX_HITS}
					</span>
				) : (
					<span>❌ {locales.get("integration_teslavsedison_wrongmode")}</span>
				)}
			</div>
		);
	}

	onFrame = () => {
		const neees = this.props.getNEEES();
		if (!neees) return;

		const mode = neees.cpu.memory.read(0x007c);
		const damage = neees.cpu.memory.read(0x008e);
		const victory = mode === MODE_VS_COM && damage === MAX_HITS;

		this.setState({ mode, damage, victory });

		if (victory) {
			this._disconnectControllers(neees);
			bus.emit("teslavsedison-end");
		}
	};
}

const MODE_VS_COM = 0x02;
const MAX_HITS = 6;
