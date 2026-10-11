import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { dlc } from "../utils";
import { getDefaultGlobalTheme, getDefaultLayoutBrightness } from "./theme";

class GlobalThemeProvider extends PureComponent {
	componentDidMount() {
		setTimeout(() => {
			this._apply(this.props.globalTheme, this.props.layoutBrightness);
		});
	}

	componentDidUpdate(prevProps) {
		if (
			prevProps.globalTheme !== this.props.globalTheme ||
			prevProps.layoutBrightness !== this.props.layoutBrightness
		)
			this._apply(this.props.globalTheme, this.props.layoutBrightness);
	}

	_apply(theme, layoutBrightness) {
		if (!dlc.installed()) return;
		if (!theme) return;

		const root = document.documentElement;
		const set = (name, value) => {
			if (value == null) return;
			root.style.setProperty(`--${name}`, String(value));
		};

		const COLOR_KEYS = Object.keys(getDefaultGlobalTheme());

		for (const key of COLOR_KEYS) {
			const value = theme?.[key];
			if (value != null) set(key, value);
		}

		const defaults = getDefaultLayoutBrightness();
		const unselected = layoutBrightness?.unselected ?? defaults.unselected;
		const selected = layoutBrightness?.selected ?? defaults.selected;

		set("layout-unselected-brightness", unselected);
		set("layout-selected-brightness", selected);
	}

	render() {
		return null;
	}
}

const mapStateToProps = ({ savedata }) => ({
	globalTheme: savedata.globalTheme,
	layoutBrightness: savedata.layoutBrightness,
});

export default connect(mapStateToProps)(GlobalThemeProvider);
