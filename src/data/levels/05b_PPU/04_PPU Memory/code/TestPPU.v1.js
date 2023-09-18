export default class PPU {
	constructor(cpu) {
		this.cpu = cpu;

		this.cycle = 0;
		this.scanline = -1;
		this.frame = 0;

		this.frameBuffer = new Uint32Array(256 * 240);
	}

	plot(x, y, color) {
		this.frameBuffer[y * 256 + x] = color;
	}

	step(onFrame) {
		this.cycle++;
		if (this.cycle >= 341) {
			this.cycle = 0;
			this.scanline++;

			if (this.scanline >= 261) {
				this.scanline = -1;
				this.frame++;

				// <test>
				for (let x = 0; x < 256; x++) {
					for (let y = 0; y < 240; y++) {
						this.plot(x, y, 0xff000000 | this.frame % 0xff);
					}
				}
				// </test>

				onFrame(this.frameBuffer);
			}
		}
	}
}
