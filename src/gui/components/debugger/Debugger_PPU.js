const ImGui = window.ImGui;
const ImGui_Impl = window.ImGui_Impl;

// TODO: FIX TEXTURE when opening debugger while already open

export default class Debugger_PPU {
	init() {
		const gl = ImGui_Impl.gl;
		this._fbTex0 = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._fbTex0);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// allocate empty RGBA buffer
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			256 * 2,
			240 * 2,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null
		);
	}

	draw() {
		ImGui.Text("hello PPU");

		const gl = ImGui_Impl.gl;
		const pixels = new Uint32Array(256 * 240 * 4);
		for (let y = 0; y < 240 * 2; y++) {
			for (let x = 0; x < 256 * 2; x++) {
				const r = x & 0xff;
				const g = y & 0xff;
				const b = Math.floor(Math.random() * 128) & 0xff;
				const a = 0xff;
				pixels[y * 256 * 2 + x] = (a << 24) | (b << 16) | (g << 8) | r;
			}
		}
		gl.bindTexture(gl.TEXTURE_2D, this._fbTex0);
		gl.texSubImage2D(
			gl.TEXTURE_2D,
			0,
			0,
			0,
			256 * 2,
			240 * 2,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array(pixels.buffer)
		);

		ImGui.Image(this._fbTex0, new ImGui.Vec2(256 * 2, 240 * 2));
		ImGui.Text("bye PPU");
	}
}
