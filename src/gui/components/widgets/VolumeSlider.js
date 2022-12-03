import React, { PureComponent } from "react";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Marquee from "react-fast-marquee";
import { connect } from "react-redux";
import music from "../../sound/music";
import Tooltip from "./Tooltip";

function ValueLabel(props) {
	const { children } = props;

	return (
		<Tooltip
			enterTouchDelay={0}
			placement="top"
			title={
				<Marquee style={{ width: 150 }} gradient={false}>
					🎶 Artist 🎼 Song&nbsp;
				</Marquee>
			}
		>
			{children}
		</Tooltip>
	);
}

class VolumeSlider extends PureComponent {
	render() {
		const { volume, setVolume, navBarMode = false, ...rest } = this.props;

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
						valueLabel: ValueLabel,
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
});

export default connect(mapStateToProps)(VolumeSlider);
