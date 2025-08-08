import { NameTableRenderer } from "./neees/debugPPU";

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

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

		// RGBA buffer
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
		const W = SCREEN_WIDTH * 2;
		const H = SCREEN_HEIGHT * 2;
		const pixels = new Uint32Array(W * H);

		const emulation = window.EmuDevz?.emulation;
		const neees = emulation?.neees;
		const ppu = neees?.ppu;

		if (ppu) {
			const renderer = new NameTableRenderer(ppu, (px, py, color) => {
				if (px >= 0 && px < W && py >= 0 && py < H) pixels[py * W + px] = color;
			});

			renderer.render(0, 0, 0);
			renderer.render(1, 256, 0);
			renderer.render(2, 0, 240);
			renderer.render(3, 256, 240);
		}

		gl.bindTexture(gl.TEXTURE_2D, this._fbTex0);
		gl.texSubImage2D(
			gl.TEXTURE_2D,
			0,
			0,
			0,
			W,
			H,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array(pixels.buffer)
		);

		ImGui.Image(this._fbTex0, new ImGui.Vec2(W, H));
		ImGui.Text("bye PPU");
	}
}
