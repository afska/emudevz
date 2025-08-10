import { hex } from "../../../utils";
import { GRAYSCALE_PALETTE, NameTableRenderer, Tile } from "./neees/debugPPU";
import widgets from "./widgets";

const ImGui = window.ImGui;

const RGBA = (r, g, b, a) => {
	return (
		(((a & 0xff) << 24) |
			((b & 0xff) << 16) |
			((g & 0xff) << 8) |
			(r & 0xff)) >>>
		0
	);
};

// Knobs
const COLOR_VIEWPORT_OVERLAY_STROKE = RGBA(255, 0, 0, 160);
const COLOR_VIEWPORT_OVERLAY_FILL = RGBA(0, 180, 255, 120);
const COLOR_HOVER_OVERLAY_STROKE = RGBA(128, 128, 128, 255);
const COLOR_HOVER_OVERLAY_FILL = RGBA(0, 180, 255, 90);
const COLOR_INFO_OVERLAY_STROKE = RGBA(255, 255, 255, 64);
const COLOR_INFO_OVERLAY_FILL = RGBA(16, 16, 16, 180);
const COLOR_INFO_OVERLAY_TEXT = RGBA(255, 255, 255, 255);
const COLOR_SELECTED_TILE_OVERLAY_STROKE = RGBA(255, 64, 64, 192);
const COLOR_SELECTED_TILE_OVERLAY_FILL = RGBA(255, 0, 0, 96);
const COLOR_TILE_GRID_LINE = RGBA(255, 0, 255, 160);
const COLOR_ATTRIBUTE_GRID_LINE = RGBA(0, 255, 0, 160);

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const ATLAS_WIDTH = SCREEN_WIDTH * 2;
const ATLAS_HEIGHT = SCREEN_HEIGHT * 2;
const CHR_SIZE_PIXELS = 128; // 16x16 tiles * 8
const TILES_PER_ROW = 16;
const CHR_SCALE = 2;

export default class Debugger_PPU {
	constructor(args) {
		this.args = args;

		this.selectedTab = args.initialTab || null;
	}

	init() {
		// Textures
		this._atlasTexture = widgets.newTexture(ATLAS_WIDTH, ATLAS_HEIGHT);
		this._chr0Texture = widgets.newTexture(CHR_SIZE_PIXELS, CHR_SIZE_PIXELS);
		this._chr1Texture = widgets.newTexture(CHR_SIZE_PIXELS, CHR_SIZE_PIXELS);

		// Scanline trigger
		this._scanlineTrigger = 260; // -1..260

		// Name tables
		this._showScrollOverlay = true;
		this._showTileGrid = false;
		this._showAttributeGrid = false;
		this._hoverInfo = null;
		this._pendingHoverReq = null;
		this._atlasPixels = new Uint32Array(ATLAS_WIDTH * ATLAS_HEIGHT);

		// CHR state
		this._chrHover = null; // { tableId, tileIndex, rect }
		this._chrHoverInfo = null; // { tableId, tileIndex, tileAddress }
		this._selectedCHR = null; // { tableId, tileIndex }
		this._chr0Pixels = new Uint32Array(CHR_SIZE_PIXELS * CHR_SIZE_PIXELS);
		this._chr1Pixels = new Uint32Array(CHR_SIZE_PIXELS * CHR_SIZE_PIXELS);

		this._destroyed = false;
	}

