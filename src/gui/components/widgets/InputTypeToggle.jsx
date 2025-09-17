import React, { PureComponent } from "react";
import { connect } from "react-redux";
import locales from "../../../locales";
import Tooltip from "./Tooltip";

const ORDER = ["keyboard", "gamepad1", "gamepad2", "disconnected"];
const INPUT_TYPES = {
	keyboard: { titleKey: "using_keyboard", icon: "⌨️" },
	gamepad1: { titleKey: "using_gamepad1", icon: "🎮" },
	gamepad2: { titleKey: "using_gamepad2", icon: "🕹️" },
	disconnected: { titleKey: "input_disconnected", icon: "🚫" },
};

class InputTypeToggle extends PureComponent {
	render() {
		const {
			player,
			inputTypes,
			keyboardMappings,
			className,
			style,
		} = this.props;
		const inputType = inputTypes[player];
		const { titleKey, icon } = INPUT_TYPES[inputType];

		let suffix = "";
		if (titleKey === "using_keyboard") {
			const mappings = keyboardMappings[player] || {};
			const keys = Object.values(mappings).map((key) =>
				key === " " ? "SPACE" : key
			);
			suffix = keys.join(", ");
		}

		const playerLabel = locales.get(player === 1 ? "player_1" : "player_2");
		const title = `${playerLabel}\n${locales.get(titleKey)}${suffix}`;

		return (
			<Tooltip title={title} placement="top">
				<span
					className={className}
					style={{ cursor: "pointer", ...style }}
					onClick={() => this._cycle(player)}
				>
					{icon}
				</span>
			</Tooltip>
		);
	}

	_cycle = (player) => {
		const { inputTypes, setInputTypes } = this.props;
		const current = inputTypes[player];
		const idx = ORDER.indexOf(current);
		const next = ORDER[(idx + 1) % ORDER.length];
		setInputTypes({ ...inputTypes, [player]: next });
	};
}

const mapStateToProps = ({ savedata }) => ({
	inputTypes: savedata.inputTypes,
	keyboardMappings: savedata.keyboardMappings,
});

const mapDispatchToProps = ({ savedata }) => ({
	setInputTypes: savedata.setInputTypes,
});

export default connect(mapStateToProps, mapDispatchToProps)(InputTypeToggle);
