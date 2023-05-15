import React from "react";
import { bus } from "../../../../utils";
import ProgressBar from "../../widgets/ProgressBar";
import Integration from "./Integration";

export default class RoboNinjaClimb extends Integration {
	state = { percentage: 0 };

	render() {
		const { percentage } = this.state;

		if (percentage === 100) {
			return (
				<div
					style={{ width: "100%", textAlign: "center", whiteSpace: "nowrap" }}
				>
					<span>🥋🥋🥋</span>
				</div>
			);
		}

		return (
			<div style={{ paddingTop: 8, paddingBottom: 8, width: "50%" }}>
				<ProgressBar
					percentage={percentage}
					barFillColor="#3398dc"
					style={{ marginTop: 0 }}
				/>
			</div>
		);
	}

	onFrame = () => {
		const neees = this.props.getNEEES();
		if (!neees) return;

		this._moveTV(5);

		const level = neees.cpu.memory.readAt(0x0300);
		const percentage = (level / WIN_LEVEL) * 100;

		if (percentage === 100) {
			this._disconnectControllers(neees);
			bus.emit("roboninjaclimb-end");
		}

		this.setState({ percentage });
	};
}

const WIN_LEVEL = 5;
