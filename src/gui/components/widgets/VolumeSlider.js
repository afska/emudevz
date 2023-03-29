import React, { PureComponent } from "react";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import { connect } from "react-redux";
import locales from "../../../locales";
import music from "../../sound/music";
import Tooltip from "./Tooltip";

function ValueLabel(props) {
	const { trackInfo, children } = props;

	if (!trackInfo) return null;

	return (
		<Tooltip enterTouchDelay={0} placement="top" title={locales.get("volume")}>
			{children}
		</Tooltip>
	);
}

class VolumeSlider extends PureComponent {
	render() {
		const {
			volume,
			trackInfo,
			setVolume,
			navBarMode = false,
			dispatch,
			...rest
		} = this.props;

		if (!trackInfo) return null;

		return (
			<Stack
				spacing={1.5}
				direction="row"
				sx={{ mb: 1 }}
				alignItems="center"
				style={{ marginRight: 4, marginBottom: 0 }}
				{...rest}
			>
				<Slider
					className={navBarMode ? "navbar-volume-slider" : "menu-volume-slider"}
					valueLabelDisplay="auto"
					slots={{
						valueLabel: React.forwardRef((props, ref) => (
							<ValueLabel trackInfo={trackInfo} ref={ref} {...props} />
						)),
					}}
					step={0.1}
					min={0}
					max={1}
					value={volume}
					onChange={(e) => {
						music.setVolume(e.target.value);
					}}
				/>
			</Stack>
		);
	}
}

const mapStateToProps = ({ savedata }) => ({
	volume: savedata.musicVolume,
	trackInfo: savedata.trackInfo,
});

export default connect(mapStateToProps)(VolumeSlider);
