import { NameTableRenderer } from "./neees/debugPPU";
import utils from "./utils";

const RGBA = (r, g, b, a) => {
	return (
		((a & 0xff) << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff)
	);
};

const COLOR_VIEWPORT_OVERLAY_STROKE = RGBA(255, 0, 0, 160);
const COLOR_VIEWPORT_OVERLAY_FILL = RGBA(0, 180, 255, 120);
const COLOR_HOVER_OVERLAY_STROKE = RGBA(128, 128, 128, 255);
const COLOR_HOVER_OVERLAY_FILL = RGBA(0, 180, 255, 90);
const COLOR_TILE_GRID_LINE = RGBA(255, 0, 255, 160);
const COLOR_ATTRIBUTE_GRID_LINE = RGBA(0, 255, 0, 160);

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const ATLAS_WIDTH = SCREEN_WIDTH * 2;
const ATLAS_HEIGHT = SCREEN_HEIGHT * 2;

const ImGui = window.ImGui;
const ImGui_Impl = window.ImGui_Impl;

export default class Debugger_PPU {
	constructor(args) {
		this.args = args;
		this.selectedTab = null; // only works when `this.args.readOnly`
	}

	init() {
		const gl = ImGui_Impl.gl;
		this._fbTex0 = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._fbTex0);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// $aabbggrr buffer
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			ATLAS_WIDTH,
			ATLAS_HEIGHT,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null
		);

		this._showScrollOverlay = true;
		this._showTileGrid = false;
		this._showAttributeGrid = false;
		this._scanlineTrigger = 260; // -1..260
		this._atlasPixels = new Uint32Array(SCREEN_WIDTH * 2 * (SCREEN_HEIGHT * 2));
		this._hoverInfo = null;

		this._destroyed = false;
	}

	draw() {
		utils.fullWidthFieldWithLabel("Scanline", (label) => {
			ImGui.InputInt(
				label,
				(v = this._scanlineTrigger) => (this._scanlineTrigger = v)
			);
			if (this._scanlineTrigger < -1) this._scanlineTrigger = -1;
			if (this._scanlineTrigger > 260) this._scanlineTrigger = 260;
		});

		if (ImGui.BeginTabBar("PPUTabs")) {
			this._drawNameTablesTab();
			this._drawCHRTab();
			this._drawSpritesTab();
			this._drawPalettesTab();
			this._drawInfoTab();

			ImGui.EndTabBar();
		}
	}

	destroy() {
		const neees = window.EmuDevz.emulation?.neees;
		if (!neees) return;

		neees.onScanline = null;

		if (this._fbTex0) {
			const gl = ImGui_Impl.gl;
			gl.deleteTexture(this._fbTex0);
			this._fbTex0 = null;
		}

		this._destroyed = true;
	}

	_drawNameTablesTab() {
		utils.simpleTab(
			"Name tables",
			() => {
				const gl = ImGui_Impl.gl;

				ImGui.Checkbox(
					"Scroll overlay",
					(v = this._showScrollOverlay) => (this._showScrollOverlay = v)
				);
				ImGui.SameLine();
				ImGui.Checkbox(
					"Tile grid (8x8)",
					(v = this._showTileGrid) => (this._showTileGrid = v)
				);
				ImGui.SameLine();
				ImGui.Checkbox(
					"Attribute grid (16x16)",
					(v = this._showAttributeGrid) => (this._showAttributeGrid = v)
				);

				const emulation = window.EmuDevz?.emulation;
				const neees = emulation?.neees;
				const ppu = neees?.ppu;

				if (neees != null && neees.onScanline == null) {
					neees.onScanline = () => {
						if (this._destroyed) {
							neees.onScanline = null;
							return;
						}

						const scanline = ppu.scanline ?? 0;
						if (scanline !== this._scanlineTrigger) return;

						this._atlasPixels.fill(0);

						const plot = (x, y, color) => {
							if (x >= 0 && x < ATLAS_WIDTH && y >= 0 && y < ATLAS_HEIGHT)
								this._atlasPixels[y * ATLAS_WIDTH + x] = color;
						};

						const renderer = new NameTableRenderer(ppu, plot);
						renderer.render(0, 0, 0);
						renderer.render(1, 256, 0);
						renderer.render(2, 0, 240);
						renderer.render(3, 256, 240);

						if (this._showTileGrid)
							this._drawGrid(
								this._atlasPixels,
								ATLAS_WIDTH,
								ATLAS_HEIGHT,
								8,
								COLOR_TILE_GRID_LINE
							);
						if (this._showAttributeGrid)
							this._drawGrid(
								this._atlasPixels,
								ATLAS_WIDTH,
								ATLAS_HEIGHT,
								16,
								COLOR_ATTRIBUTE_GRID_LINE
							);

						if (this._showScrollOverlay)
							this._drawViewportOverlay(
								this._atlasPixels,
								ATLAS_WIDTH,
								ATLAS_HEIGHT,
								ppu
							);
					};
				}

				const imgTopLeft = ImGui.GetCursorScreenPos();
				const mouse = ImGui.GetMousePos();
				const localX = Math.floor(mouse.x - imgTopLeft.x);
				const localY = Math.floor(mouse.y - imgTopLeft.y);
				let hoverRect = null;
				let hoverInfo = null;

				if (
					localX >= 0 &&
					localY >= 0 &&
					localX < ATLAS_WIDTH &&
					localY < ATLAS_HEIGHT &&
					ImGui.IsWindowHovered()
				) {
					const atlasTileX = Math.floor(localX / 8);
					const atlasTileY = Math.floor(localY / 8);

					const ntX = localX >= SCREEN_WIDTH ? 1 : 0;
					const ntY = localY >= SCREEN_HEIGHT ? 1 : 0;
					const nameTableId = (ntY << 1) | ntX;

					const tileX = atlasTileX % (SCREEN_WIDTH / 8);
					const tileY = atlasTileY % (SCREEN_HEIGHT / 8);

					const ntBase = 0x2000 + nameTableId * 0x400;
					const tileIndexAddr = ntBase + tileY * 32 + tileX;
					const attrAddr =
						ntBase + 0x3c0 + ((tileX >> 2) & 7) + ((tileY >> 2) << 3);

					const tileIndex = ppu.memory?.read?.(tileIndexAddr) ?? 0;
					const patternTableId =
						ppu?.registers?.ppuCtrl?.backgroundPatternTableId ?? 0;
					const tileAddr = (patternTableId ? 0x1000 : 0x0000) + tileIndex * 16;

					hoverInfo = {
						nameTableId,
						tileX,
						tileY,
						tileIndex,
						tileIndexAddr,
						tileAddr,
						attrAddr,
					};

					const rectX = atlasTileX * 8;
					const rectY = atlasTileY * 8;
					hoverRect = { x: rectX, y: rectY, w: 8, h: 8 };

					ImGui.SetMouseCursor(ImGui.MouseCursor.None);
				}

				let uploadPixels = this._atlasPixels;
				if (hoverRect) {
					uploadPixels = new Uint32Array(this._atlasPixels);
					this._drawHoverOverlay(
						uploadPixels,
						ATLAS_WIDTH,
						ATLAS_HEIGHT,
						hoverRect.x,
						hoverRect.y,
						hoverRect.w,
						hoverRect.h
					);
					this._hoverInfo = hoverInfo;
				} else {
					this._hoverInfo = null;
				}

				gl.bindTexture(gl.TEXTURE_2D, this._fbTex0);
				gl.texSubImage2D(
					gl.TEXTURE_2D,
					0,
					0,
					0,
					ATLAS_WIDTH,
					ATLAS_HEIGHT,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					new Uint8Array(uploadPixels.buffer)
				);

				ImGui.Image(this._fbTex0, new ImGui.Vec2(ATLAS_WIDTH, ATLAS_HEIGHT));

				if (this._hoverInfo)
					this._drawTileInfoOverlayForeground(this._hoverInfo);
			},
			this.args.readOnly ? this.selectedTab === "Name tables" : null
		);
	}

	_drawCHRTab() {
		utils.simpleTab(
			"CHR",
			() => {},
			this.args.readOnly ? this.selectedTab === "CHR" : null
		);
	}

	_drawSpritesTab() {
		utils.simpleTab(
			"Sprites",
			() => {},
			this.args.readOnly ? this.selectedTab === "Sprites" : null
		);
	}

	_drawPalettesTab() {
		utils.simpleTab(
			"Palettes",
			() => {},
			this.args.readOnly ? this.selectedTab === "Palettes" : null
		);
	}

	_drawInfoTab() {
		utils.simpleTab(
			"Info",
			() => {},
			this.args.readOnly ? this.selectedTab === "Info" : null
		);
	}

	_drawViewportOverlay(pixels, width, height, ppu) {
		if (!ppu.loopy) return;

		const { tAddress, fineX } = ppu.loopy;
		const baseNameTableId = tAddress.nameTableId ?? 0;
		const withinNameTableX = tAddress.coarseX * 8 + (fineX ?? 0) ?? 0;
		const withinNameTableY = tAddress.coarseY * 8 + (tAddress.fineY ?? 0) ?? 0;

		let atlasNTX = baseNameTableId & 1;
		let atlasNTY = (baseNameTableId >> 1) & 1;

		let viewportStartX =
			atlasNTX * SCREEN_WIDTH + (withinNameTableX % SCREEN_WIDTH);
		let viewportStartY =
			atlasNTY * SCREEN_HEIGHT + (withinNameTableY % SCREEN_HEIGHT);

		if (withinNameTableX >= SCREEN_WIDTH) {
			const horizontalOffset =
				baseNameTableId === 0 || baseNameTableId === 2 ? 1 : -1;
			const adjustedNameTableId = (baseNameTableId + horizontalOffset) & 3;
			atlasNTX = adjustedNameTableId & 1;
			atlasNTY = (adjustedNameTableId >> 1) & 1;
			viewportStartX =
				atlasNTX * SCREEN_WIDTH + (withinNameTableX - SCREEN_WIDTH);
		}

		const drawFilled = (x, y, w, h) => {
			const x0 = Math.max(0, x),
				y0 = Math.max(0, y);
			const x1 = Math.min(width, x + w),
				y1 = Math.min(height, y + h);

			for (let yy = y0; yy < y1; yy++) {
				const row = yy * width;
				for (let xx = x0; xx < x1; xx++) {
					const i = row + xx;
					pixels[i] = this._blendOver(pixels[i], COLOR_VIEWPORT_OVERLAY_FILL);
				}
			}

			this._drawLineH(
				pixels,
				width,
				x,
				x + w - 1,
				y,
				COLOR_VIEWPORT_OVERLAY_STROKE
			);
			this._drawLineH(
				pixels,
				width,
				x,
				x + w - 1,
				y + h - 1,
				COLOR_VIEWPORT_OVERLAY_STROKE
			);
			this._drawLineV(
				pixels,
				width,
				height,
				x,
				y,
				y + h - 1,
				COLOR_VIEWPORT_OVERLAY_STROKE
			);
			this._drawLineV(
				pixels,
				width,
				height,
				x + w - 1,
				y,
				y + h - 1,
				COLOR_VIEWPORT_OVERLAY_STROKE
			);
		};

		const splitX = viewportStartX + SCREEN_WIDTH > width;
		const splitY = viewportStartY + SCREEN_HEIGHT > height;

		if (!splitX && !splitY) {
			drawFilled(viewportStartX, viewportStartY, SCREEN_WIDTH, SCREEN_HEIGHT);
		} else if (splitX && !splitY) {
			const w0 = width - viewportStartX,
				w1 = SCREEN_WIDTH - w0;
			drawFilled(viewportStartX, viewportStartY, w0, SCREEN_HEIGHT);
			drawFilled(0, viewportStartY, w1, SCREEN_HEIGHT);
		} else if (!splitX && splitY) {
			const h0 = height - viewportStartY,
				h1 = SCREEN_HEIGHT - h0;
			drawFilled(viewportStartX, viewportStartY, SCREEN_WIDTH, h0);
			drawFilled(viewportStartX, 0, SCREEN_WIDTH, h1);
		} else {
			const w0 = width - viewportStartX,
				w1 = SCREEN_WIDTH - w0;
			const h0 = height - viewportStartY,
				h1 = SCREEN_HEIGHT - h0;
			drawFilled(viewportStartX, viewportStartY, w0, h0);
			drawFilled(0, viewportStartY, w1, h0);
			drawFilled(viewportStartX, 0, w0, h1);
			drawFilled(0, 0, w1, h1);
		}
	}

	_drawHoverOverlay(pixels, width, height, x, y, w, h) {
		const stroke = COLOR_HOVER_OVERLAY_STROKE;
		const fill = COLOR_HOVER_OVERLAY_FILL;

		const x0 = Math.max(0, x),
			y0 = Math.max(0, y);
		const x1 = Math.min(width, x + w),
			y1 = Math.min(height, y + h);

		for (let yy = y0; yy < y1; yy++) {
			const row = yy * width;
			for (let xx = x0; xx < x1; xx++) {
				const i = row + xx;
				pixels[i] = this._blendOver(pixels[i], fill);
			}
		}

		this._drawLineH(pixels, width, x, x + w - 1, y, stroke);
		this._drawLineH(pixels, width, x, x + w - 1, y + h - 1, stroke);
		this._drawLineV(pixels, width, height, x, y, y + h - 1, stroke);
		this._drawLineV(pixels, width, height, x + w - 1, y, y + h - 1, stroke);
	}

	_drawTileInfoOverlayForeground(info) {
		const draw = ImGui.GetForegroundDrawList();
		const vp = ImGui.GetMainViewport
			? ImGui.GetMainViewport()
			: { WorkPos: ImGui.GetWindowPos(), WorkSize: ImGui.GetWindowSize() };
		const margin = 12;
		const lineGap = 2;

		const toUint = (c) => c >>> 0; // (ensure unsigned 32-bit for ImGui drawlist)

		const pad8 = (n) => String(n).padEnd(8, " ");
		const lines = [
			`PPU address       : ${this._hex(info.tileIndexAddr, 4)} `,
			`Name table        : ${info.nameTableId}`,
			`Position          : ` + pad8(`(${info.tileX}, ${info.tileY})`),
			`Tile index        : ${this._hex(info.tileIndex, 2)} `,
			`Tile address      : ${this._hex(info.tileAddr, 4)} `,
			`Attribute address : ${this._hex(info.attrAddr, 4)} `,
		];

		let maxW = 0;
		let totalH = 0;
		const lineHeights = [];
		for (let i = 0; i < lines.length; i++) {
			const size = ImGui.CalcTextSize(lines[i]);
			maxW = Math.max(maxW, size.x);
			const h = size.y;
			lineHeights.push(h);
			totalH += (i === 0 ? 0 : lineGap) + h;
		}

		const x1 = vp.WorkPos.x + vp.WorkSize.x - margin;
		const y1 = vp.WorkPos.y + vp.WorkSize.y - margin;
		const x0 = x1 - maxW - 14;
		const y0 = y1 - totalH - 14;

		const bgCol = toUint(RGBA(16, 16, 16, 180));
		const borderCol = toUint(RGBA(255, 255, 255, 64));
		const textCol = toUint(RGBA(255, 255, 255, 255));

		draw.AddRectFilled(
			new ImGui.Vec2(x0, y0),
			new ImGui.Vec2(x1, y1),
			bgCol,
			6
		);
		draw.AddRect(
			new ImGui.Vec2(x0, y0),
			new ImGui.Vec2(x1, y1),
			borderCol,
			6,
			0,
			1
		);

		let cy = y0 + 7;
		const cx = x0 + 7;
		for (let i = 0; i < lines.length; i++) {
			draw.AddText(new ImGui.Vec2(cx, cy), textCol, lines[i]);
			cy += lineHeights[i] + lineGap;
		}
	}

	_drawLineH(pixels, width, x0, x1, y, color) {
		if (y < 0 || y >= pixels.length / width) return;
		const xa = Math.max(0, Math.min(x0, x1));
		const xb = Math.min(width - 1, Math.max(x0, x1));
		const off = y * width;
		for (let x = xa; x <= xb; x++)
			pixels[off + x] = this._blendOver(pixels[off + x], color);
	}

	_drawLineV(pixels, width, height, x, y0, y1, color) {
		if (x < 0 || x >= width) return;
		const ya = Math.max(0, Math.min(y0, y1));
		const yb = Math.min(height - 1, Math.max(y0, y1));
		for (let y = ya; y <= yb; y++) {
			const i = y * width + x;
			pixels[i] = this._blendOver(pixels[i], color);
		}
	}

	_drawGrid(pixels, width, height, step, lineColor) {
		for (let x = 0; x < width; x += step)
			this._drawLineV(pixels, width, height, x, 0, height - 1, lineColor);
		for (let y = 0; y < height; y += step)
			this._drawLineH(pixels, width, 0, width - 1, y, lineColor);
	}

	_blendOver(dst, src) {
		const da = (dst >>> 24) & 0xff,
			dr = dst & 0xff,
			dg = (dst >>> 8) & 0xff,
			db = (dst >>> 16) & 0xff;
		const sa = (src >>> 24) & 0xff,
			sr = src & 0xff,
			sg = (src >>> 8) & 0xff,
			sb = (src >>> 16) & 0xff;

		const a = (sa + (da * (255 - sa) + 127) / 255) | 0;
		const r = ((sr * sa + dr * (255 - sa) + 127) / 255) | 0;
		const g = ((sg * sa + dg * (255 - sa) + 127) / 255) | 0;
		const b = ((sb * sa + db * (255 - sa) + 127) / 255) | 0;

		return RGBA(r, g, b, a);
	}

	_hex(n, width) {
		const v = n.toString(16).toUpperCase().padStart(width, "0");
		return `$${v}`;
	}
}
