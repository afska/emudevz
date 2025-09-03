import React from "react";

function cx(...args) {
	const out = [];
	for (const a of args) {
		if (!a) continue;
		if (typeof a === "string") out.push(a);
		else if (typeof a === "object") {
			for (const k in a) if (a[k]) out.push(k);
		}
	}
	return out.join(" ");
}

export default class FlashChange extends React.Component {
	static defaultProps = {
		flashDuration: 200,
		flashStyle: {},
		flashClassName: undefined,
		outerElementType: "div",
		compare: (prevProps, newProps) => prevProps.value !== newProps.value,
	};

	state = {
		activeFlash: false,
		compareResult: undefined,
		props: this.props,
	};

	_timer = null;

	static getDerivedStateFromProps(nextProps, prevState) {
		const result = nextProps.compare(prevState.props, nextProps);
		if (result) {
			return { activeFlash: true, compareResult: result, props: nextProps };
		}
		return { props: nextProps };
	}

	componentDidUpdate() {
		if (this.state.activeFlash) this._activateTimer();
	}

	componentWillUnmount() {
		if (this._timer) clearTimeout(this._timer);
	}

	_deactivate = () => {
		this.setState({ activeFlash: false });
	};

	_activateTimer() {
		const { flashDuration } = this.props;
		if (this._timer) clearTimeout(this._timer);
		this._timer = setTimeout(this._deactivate, flashDuration);
	}

	render() {
		const {
			style,
			className,
			children,
			flashClassName,
			flashStyle,
			outerElementType: OuterElement,
		} = this.props;
		const { activeFlash, compareResult } = this.state;

		const styleProp = activeFlash ? { ...style, ...flashStyle } : style;

		const classProp = cx(
			className,
			{ [flashClassName]: activeFlash && !!flashClassName },
			typeof compareResult === "string"
				? { [compareResult]: activeFlash }
				: null
		);

		return (
			<OuterElement style={styleProp} className={classProp}>
				{children}
			</OuterElement>
		);
	}
}
