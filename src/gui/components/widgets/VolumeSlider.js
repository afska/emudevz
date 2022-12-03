import React, { PureComponent } from "react";
import VolumeDown from "@mui/icons-material/VolumeDown";
import VolumeUp from "@mui/icons-material/VolumeUp";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";

export default class VolumeSlider extends PureComponent {
	render() {
		const { value, onChange, ...rest } = this.props;

		return (
			<Stack
				spacing={1.5}
				direction="row"
				sx={{ mb: 1 }}
				alignItems="center"
				style={{ marginBottom: 0 }}
				{...rest}
			>
				<VolumeDown />
				<Slider
					step={0.1}
					marks
					min={0}
					max={1}
					value={value}
					onChange={onChange}
				/>
				<VolumeUp />
			</Stack>
		);
	}
}
