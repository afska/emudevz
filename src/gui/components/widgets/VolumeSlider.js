import React, { PureComponent } from "react";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import { connect } from "react-redux";
import locales from "../../../locales";
import music from "../../sound/music";
import Tooltip from "./Tooltip";

function ValueLabel(props) {
	const { disableTooltip = false, children } = props;

	if (disableTooltip) return children;

	return (
		<Tooltip enterTouchDelay={0} placement="top" title={locales.get("volume")}>
			{children}
		</Tooltip>
	);
}

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

		const valueHolder =
			volume !== null
				? {
						value: volume,
				  }
				: {};

		return (
			<Stack
				spacing={1.5}
				direction="row"
				sx={{ mb: 1 }}
				alignItems="center"
				style={{ marginRight: 4, marginBottom: 0, ...style }}
				{...rest}
			>
				<Slider
					id="volume-slider"
					className={className}
					valueLabelDisplay="auto"
					slots={{
						valueLabel: React.forwardRef((props, ref) => (
							<ValueLabel
								ref={ref}
								disableTooltip={disableTooltip}
								{...props}
							/>
						)),
					}}
					step={0.1}
					min={0}
					max={1}
					defaultValue={defaultVolume}
					{...valueHolder}
					onChange={(e) => {
						setVolume(e.target.value);
					}}
				/>
			</Stack>
		);
	}
}

const mapStateToProps = ({ savedata }) => ({
	musicVolume: savedata.musicVolume,
});

export default connect(mapStateToProps)(VolumeSlider);
