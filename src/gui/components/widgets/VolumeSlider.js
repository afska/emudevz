import React, { PureComponent } from "react";
import VolumeUp from "@mui/icons-material/VolumeUp";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Marquee from "react-fast-marquee";
import Tooltip from "./Tooltip";

function ValueLabel(props) {
	const { children, value } = props;

	return (
		<Tooltip
			enterTouchDelay={0}
			placement="top"
			title={
				<Marquee style={{ width: 150 }} gradient={false}>
					🎶 Synthenia 🎼 Detective Plisken&nbsp;
				</Marquee>
			}
		>
			{children}
		</Tooltip>
	);
}

export default class VolumeSlider extends PureComponent {
	render() {
		const { value, onChange, ...rest } = this.props;

		return (
			<Stack
				spacing={1.5}
				direction="row"
				sx={{ mb: 1 }}
				alignItems="center"
				style={{ marginRight: 4, marginBottom: 0 }}
				{...rest}
			>
				<VolumeUp />
				<Slider
					valueLabelDisplay="auto"
					slots={{
						valueLabel: ValueLabel,
					}}
					step={0.1}
					marks
					min={0}
					max={1}
					value={value}
					onChange={onChange}
				/>
			</Stack>
		);
	}
}
