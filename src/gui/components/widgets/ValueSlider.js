import React, { PureComponent } from "react";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Tooltip from "./Tooltip";

function ValueLabel(props) {
	const { disableTooltip = false, title, children } = props;

	if (disableTooltip) return children;

	return (
		<Tooltip enterTouchDelay={0} placement="top" title={title}>
			{children}
		</Tooltip>
	);
}

export default class ValueSlider extends PureComponent {
	render() {
		const {
			value,
			defaultValue,
			disableTooltip,
			className,
			style,
			onChange,
			step = 0.1,
			min = 0,
			max = 1,
			disabled = false,
			...rest
		} = this.props;

		const valueHolder =
			value !== null
				? {
						value,
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
					step={step}
					min={min}
					max={max}
					{...valueHolder}
					defaultValue={defaultValue}
					onChange={onChange}
					disabled={disabled}
				/>
			</Stack>
		);
	}
}
