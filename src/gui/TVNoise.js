import React, { Component } from "react";

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

export default class TVNoise extends Component {
	render() {
		return (
			<canvas
				style={{ width: "100%", height: "100%", borderRadius: 8 }}
				width={SCREEN_WIDTH}
				height={SCREEN_HEIGHT}
				ref={(canvas) => {
					if (canvas) this._initCanvas(canvas);
				}}
			/>
		);
	}

	componentWillUnmount() {
		cancelAnimationFrame(this._frameId);
	}

	_initCanvas(canvas) {
		const self = this;
		const context = canvas.getContext("2d");

		function noise(ctx) {
			let w = ctx.canvas.width,
				h = ctx.canvas.height,
				idata = ctx.createImageData(w, h),
				buffer32 = new Uint32Array(idata.data.buffer),
				len = buffer32.length,
				i = 0;

			for (; i < len; ) buffer32[i++] = ((255 * Math.random()) | 0) << 24;

			ctx.putImageData(idata, 0, 0);
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
