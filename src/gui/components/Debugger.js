import React, { PureComponent } from "react";
import styles from "./Debugger.module.css";

export default class Debugger extends PureComponent {
	static get id() {
		return "Debugger";
	}

	async initialize(args, level) {
		this._level = level;
	}

	render() {
		return <div className={styles.container}>test</div>;
	}

	focus = () => {};

	componentDidMount() {}

	componentWillUnmount() {}
}
