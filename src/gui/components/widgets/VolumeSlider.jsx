import React, { PureComponent } from "react";
import { connect } from "react-redux";
import locales from "../../../locales";
import music from "../../sound/music";
import ValueSlider from "./ValueSlider";

class VolumeSlider extends PureComponent {
	render() {
		const {
			musicVolume,
			volume = musicVolume,
			defaultVolume,
			disableTooltip,
			setVolume = (v) => music.setVolume(v),
			className = "menu-volume-slider",
			dispatch,
			style,
			...rest
		} = this.props;

		return (
			<ValueSlider
				className={className}
				style={style}
				title={locales.get("volume")}
				value={volume}
				defaultValue={defaultVolume}
				onChange={(e) => {
					setVolume(e.target.value);
				}}
				disableTooltip={disableTooltip}
				{...rest}
			/>
		);
	}
}

const mapStateToProps = ({ savedata }) => ({
	musicVolume: savedata.musicVolume,
});

export default connect(mapStateToProps)(VolumeSlider);
