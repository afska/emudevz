export default class PPU {
	constructor(cpu) {
		this.cpu = cpu;

		this.cycle = 0;
		this.scanline = -1;
		this.frame = 0;

		this.frameBuffer = new Uint32Array(256 * 240);

		// fill the entire screen with red:
		for (let i = 0; i < 256 * 240; i++) {
			this.frameBuffer[i] = 0xff0000ff;
		}
	}

	step(onFrame) {
		this.cycle++;
		if (this.cycle >= 341) {
			this.cycle = 0;
			this.scanline++;

			if (this.scanline >= 261) {
				this.scanline = -1;
				this.frame++;

				onFrame(this.frameBuffer);
			}
		}
	}
}