	draw() {
		widgets.fullWidthFieldWithLabel("Scanline", (label) => {
			ImGui.SliderInt(
				label,
				(v = this._scanlineTrigger) => (this._scanlineTrigger = v),
				-1,
				260,
				"%d"
			);
		});

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

				this._onScanlineTrigger(ppu);
			};
		}

		if (ImGui.BeginTabBar("PPUTabs")) {
			this._drawNameTablesTab(ppu);
			this._drawCHRTab();
			this._drawSpritesTab();
			this._drawPalettesTab();
			this._drawInfoTab();

			ImGui.EndTabBar();
			this.selectedTab = null;
		}
	}

	destroy() {
		const neees = window.EmuDevz.emulation?.neees;
		if (!neees) return;

		neees.onScanline = null;

		if (this._atlasTexture) {
			widgets.deleteTexture(this._atlasTexture);
			this._atlasTexture = null;
		}
		if (this._chr0Texture) {
			widgets.deleteTexture(this._chr0Texture);
			this._chr0Texture = null;
		}
		if (this._chr1Texture) {
			widgets.deleteTexture(this._chr1Texture);
			this._chr1Texture = null;
		}

		this._destroyed = true;
	}

	_onScanlineTrigger(ppu) {
		this._updateNameTableAtlas(ppu);
		this._updateCHR(ppu);
	}

	_updateNameTableAtlas(ppu) {
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

		this._highlightSelectedCHROnNameTableAtlas(ppu);
		this._processPendingHoverReq(ppu);
	}

	_highlightSelectedCHROnNameTableAtlas(ppu) {
		if (!this._selectedCHR) return;

		const patternTableId =
			ppu?.registers?.ppuCtrl?.backgroundPatternTableId ?? 0;
		if (patternTableId !== this._selectedCHR.tableId) return;

		for (let nameTableId = 0; nameTableId < 4; nameTableId++) {
			const base = 0x2000 + nameTableId * 0x400;
			const offsetX = (nameTableId & 1) * SCREEN_WIDTH;
			const offsetY = ((nameTableId >> 1) & 1) * SCREEN_HEIGHT;

			for (let tileY = 0; tileY < 30; tileY++) {
				for (let tileX = 0; tileX < 32; tileX++) {
					const address = base + tileY * 32 + tileX;
					const tileIndex = ppu.memory?.read?.(address) ?? 0;

					if (tileIndex === this._selectedCHR.tileIndex) {
						const rectX = offsetX + tileX * 8;
						const rectY = offsetY + tileY * 8;

						this._drawRectOverlay(
							this._atlasPixels,
							ATLAS_WIDTH,
							ATLAS_HEIGHT,
							rectX,
							rectY,
							8,
							8,
							COLOR_SELECTED_TILE_OVERLAY_STROKE,
							COLOR_SELECTED_TILE_OVERLAY_FILL
						);
					}
				}
			}
		}
	}

	_processPendingHoverReq(ppu) {
		const req = this._pendingHoverReq;
		if (!req) return;

		const tileIndex = ppu.memory?.read?.(req.ppuAddress) ?? 0;
		const patternTableId =
			ppu?.registers?.ppuCtrl?.backgroundPatternTableId ?? 0;
		const tileAddress = (patternTableId ? 0x1000 : 0x0000) + tileIndex * 16;

		const attribute = ppu.memory?.read?.(req.attributeAddress) ?? 0;
		const shift = (req.tileY & 2 ? 4 : 0) + (req.tileX & 2 ? 2 : 0);
		const paletteId = (attribute >> shift) & 0x03;
		const paletteAddress = 0x3f00 + paletteId * 4;

		const previewColors = new Array(64);
		for (let y = 0; y < 8; y++) {
			const row = new Tile(ppu, patternTableId, tileIndex, y);
			for (let x = 0; x < 8; x++) {
				const colorIndex = row.getColorIndex(x);
				const color =
					colorIndex > 0
						? ppu.getColor?.(paletteId, colorIndex) ?? 0
						: ppu.getColor?.(0, 0) ?? 0;
				previewColors[y * 8 + x] = color >>> 0;
			}
		}

		const paletteColors = [
			ppu.getColor?.(0, 0) ?? 0,
			ppu.getColor?.(paletteId, 1) ?? 0,
			ppu.getColor?.(paletteId, 2) ?? 0,
			ppu.getColor?.(paletteId, 3) ?? 0,
		].map((c) => c >>> 0);

		this._hoverInfo = {
			nameTableId: req.nameTableId,
			tileX: req.tileX,
			tileY: req.tileY,
			tileIndex,
			ppuAddress: req.ppuAddress,
			tileAddress,
			attributeAddress: req.attributeAddress,
			paletteId,
			paletteAddress,
			previewColors,
			paletteColors,
		};

		this._pendingHoverReq = null;
	}

	_updateCHR(ppu) {
		const render = (patternTableId, out) => {
			for (let tileId = 0; tileId < 256; tileId++) {
				const tileX = tileId % TILES_PER_ROW;
				const tileY = Math.floor(tileId / TILES_PER_ROW);
				const base = tileY * 8 * CHR_SIZE_PIXELS + tileX * 8;

				for (let y = 0; y < 8; y++) {
					const row = new Tile(ppu, patternTableId, tileId, y);
					const dst = base + y * CHR_SIZE_PIXELS;
					for (let x = 0; x < 8; x++)
						out[dst + x] = GRAYSCALE_PALETTE[row.getColorIndex(x)] >>> 0;
				}
			}
		};

		render(0, this._chr0Pixels);
		render(1, this._chr1Pixels);
	}

	_drawNameTablesTab(ppu) {
		widgets.simpleTab(this, "Name tables", () => {
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

			this._processAtlasMouseEvents(ppu);

			ImGui.Image(
				this._atlasTexture,
				new ImGui.Vec2(ATLAS_WIDTH, ATLAS_HEIGHT)
			);

			if (this._hoverInfo) this._drawTileInfoOverlayForeground(this._hoverInfo);
		});
	}

	_processAtlasMouseEvents(ppu) {
		const imgTopLeft = ImGui.GetCursorScreenPos();
		const mouse = ImGui.GetMousePos();
		const localX = Math.floor(mouse.x - imgTopLeft.x);
		const localY = Math.floor(mouse.y - imgTopLeft.y);
		let hoverRect = null;

		// hover => show info
		if (
			localX >= 0 &&
			localY >= 0 &&
			localX < ATLAS_WIDTH &&
			localY < ATLAS_HEIGHT &&
			ImGui.IsWindowHovered()
		) {
			const atlasTileX = Math.floor(localX / 8);
			const atlasTileY = Math.floor(localY / 8);

			const nameTableX = localX >= SCREEN_WIDTH ? 1 : 0;
			const nameTableY = localY >= SCREEN_HEIGHT ? 1 : 0;
			const nameTableId = (nameTableY << 1) | nameTableX;

			const tileX = atlasTileX % (SCREEN_WIDTH / 8);
			const tileY = atlasTileY % (SCREEN_HEIGHT / 8);

			const nameTableBase = 0x2000 + nameTableId * 0x400;
			const ppuAddress = nameTableBase + tileY * 32 + tileX;
			const attributeAddress =
				nameTableBase + 0x3c0 + ((tileX >> 2) & 7) + ((tileY >> 2) << 3);

			this._pendingHoverReq = {
				nameTableId,
				tileX,
				tileY,
				ppuAddress,
				attributeAddress,
			};

			const rectX = atlasTileX * 8;
			const rectY = atlasTileY * 8;
			hoverRect = { x: rectX, y: rectY, w: 8, h: 8 };

			ImGui.SetMouseCursor(ImGui.MouseCursor.None);

			// click => select and jump to CHR
			if (ImGui.IsMouseClicked(0) && this._hoverInfo) {
				const patternTableId =
					ppu?.registers?.ppuCtrl?.backgroundPatternTableId ?? 0;

				this._selectedCHR = {
					tableId: patternTableId,
					tileIndex: this._hoverInfo.tileIndex,
				};
				this.selectedTab = "CHR";
			}
		} else {
			this._pendingHoverReq = null;
			this._hoverInfo = null;
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
		}

		widgets.updateTexture(
			this._atlasTexture,
			ATLAS_WIDTH,
			ATLAS_HEIGHT,
			uploadPixels
		);
	}

	_drawCHRTab() {
		widgets.simpleTab(this, "CHR", () => {
			const itemWidth = CHR_SIZE_PIXELS * CHR_SCALE;

			const renderChrTable = (
				id,
				label,
				tableId,
				texture,
				pixels,
				baseAddr
			) => {
				widgets.simpleTable(id, label, () => {
					widgets.centerNextItemX(itemWidth);

					// hover detection (scaled coords)
					let hover = null;
					const imgTopLeft = ImGui.GetCursorScreenPos();
					const mouse = ImGui.GetMousePos();
					const lx = Math.floor((mouse.x - imgTopLeft.x) / CHR_SCALE);
					const ly = Math.floor((mouse.y - imgTopLeft.y) / CHR_SCALE);
					if (
						lx >= 0 &&
						ly >= 0 &&
						lx < CHR_SIZE_PIXELS &&
						ly < CHR_SIZE_PIXELS &&
						ImGui.IsWindowHovered()
					) {
						const tileX = Math.floor(lx / 8);
						const tileY = Math.floor(ly / 8);
						const tileIndex = tileY * TILES_PER_ROW + tileX;
						hover = {
							tileIndex,
							rect: { x: tileX * 8, y: tileY * 8, w: 8, h: 8 },
						};
						ImGui.SetMouseCursor(ImGui.MouseCursor.None);
					}

					// overlays (selected + hover)
					let uploadPixels = pixels;
					const isSelected =
						this._selectedCHR && this._selectedCHR.tableId === tableId;
					if (hover || isSelected) {
						uploadPixels = new Uint32Array(pixels);
						if (isSelected) {
							const sel = this._selectedCHR.tileIndex;
							const sx = (sel % TILES_PER_ROW) * 8;
							const sy = Math.floor(sel / TILES_PER_ROW) * 8;
							this._drawRectOverlay(
								uploadPixels,
								CHR_SIZE_PIXELS,
								CHR_SIZE_PIXELS,
								sx,
								sy,
								8,
								8,
								COLOR_SELECTED_TILE_OVERLAY_STROKE,
								COLOR_SELECTED_TILE_OVERLAY_FILL
							);
						}
						if (hover) {
							this._drawHoverOverlay(
								uploadPixels,
								CHR_SIZE_PIXELS,
								CHR_SIZE_PIXELS,
								hover.rect.x,
								hover.rect.y,
								hover.rect.w,
								hover.rect.h
							);
						}
					}

					// upload + draw (with border)
					widgets.updateTexture(
						texture,
						CHR_SIZE_PIXELS,
						CHR_SIZE_PIXELS,
						uploadPixels
					);
					const drawList = ImGui.GetWindowDrawList();
					const p0 = ImGui.GetCursorScreenPos();
					ImGui.Image(texture, new ImGui.Vec2(itemWidth, itemWidth));
					const p1 = new ImGui.Vec2(p0.x + itemWidth, p0.y + itemWidth);
					drawList.AddRect(p0, p1, COLOR_HOVER_OVERLAY_STROKE, 4, 0, 1);

					// click toggle selection
					if (hover && ImGui.IsMouseClicked(0)) {
						if (isSelected && this._selectedCHR.tileIndex === hover.tileIndex) {
							this._selectedCHR = null;
						} else {
							this._selectedCHR = { tableId, tileIndex: hover.tileIndex };
						}
					}

					// hover info
					if (hover) {
						this._chrHoverInfo = {
							tableId,
							tileIndex: hover.tileIndex,
							tileAddress: baseAddr + hover.tileIndex * 16,
						};
					}
				});
			};

			ImGui.Columns(2, "PatternTableCols", false);
			renderChrTable(
				"patternTable0",
				"Pattern table 0",
				0,
				this._chr0Texture,
				this._chr0Pixels,
				0x0000
			);
			ImGui.NextColumn();
			renderChrTable(
				"patternTable1",
				"Pattern table 1",
				1,
				this._chr1Texture,
				this._chr1Pixels,
				0x1000
			);
			ImGui.Columns(1);

			// CHR overlay (hover info)
			if (this._chrHoverInfo) {
				this._drawCHRInfoOverlayForeground(this._chrHoverInfo);
			} else {
				this._chrHoverInfo = null;
			}
		});
	}

	_drawSpritesTab() {
		widgets.simpleTab(this, "Sprites", () => {});
	}

	_drawPalettesTab() {
		widgets.simpleTab(this, "Palettes", () => {});
	}

	_drawInfoTab() {
		widgets.simpleTab(this, "Info", () => {});
	}

	_drawViewportOverlay(pixels, width, height, ppu) {
		if (!ppu.loopy) return;

		const { tAddress, fineX } = ppu.loopy;
		const baseNameTableId = tAddress.nameTableId ?? 0;
		const withinNameTableX = tAddress.coarseX * 8 + (fineX ?? 0) ?? 0;
		const withinNameTableY = tAddress.coarseY * 8 + (tAddress.fineY ?? 0) ?? 0;

		let atlasNameTableX = baseNameTableId & 1;
		let atlasNameTableY = (baseNameTableId >> 1) & 1;

		let viewportStartX =
			atlasNameTableX * SCREEN_WIDTH + (withinNameTableX % SCREEN_WIDTH);
		let viewportStartY =
			atlasNameTableY * SCREEN_HEIGHT + (withinNameTableY % SCREEN_HEIGHT);

		if (withinNameTableX >= SCREEN_WIDTH) {
			const horizontalOffset =
				baseNameTableId === 0 || baseNameTableId === 2 ? 1 : -1;
			const adjustedNameTableId = (baseNameTableId + horizontalOffset) & 3;
			atlasNameTableX = adjustedNameTableId & 1;
			atlasNameTableY = (adjustedNameTableId >> 1) & 1;
			viewportStartX =
				atlasNameTableX * SCREEN_WIDTH + (withinNameTableX - SCREEN_WIDTH);
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

	_drawRectOverlay(pixels, width, height, x, y, w, h, stroke, fill) {
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
		const viewport = ImGui.GetMainViewport
			? ImGui.GetMainViewport()
			: { WorkPos: ImGui.GetWindowPos(), WorkSize: ImGui.GetWindowSize() };
		const margin = 12;
		const lineGap = 2;

		const pad8 = (n) => String(n).padEnd(8, " ");
		const posText = pad8(`(${info.tileX}, ${info.tileY})`);
		const lines = [
			`PPU address       : ${hex.format(info.ppuAddress, 4)} `,
			`Name table        : ${info.nameTableId}`,
			`Position          : ${posText} `,
			`Tile index        : ${hex.format(info.tileIndex, 2)} `,
			`Tile address      : ${hex.format(info.tileAddress, 4)} `,
			`Attribute address : ${hex.format(info.attributeAddress, 4)} `,
			`Palette address   : ${hex.format(info.paletteAddress, 4)} `,
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

		// ^^^ data --- preview vvv

		const previewSize = 32; // 8x8 @ 4x
		const swatchSize = 16; // 4 swatches horizontally
		const blockGap = 6;
		const combinedRowW = previewSize + blockGap + swatchSize * 4;
		const combinedRowH = Math.max(previewSize, swatchSize);

		const contentW = Math.max(maxW, combinedRowW);
		const contentH = totalH + blockGap + combinedRowH;

		const x1 = viewport.WorkPos.x + viewport.WorkSize.x - margin;
		const y1 = viewport.WorkPos.y + viewport.WorkSize.y - margin;
		const x0 = x1 - contentW - 14;
		const y0 = y1 - contentH - 14;

		draw.AddRectFilled(
			new ImGui.Vec2(x0, y0),
			new ImGui.Vec2(x1, y1),
			COLOR_INFO_OVERLAY_FILL,
			6
		);
		draw.AddRect(
			new ImGui.Vec2(x0, y0),
			new ImGui.Vec2(x1, y1),
			COLOR_INFO_OVERLAY_STROKE,
			6,
			0,
			1
		);

		let cy = y0 + 7;
		const cx = x0 + 7;
		for (let i = 0; i < lines.length; i++) {
			draw.AddText(new ImGui.Vec2(cx, cy), COLOR_INFO_OVERLAY_TEXT, lines[i]);
			cy += lineHeights[i] + lineGap;
		}

		if (!info.previewColors || !info.paletteColors) return;

		const scale = 4;
		const rowX = cx + Math.floor((contentW - combinedRowW) / 2);
		const rowY = cy + blockGap;
		const px0 = rowX;
		const py0 = rowY + Math.floor((combinedRowH - previewSize) / 2);

		for (let tileY = 0; tileY < 8; tileY++) {
			for (let tileX = 0; tileX < 8; tileX++) {
				const color = info.previewColors[tileY * 8 + tileX] >>> 0;
				const x = px0 + tileX * scale;
				const y = py0 + tileY * scale;
				draw.AddRectFilled(
					new ImGui.Vec2(x, y),
					new ImGui.Vec2(x + scale, y + scale),
					color
				);
			}
		}

		const palX0 = rowX + previewSize + blockGap;
		const palY0 = rowY + Math.floor((combinedRowH - swatchSize) / 2);
		for (let i = 0; i < 4; i++) {
			const color = info.paletteColors[i] >>> 0;
			const x = palX0 + i * swatchSize;
			const y = palY0;
			draw.AddRectFilled(
				new ImGui.Vec2(x, y),
				new ImGui.Vec2(x + swatchSize, y + swatchSize),
				color,
				3
			);
			draw.AddRect(
				new ImGui.Vec2(x, y),
				new ImGui.Vec2(x + swatchSize, y + swatchSize),
				RGBA(0, 0, 0, 200),
				3,
				0,
				1
			);
		}
	}

	_drawCHRInfoOverlayForeground(info) {
		const draw = ImGui.GetForegroundDrawList();
		const viewport = ImGui.GetMainViewport
			? ImGui.GetMainViewport()
			: { WorkPos: ImGui.GetWindowPos(), WorkSize: ImGui.GetWindowSize() };
		const margin = 12;
		const lineGap = 2;

		const lines = [
			`Pattern table: ${info.tableId}`,
			`Tile index   : ${hex.format(info.tileIndex, 2)} `,
			`Tile address : ${hex.format(info.tileAddress, 4)} `,
		];

		// text block size
		let maxW = 0;
		let totalH = 0;
		for (let i = 0; i < lines.length; i++) {
			const size = ImGui.CalcTextSize(lines[i]);
			maxW = Math.max(maxW, size.x);
			totalH += size.y + (i ? lineGap : 0);
		}

		// preview (grayscale, from CHR pixels, no PPU reads)
		const previewSize = 32; // 8x8 @ 4x
		const scale = 4;
		const blockGap = 6;

		const contentW = Math.max(maxW, previewSize);
		const contentH = totalH + blockGap + previewSize;

		const x1 = viewport.WorkPos.x + viewport.WorkSize.x - margin;
		const y1 = viewport.WorkPos.y + viewport.WorkSize.y - margin;
		const x0 = x1 - contentW - 14;
		const y0 = y1 - contentH - 14;

		draw.AddRectFilled(
			new ImGui.Vec2(x0, y0),
			new ImGui.Vec2(x1, y1),
			COLOR_INFO_OVERLAY_FILL,
			6
		);
		draw.AddRect(
			new ImGui.Vec2(x0, y0),
			new ImGui.Vec2(x1, y1),
			COLOR_INFO_OVERLAY_STROKE,
			6,
			0,
			1
		);

		let cy = y0 + 7;
		const cx = x0 + 7;
		for (let i = 0; i < lines.length; i++) {
			draw.AddText(new ImGui.Vec2(cx, cy), COLOR_INFO_OVERLAY_TEXT, lines[i]);
			cy += ImGui.CalcTextSize(lines[i]).y + lineGap;
		}

		// centered preview
		const rowX = cx + Math.floor((contentW - previewSize) / 2);
		const rowY = cy + blockGap;
		const px0 = rowX;
		const py0 = rowY;

		const src = info.tableId === 0 ? this._chr0Pixels : this._chr1Pixels;
		const baseX = (info.tileIndex % TILES_PER_ROW) * 8;
		const baseY = Math.floor(info.tileIndex / TILES_PER_ROW) * 8;

		for (let tileY = 0; tileY < 8; tileY++) {
			for (let tileX = 0; tileX < 8; tileX++) {
				const color =
					src[(baseY + tileY) * CHR_SIZE_PIXELS + (baseX + tileX)] >>> 0;
				const x = px0 + tileX * scale;
				const y = py0 + tileY * scale;
				draw.AddRectFilled(
					new ImGui.Vec2(x, y),
					new ImGui.Vec2(x + scale, y + scale),
					color
				);
			}
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
}
