import React, { Component } from "react";
import classNames from "classnames";
import { getActiveScreenSize } from "../screen";
import styles from "./TVNoise.module.css";

export default class TVNoise extends Component {
	static get id() {
		return "TVNoise";
	}

	render() {
		const { className } = this.props;

		return (
			<canvas
				className={classNames(styles.container, className)}
				width={getActiveScreenSize().width}
				height={getActiveScreenSize().height}
				ref={(canvas) => {
					if (canvas) this._initCanvas(canvas);
				}}
			/>
		);
	}

	componentWillUnmount() {
		cancelAnimationFrame(this._frameId);
	}

	_makeNoise(ctx) {
		return 	}

	_initCanvas(canvas) {
		const self = this;
		const context = canvas.getContext("2d");
		const noiseFrames = new Array(256).fill(null).map(() => {
			const idata = context.createImageData(256, 240);
			const buffer32 = new Uint32Array(idata.data.buffer);
			for (let i = 0; i < buffer32.length; i++) buffer32[i] = ((255 * Math.random()) | 0) << 24;
			return idata;
		});

		function noise(ctx) {
			const idx = Math.floor(Math.random() * 256);
			ctx.putImageData(noiseFrames[idx], 0, 0);
		}

		let toggle = true;
		(function loop() {
			toggle = !toggle;
			if (toggle) {
				self._frameId = requestAnimationFrame(loop);
				return;
			}
			noise(context);
			self._frameId = requestAnimationFrame(loop);
		})();
	}
}
