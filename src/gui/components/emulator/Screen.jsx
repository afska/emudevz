import React, { Component } from "react";
import classNames from "classnames";
import { getActiveScreenSize } from "../../screen";
import styles from "./Screen.module.css";

export default class Screen extends Component {
	render() {
		const { className } = this.props;
		const { width, height } = getActiveScreenSize();

		return (
			<canvas
				id="screen"
				className={classNames(styles.screen, className)}
				width={width}
				height={height}
				ref={(canvas) => {
					if (canvas) this._initCanvas(canvas);
				}}
			/>
		);
	}

	setBuffer = (buffer) => {
		this.buf32.set(buffer);
		this.imageData.data.set(this.buf8);
		this.context.putImageData(this.imageData, 0, 0);
	};

	toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			if (this.canvas.requestFullscreen) this.canvas.requestFullscreen();
		} else {
			if (document.exitFullscreen) document.exitFullscreen();
		}
	};

	_initCanvas(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		const { width, height } = getActiveScreenSize();
		this.imageData = this.context.getImageData(0, 0, width, height);

		// set alpha to opaque
		this.context.fillStyle = "black";
		this.context.fillRect(0, 0, width, height);

		// buffer to write on next animation frame
		this.buf = new ArrayBuffer(this.imageData.data.length);

		// get the canvas buffer in 8bit and 32bit
		this.buf8 = new Uint8ClampedArray(this.buf);
		this.buf32 = new Uint32Array(this.buf);
	}
}
