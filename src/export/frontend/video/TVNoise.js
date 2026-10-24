const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

export default class TVNoise {
	constructor() {
		this.canvas = document.createElement("canvas");
		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";
		this.canvas.style.borderRadius = "8px";
		this.canvas.width = SCREEN_WIDTH;
		this.canvas.height = SCREEN_HEIGHT;

		this._initCanvas(this.canvas);
	}

	stop() {
		cancelAnimationFrame(this._frameId);
	}

	_initCanvas(canvas) {
		cancelAnimationFrame(this._frameId);

		const self = this;
		const context = canvas.getContext("2d");

		const w = context.canvas.width,
			h = context.canvas.height,
			idata = context.createImageData(w, h),
			buffer32 = new Uint32Array(idata.data.buffer);

		function noise(ctx) {
			for (let i = 0; i < buffer32.length; i++)
				buffer32[i] = ((255 * Math.random()) | 0) << 24;

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
