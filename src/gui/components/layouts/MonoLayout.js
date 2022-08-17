import React from "react";
import Layout from "./Layout";
import styles from "./Layout.module.css";

export default class MonoLayout extends Layout {
	render() {
		if (!this.isReady) return false;

		this.require("Component");
		const { Component } = this.props;

		return (
			<div className={styles.container}>
				<Component
					ref={(component) => {
						this.component = component;
					}}
				/>
			</div>
		);
	}

	_callOnReady() {
		this.props.onReady({
			component: this.component,
		});
	}
}
