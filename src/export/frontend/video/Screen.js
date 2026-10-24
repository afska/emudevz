export default class Screen {
	constructor(canvas) {
		this._initCanvas(canvas);
	}

	setBuffer = (buffer) => {
		this.buf32.set(buffer);
		this.imageData.data.set(this.buf8);
		this.context.putImageData(this.imageData, 0, 0);
	};

	_initCanvas(canvas) {
		this.context = canvas.getContext("2d");
		this.imageData = this.context.getImageData(
			0,
			0,
			canvas.width,
			canvas.height
		);

		this.context.fillStyle = "black";
		this.context.fillRect(0, 0, canvas.width, canvas.height);

		this.buf = new ArrayBuffer(this.imageData.data.length);
		this.buf8 = new Uint8ClampedArray(this.buf);
		this.buf32 = new Uint32Array(this.buf);
	}
}
