import React from "react";
import Layout from "./Layout";
import styles from "./Layout.module.css";

export default class MonoLayout extends Layout {
	render() {
		if (!this.isReady) return false;

		this.require("Main");
		const { Main } = this.props;

		return (
			<div className={styles.container}>
				<Main
					ref={(main) => {
						this.main = main;
					}}
				/>
			</div>
		);
	}

	_callOnReady() {
		this.props.onReady({
			Main: this.main,
		});
	}
}
