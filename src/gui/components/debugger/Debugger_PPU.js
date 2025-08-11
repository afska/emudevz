import { hex } from "../../../utils";
import {
	GRAYSCALE_PALETTE,
	NameTableRenderer,
	Sprite,
	Tile,
} from "./neees/debugPPU";
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
const TILE_SIZE_PIXELS = 8;
const TILES_PER_ROW = 16;
const CHR_SIZE_PIXELS = TILES_PER_ROW * TILE_SIZE_PIXELS;
const CHR_SCALE = 2;
const ATTRIBUTE_SIZE_PIXELS = 16;
const TOTAL_SPRITES = 64;
const OAM_COLS = 8;
const OAM_ROWS = 8;
const SPRITE_WIDTH = TILE_SIZE_PIXELS;
const OVERLAY_MARGIN = 12;
const OVERLAY_LINE_GAP = 2;
const OVERLAY_PAD = 7;
const OVERLAY_RADIUS = 6;
const BLOCK_GAP = 6;
const SWATCH_SIZE = 16;
const PREVIEW_SCALE = 4;

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
		this._oamTexture = null;
		this._sprPreviewTexture = widgets.newTexture(SCREEN_WIDTH, SCREEN_HEIGHT);
		this._oamTextureWidth = 0;
		this._oamTextureHeight = 0;

		// Scanline trigger
		this._scanlineTrigger = 241; // -1..260

		// Name tables
		this._showScrollOverlay = true;
		this._showTileGrid = false;
		this._showAttributeGrid = false;
		this._bgHoverInfo = null;
		this._pendingHoverReq = null;
		this._atlasPixels = new Uint32Array(ATLAS_WIDTH * ATLAS_HEIGHT);

		// CHR
		this._chrHoverInfo = null; // { tableId, tileIndex, tileAddress }
		this._selectedCHR = null; // { tableId, tileIndex }
		this._chr0Pixels = new Uint32Array(CHR_SIZE_PIXELS * CHR_SIZE_PIXELS);
		this._chr1Pixels = new Uint32Array(CHR_SIZE_PIXELS * CHR_SIZE_PIXELS);

		// Sprites
		this._spriteIs8x16 = false;
		this._sprites = new Array(TOTAL_SPRITES);
		this._oamPixels = null;
		this._sprPreviewPixels = new Uint32Array(SCREEN_WIDTH * SCREEN_HEIGHT);
		this._oamHoverIndex = null;
		this._oamHoverInfo = null;
		this._oamImageRect = null;
		this._sprPrevImageRect = null;

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
			this._drawSpritesTab(ppu);
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
		if (this._oamTexture) {
			widgets.deleteTexture(this._oamTexture);
			this._oamTexture = null;
		}
		if (this._sprPreviewTexture) {
			widgets.deleteTexture(this._sprPreviewTexture);
			this._sprPreviewTexture = null;
		}

		this._destroyed = true;
	}

	_onScanlineTrigger(ppu) {
		this._updateNameTableAtlas(ppu);
		this._updateCHR(ppu);
		this._updateSprites(ppu);
	}

	//#region Name tables
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
				TILE_SIZE_PIXELS,
				COLOR_TILE_GRID_LINE
			);
		if (this._showAttributeGrid)
			this._drawGrid(
				this._atlasPixels,
				ATLAS_WIDTH,
				ATLAS_HEIGHT,
				ATTRIBUTE_SIZE_PIXELS,
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
						const rectX = offsetX + tileX * TILE_SIZE_PIXELS;
						const rectY = offsetY + tileY * TILE_SIZE_PIXELS;

						this._drawRectOverlay(
							this._atlasPixels,
							ATLAS_WIDTH,
							ATLAS_HEIGHT,
							rectX,
							rectY,
							TILE_SIZE_PIXELS,
							TILE_SIZE_PIXELS,
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
		for (let y = 0; y < TILE_SIZE_PIXELS; y++) {
			const row = new Tile(ppu, patternTableId, tileIndex, y);
			for (let x = 0; x < TILE_SIZE_PIXELS; x++) {
				const colorIndex = row.getColorIndex(x);
				const color =
					colorIndex > 0
						? ppu.getColor?.(paletteId, colorIndex) ?? 0
						: ppu.getColor?.(0, 0) ?? 0;
				previewColors[y * TILE_SIZE_PIXELS + x] = color >>> 0;
			}
		}

		const paletteColors = [
			ppu.getColor?.(0, 0) ?? 0,
			ppu.getColor?.(paletteId, 1) ?? 0,
			ppu.getColor?.(paletteId, 2) ?? 0,
			ppu.getColor?.(paletteId, 3) ?? 0,
		].map((c) => c >>> 0);

		this._bgHoverInfo = {
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

			// atlas
			ImGui.Image(
				this._atlasTexture,
				new ImGui.Vec2(ATLAS_WIDTH, ATLAS_HEIGHT)
			);

			// tile overlay
			if (this._bgHoverInfo)
				this._drawTileInfoOverlayForeground(this._bgHoverInfo);
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
			const atlasTileX = Math.floor(localX / TILE_SIZE_PIXELS);
			const atlasTileY = Math.floor(localY / TILE_SIZE_PIXELS);

			const nameTableX = localX >= SCREEN_WIDTH ? 1 : 0;
			const nameTableY = localY >= SCREEN_HEIGHT ? 1 : 0;
			const nameTableId = (nameTableY << 1) | nameTableX;

			const tileX = atlasTileX % (SCREEN_WIDTH / TILE_SIZE_PIXELS);
			const tileY = atlasTileY % (SCREEN_HEIGHT / TILE_SIZE_PIXELS);

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

			const rectX = atlasTileX * TILE_SIZE_PIXELS;
			const rectY = atlasTileY * TILE_SIZE_PIXELS;
			hoverRect = {
				x: rectX,
				y: rectY,
				w: TILE_SIZE_PIXELS,
				h: TILE_SIZE_PIXELS,
			};

			ImGui.SetMouseCursor(ImGui.MouseCursor.None);

			// click => select and jump to CHR
			if (ImGui.IsMouseClicked(0) && this._bgHoverInfo) {
				const patternTableId =
					ppu?.registers?.ppuCtrl?.backgroundPatternTableId ?? 0;

				this._selectedCHR = {
					tableId: patternTableId,
					tileIndex: this._bgHoverInfo.tileIndex,
				};
				this.selectedTab = "CHR";
			}
		} else {
			this._pendingHoverReq = null;
			this._bgHoverInfo = null;
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

	_drawViewportOverlay(pixels, width, height, ppu) {
		if (ppu.loopy == null || typeof ppu.loopy !== "object") return;

		const { tAddress, fineX } = ppu.loopy;
		const baseNameTableId = tAddress.nameTableId ?? 0;
		const withinNameTableX =
			tAddress.coarseX * TILE_SIZE_PIXELS + (fineX ?? 0) ?? 0;
		const withinNameTableY =
			tAddress.coarseY * TILE_SIZE_PIXELS + (tAddress.fineY ?? 0) ?? 0;

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

	_drawTileInfoOverlayForeground(info) {
		const pad8 = (n) => String(n).padEnd(8, " ");
		const posText = pad8(`(${info.tileX}, ${info.tileY})`);
		const lines = [
			`PPU address       : $${hex.format(info.ppuAddress, 4)} `,
			`Name table        : ${info.nameTableId}`,
			`Position          : ${posText} `,
			`Tile index        : $${hex.format(info.tileIndex, 2)} `,
			`Tile address      : $${hex.format(info.tileAddress, 4)} `,
			`Attribute address : $${hex.format(info.attributeAddress, 4)} `,
			`Palette address   : $${hex.format(info.paletteAddress, 4)} `,
		];

		// measure
		const previewSize = TILE_SIZE_PIXELS * PREVIEW_SCALE;
		const extraWidth =
			info.previewColors && info.paletteColors
				? previewSize + BLOCK_GAP + SWATCH_SIZE * 4
				: 0;
		const extraHeight =
			info.previewColors && info.paletteColors
				? Math.max(previewSize, SWATCH_SIZE)
				: 0;

		// box
		const { draw, cursorX, cursorY, contentWidth } = this._overlayBox(
			lines,
			extraWidth,
			extraHeight
		);

		// nothing else to draw
		if (!info.previewColors || !info.paletteColors) return;

		// preview
		const previewX0 = cursorX + Math.floor((contentWidth - extraWidth) / 2);
		const previewY0 = cursorY + Math.floor((extraHeight - previewSize) / 2);
		this._drawPreviewFromArray(
			draw,
			previewX0,
			previewY0,
			PREVIEW_SCALE,
			TILE_SIZE_PIXELS,
			TILE_SIZE_PIXELS,
			info.previewColors
		);

		// palette
		const paletteX0 = previewX0 + BLOCK_GAP + previewSize;
		const paletteY0 = cursorY + Math.floor((extraHeight - SWATCH_SIZE) / 2);
		this._drawPaletteRow(draw, paletteX0, paletteY0, info.paletteColors);
	}
	//#endregion

	//#region CHR
	_updateCHR(ppu) {
		const render = (patternTableId, out) => {
			for (let tileId = 0; tileId < 256; tileId++) {
				const tileX = tileId % TILES_PER_ROW;
				const tileY = Math.floor(tileId / TILES_PER_ROW);
				const base =
					tileY * TILE_SIZE_PIXELS * CHR_SIZE_PIXELS + tileX * TILE_SIZE_PIXELS;

				for (let y = 0; y < TILE_SIZE_PIXELS; y++) {
					const row = new Tile(ppu, patternTableId, tileId, y);
					const dst = base + y * CHR_SIZE_PIXELS;
					for (let x = 0; x < TILE_SIZE_PIXELS; x++)
						out[dst + x] = GRAYSCALE_PALETTE[row.getColorIndex(x)] >>> 0;
				}
			}
		};

		render(0, this._chr0Pixels);
		render(1, this._chr1Pixels);
	}

	_drawCHRTab() {
		widgets.simpleTab(this, "CHR", () => {
			const itemSize = CHR_SIZE_PIXELS * CHR_SCALE;

			this._chrHoverInfo = null;

			const renderChrTable = (
				id,
				label,
				tableId,
				texture,
				pixels,
				baseAddr
			) => {
				widgets.simpleTable(id, label, () => {
					widgets.centerNextItemX(itemSize);

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
						const tileX = Math.floor(lx / TILE_SIZE_PIXELS);
						const tileY = Math.floor(ly / TILE_SIZE_PIXELS);
						const tileIndex = tileY * TILES_PER_ROW + tileX;
						hover = {
							tileIndex,
							rect: {
								x: tileX * TILE_SIZE_PIXELS,
								y: tileY * TILE_SIZE_PIXELS,
								w: TILE_SIZE_PIXELS,
								h: TILE_SIZE_PIXELS,
							},
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
							const sx = (sel % TILES_PER_ROW) * TILE_SIZE_PIXELS;
							const sy = Math.floor(sel / TILES_PER_ROW) * TILE_SIZE_PIXELS;
							this._drawRectOverlay(
								uploadPixels,
								CHR_SIZE_PIXELS,
								CHR_SIZE_PIXELS,
								sx,
								sy,
								TILE_SIZE_PIXELS,
								TILE_SIZE_PIXELS,
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
					const draw = ImGui.GetWindowDrawList();
					const p0 = ImGui.GetCursorScreenPos();
					const p1 = new ImGui.Vec2(p0.x + itemSize, p0.y + itemSize);
					ImGui.Image(texture, new ImGui.Vec2(itemSize, itemSize));
					draw.AddRect(p0, p1, COLOR_HOVER_OVERLAY_STROKE, 4, 0, 1);

					// click toggle selection
					if (hover && ImGui.IsMouseClicked(0)) {
						if (isSelected && this._selectedCHR.tileIndex === hover.tileIndex) {
							this._selectedCHR = null;
						} else {
							this._selectedCHR = { tableId, tileIndex: hover.tileIndex };
						}
					}

					// set overlay
					if (hover) {
						this._chrHoverInfo = {
							tableId,
							tileIndex: hover.tileIndex,
							tileAddress: baseAddr + hover.tileIndex * 16,
						};
					}
				});
			};

			// pattern tables
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

			// CHR overlay
			if (this._chrHoverInfo)
				this._drawCHRInfoOverlayForeground(this._chrHoverInfo);
		});
	}

	_drawCHRInfoOverlayForeground(info) {
		const lines = [
			`Pattern table: ${info.tableId}`,
			`Tile index   : $${hex.format(info.tileIndex, 2)} `,
			`Tile address : $${hex.format(info.tileAddress, 4)} `,
		];

		// measure
		const previewSize = TILE_SIZE_PIXELS * PREVIEW_SCALE;
		const src = info.tableId === 0 ? this._chr0Pixels : this._chr1Pixels;
		const baseX = (info.tileIndex % TILES_PER_ROW) * TILE_SIZE_PIXELS;
		const baseY = Math.floor(info.tileIndex / TILES_PER_ROW) * TILE_SIZE_PIXELS;

		// box
		const { draw, cursorX, cursorY, contentWidth } = this._overlayBox(
			lines,
			previewSize,
			previewSize
		);

		// preview
		this._drawPreview(
			draw,
			cursorX + Math.floor((contentWidth - previewSize) / 2),
			cursorY,
			PREVIEW_SCALE,
			TILE_SIZE_PIXELS,
			TILE_SIZE_PIXELS,
			(tx, ty) => src[(baseY + ty) * CHR_SIZE_PIXELS + (baseX + tx)]
		);
	}
	//#endregion

	//#region Sprites
	_updateSprites(ppu) {
		this._spriteIs8x16 = ppu.registers?.ppuCtrl?.spriteSize === 1;

		const oam = this._readAllOAM(ppu);
		this._sprites = new Array(TOTAL_SPRITES);
		for (let i = 0; i < TOTAL_SPRITES; i++)
			this._sprites[i] = this._makeSpriteFromOAMEntry(ppu, oam[i], i);

		// OAM table (8x8)
		const spriteHeight = this._spriteIs8x16 ? 16 : 8;
		const oamWidth = OAM_COLS * SPRITE_WIDTH;
		const oamHeight = OAM_ROWS * spriteHeight;

		if (
			!this._oamTexture ||
			this._oamTextureWidth !== oamWidth ||
			this._oamTextureHeight !== oamHeight ||
			this._oamPixels == null
		) {
			if (this._oamTexture) widgets.deleteTexture(this._oamTexture);
			this._oamTexture = widgets.newTexture(oamWidth, oamHeight);
			this._oamTextureWidth = oamWidth;
			this._oamTextureHeight = oamHeight;
			this._oamPixels = new Uint32Array(oamWidth * oamHeight);
		}
		this._oamPixels.fill(0);

		for (let i = 0; i < TOTAL_SPRITES; i++) {
			const col = i % OAM_COLS;
			const row = Math.floor(i / OAM_COLS);

			this._blitSpriteTo(
				ppu,
				this._sprites[i],
				this._oamPixels,
				this._oamTextureWidth,
				col * SPRITE_WIDTH,
				row * spriteHeight
			);
		}
		widgets.updateTexture(
			this._oamTexture,
			this._oamTextureWidth,
			this._oamTextureHeight,
			this._oamPixels
		);

		// preview (256x240)
		this._sprPreviewPixels.fill(0);
		this._drawSpritesPreview(
			ppu,
			this._sprites,
			this._sprPreviewPixels,
			SCREEN_WIDTH,
			SCREEN_HEIGHT
		);
		widgets.updateTexture(
			this._sprPreviewTexture,
			SCREEN_WIDTH,
			SCREEN_HEIGHT,
			this._sprPreviewPixels
		);
	}

	_readAllOAM(ppu) {
		const oamRam = ppu?.memory?.oamRam;
		const out = new Array(TOTAL_SPRITES);

		for (let i = 0; i < TOTAL_SPRITES; i++) {
			const base = i * 4;

			out[i] = {
				y: oamRam?.[base + 0] ?? 0,
				tile: oamRam?.[base + 1] ?? 0,
				attr: oamRam?.[base + 2] ?? 0,
				x: oamRam?.[base + 3] ?? 0,
			};
		}

		return out;
	}

	_makeSpriteFromOAMEntry(ppu, entry, index) {
		const is8x16 = this._spriteIs8x16;
		const x = entry.x >>> 0;
		const y = (entry.y + 1) & 0xff; // (OAM stores Y-1)

		let patternTableId, tileId;
		if (is8x16) {
			patternTableId = entry.tile & 0b1 ? 1 : 0; // from tile LSB
			tileId = (entry.tile & 0xfe) >>> 0; // even tile = top
		} else {
			patternTableId = ppu.registers?.ppuCtrl?.sprite8x8PatternTableId ? 1 : 0;
			tileId = entry.tile >>> 0;
		}

		const sprite = new Sprite(
			index,
			x,
			y,
			is8x16,
			patternTableId,
			tileId,
			entry.attr
		);
		sprite.oamAddress = 0x0200 + index * 4;
		sprite.paletteAddress = 0x3f00 + sprite.paletteId * 4;

		return sprite;
	}

	_drawSpritesPreview(ppu, sprites, dst, dstW, dstH) {
		// reverse OAM order so lower indexes end up on top
		for (let i = sprites.length - 1; i >= 0; i--) {
			const sprite = sprites[i];
			if (
				sprite.x >= dstW ||
				sprite.y >= dstH ||
				sprite.x + TILE_SIZE_PIXELS <= 0 ||
				sprite.y + sprite.height <= 0
			)
				continue; // (skip if offscreen)

			this._blitSpriteTo(ppu, sprite, dst, dstW, sprite.x, sprite.y);
		}
	}

	_blitSpriteTo(ppu, sprite, dst, dstW, dx, dy) {
		const bg = (ppu.getColor?.(0, 0) ?? 0) >>> 0;
		const palette = ppu.getPaletteColors?.(sprite.paletteId) ?? [
			bg,
			bg,
			bg,
			bg,
		];

		const minX = dx;
		const minY = dy;
		const maxX = dx + TILE_SIZE_PIXELS;
		const maxY = dy + sprite.height;

		for (let insideY = 0; insideY < sprite.height; insideY++) {
			const y = dy + insideY;
			if (y < minY || y >= maxY) continue;

			const tileInsideY = insideY & 7;
			const rowY = sprite.flipY ? 7 - tileInsideY : tileInsideY;
			const tileId = sprite.tileIdFor(insideY);
			const row = new Tile(ppu, sprite.patternTableId, tileId, rowY);

			for (let insideX = 0; insideX < TILE_SIZE_PIXELS; insideX++) {
				const x = dx + insideX;
				if (x < minX || x >= maxX) continue;

				const colX = sprite.flipX ? TILE_SIZE_PIXELS - 1 - insideX : insideX;
				const colorIndex = row.getColorIndex(colX);
				if (colorIndex === 0) continue; // transparent

				dst[y * dstW + x] = (palette[colorIndex] ?? bg) >>> 0;
			}
		}
	}

	_drawSpritesTab(ppu) {
		widgets.simpleTab(this, "Sprites", () => {
			const sprites = this._sprites ?? [];
			const spriteHeight = this._spriteIs8x16 ? 16 : 8;

			// reset per-frame hover
			this._oamHoverIndex = null;
			this._oamHoverInfo = null;
			this._oamImageRect = null;
			this._sprPrevImageRect = null;

			ImGui.Columns(2, "SpriteCols", false);

			// OAM grid
			widgets.simpleTable("oamTable", "OAM", () => {
				const itemWidth = (this._oamTextureWidth || 0) * CHR_SCALE;
				const itemHeight = (this._oamTextureHeight || 0) * CHR_SCALE;
				widgets.centerNextItemX(itemWidth);

				const p0 = ImGui.GetCursorScreenPos();
				if (this._oamTexture) {
					const draw = ImGui.GetWindowDrawList();
					const p1 = new ImGui.Vec2(p0.x + itemWidth, p0.y + itemHeight);
					ImGui.Image(this._oamTexture, new ImGui.Vec2(itemWidth, itemHeight));
					draw.AddRect(p0, p1, COLOR_HOVER_OVERLAY_STROKE, 4, 0, 1);
				}
				this._oamImageRect = { x: p0.x, y: p0.y, w: itemWidth, h: itemHeight };

				// hover picking in OAM grid
				const mouse = ImGui.GetMousePos();
				const lx = Math.floor((mouse.x - p0.x) / CHR_SCALE);
				const ly = Math.floor((mouse.y - p0.y) / CHR_SCALE);
				if (
					this._oamTextureWidth &&
					this._oamTextureHeight &&
					lx >= 0 &&
					ly >= 0 &&
					lx < this._oamTextureWidth &&
					ly < this._oamTextureHeight &&
					ImGui.IsWindowHovered()
				) {
					const col = Math.floor(lx / SPRITE_WIDTH);
					const row = Math.floor(ly / spriteHeight);
					const index = row * OAM_COLS + col;
					if (index >= 0 && index < TOTAL_SPRITES) {
						this._oamHoverIndex = index;
						this._oamHoverInfo = this._buildSpriteHoverInfo(
							ppu,
							sprites[index],
							index
						);
						ImGui.SetMouseCursor(ImGui.MouseCursor.None);
					}
				}
			});

			ImGui.NextColumn();

			// 256x240 preview
			widgets.simpleTable("spritePrev", "Preview", () => {
				widgets.centerNextItemX(SCREEN_WIDTH);

				const draw = ImGui.GetWindowDrawList();
				const p0 = ImGui.GetCursorScreenPos();
				const p1 = new ImGui.Vec2(p0.x + SCREEN_WIDTH, p0.y + SCREEN_HEIGHT);
				ImGui.Image(
					this._sprPreviewTexture,
					new ImGui.Vec2(SCREEN_WIDTH, SCREEN_HEIGHT)
				);
				draw.AddRect(p0, p1, COLOR_HOVER_OVERLAY_STROKE, 4, 0, 1);
				this._sprPrevImageRect = {
					x: p0.x,
					y: p0.y,
					w: SCREEN_WIDTH,
					h: SCREEN_HEIGHT,
				};

				// hover pick on screen
				const mouse = ImGui.GetMousePos();
				const lx = Math.floor(mouse.x - p0.x);
				const ly = Math.floor(mouse.y - p0.y);
				if (
					lx >= 0 &&
					ly >= 0 &&
					lx < SCREEN_WIDTH &&
					ly < SCREEN_HEIGHT &&
					ImGui.IsWindowHovered()
				) {
					for (let i = 0; i < TOTAL_SPRITES; i++) {
						const sprite = sprites[i];
						const x0 = sprite.x,
							y0 = sprite.y,
							x1 = x0 + SPRITE_WIDTH,
							y1 = y0 + sprite.height;
						if (lx >= x0 && lx < x1 && ly >= y0 && ly < y1) {
							this._oamHoverIndex = i;
							this._oamHoverInfo = this._buildSpriteHoverInfo(ppu, sprite, i);
							ImGui.SetMouseCursor(ImGui.MouseCursor.None);
							break;
						}
					}
				}
			});

			ImGui.Columns(1);

			// cross highlight in both views
			if (this._oamHoverIndex != null) {
				const index = this._oamHoverIndex;
				const sprite = sprites[index];

				if (this._oamTexture && this._oamPixels) {
					const col = index % OAM_COLS;
					const row = (index / OAM_COLS) | 0;
					const uploadPixels = new Uint32Array(this._oamPixels);
					this._drawHoverOverlay(
						uploadPixels,
						this._oamTextureWidth,
						this._oamTextureHeight,
						col * SPRITE_WIDTH,
						row * spriteHeight,
						SPRITE_WIDTH,
						spriteHeight
					);
					widgets.updateTexture(
						this._oamTexture,
						this._oamTextureWidth,
						this._oamTextureHeight,
						uploadPixels
					);
				}

				const uploadPixels = new Uint32Array(this._sprPreviewPixels);
				this._drawHoverOverlay(
					uploadPixels,
					SCREEN_WIDTH,
					SCREEN_HEIGHT,
					sprite.x,
					sprite.y,
					SPRITE_WIDTH,
					sprite.height
				);
				widgets.updateTexture(
					this._sprPreviewTexture,
					SCREEN_WIDTH,
					SCREEN_HEIGHT,
					uploadPixels
				);
			} else {
				if (this._oamTexture && this._oamPixels) {
					widgets.updateTexture(
						this._oamTexture,
						this._oamTextureWidth,
						this._oamTextureHeight,
						this._oamPixels
					);
				}
				widgets.updateTexture(
					this._sprPreviewTexture,
					SCREEN_WIDTH,
					SCREEN_HEIGHT,
					this._sprPreviewPixels
				);
			}

			// sprite overlay
			if (this._oamHoverInfo)
				this._drawSpriteInfoOverlayForeground(this._oamHoverInfo);
		});
	}

	_buildSpriteHoverInfo(ppu, sprite, index) {
		const bg = (ppu.getColor?.(0, 0) ?? 0) >>> 0;
		const palette = ppu.getPaletteColors?.(sprite.paletteId) ?? [
			bg,
			bg,
			bg,
			bg,
		];

		const width = TILE_SIZE_PIXELS;
		const height = sprite.height;
		const previewColors = new Array(width * height);
		for (let insideY = 0; insideY < height; insideY++) {
			const tileInsideY = insideY & 7;
			const rowY = sprite.flipY ? 7 - tileInsideY : tileInsideY;
			const tileId = sprite.tileIdFor(insideY);
			const row = new Tile(ppu, sprite.patternTableId, tileId, rowY);

			for (let insideX = 0; insideX < width; insideX++) {
				const colX = sprite.flipX ? width - 1 - insideX : insideX;
				const colorIndex = row.getColorIndex(colX);
				previewColors[insideY * width + insideX] =
					(colorIndex > 0 ? palette[colorIndex] ?? bg : bg) >>> 0;
			}
		}

		const paletteColors = [
			bg,
			palette[1] ?? bg,
			palette[2] ?? bg,
			palette[3] ?? bg,
		].map((c) => c >>> 0);

		const tileText =
			height === 16
				? `${hex.format(sprite.tileId, 2)} + ${hex.format(
						(sprite.tileId + 1) & 0xff,
						2
				  )}`
				: `${hex.format(sprite.tileId, 2)}`;

		return {
			index,
			oamAddress: sprite.oamAddress,
			x: sprite.x,
			y: sprite.y,
			tileText,
			paletteAddress: sprite.paletteAddress,
			flipH: sprite.flipX,
			flipV: sprite.flipY,
			prio: !sprite.isInFrontOfBackground, // true => behind background
			spriteHeight: height,
			previewColors,
			paletteColors,
		};
	}

	_drawSpriteInfoOverlayForeground(info) {
		const pad10 = (n) => String(n).padEnd(10, " ");
		const posText = pad10(`(${info.x}, ${info.y})`);
		const flags =
			(info.flipH ? "H" : "-") +
			(info.flipV ? "V" : "-") +
			(info.prio ? "B" : "-");
		const lines = [
			`OAM index       : $${hex.format(info.index, 2)}`,
			`OAM address     : $${hex.format(info.oamAddress, 4)} `,
			`Position        : ${posText}`,
			`Tile            : $${info.tileText}`,
			`Palette address : $${hex.format(info.paletteAddress, 4)} `,
			`Flags           : ${flags}`,
		];

		// measure
		const previewWidth = TILE_SIZE_PIXELS * PREVIEW_SCALE;
		const previewHeight = info.spriteHeight * PREVIEW_SCALE;
		const extraWidth = previewWidth + BLOCK_GAP + SWATCH_SIZE * 4;
		const extraHeight = Math.max(previewHeight, SWATCH_SIZE);

		// box
		const { draw, cursorX, cursorY, contentWidth } = this._overlayBox(
			lines,
			extraWidth,
			extraHeight
		);

		// preview
		const previewX0 = cursorX + Math.floor((contentWidth - extraWidth) / 2);
		const previewY0 = cursorY + Math.floor((extraHeight - previewHeight) / 2);
		this._drawPreviewFromArray(
			draw,
			previewX0,
			previewY0,
			PREVIEW_SCALE,
			TILE_SIZE_PIXELS,
			info.spriteHeight,
			info.previewColors
		);

		// palette
		const paletteX0 = previewX0 + BLOCK_GAP + previewWidth;
		const paletteY0 = cursorY + Math.floor((extraHeight - SWATCH_SIZE) / 2);
		this._drawPaletteRow(draw, paletteX0, paletteY0, info.paletteColors);
	}
	//#endregion

	//#region Palettes
	_drawPalettesTab() {
		widgets.simpleTab(this, "Palettes", () => {});
	}
	//#endregion

	//#region Info
	_drawInfoTab() {
		widgets.simpleTab(this, "Info", () => {});
	}
	//#endregion

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

	_overlayBox(lines, extraWidth = 0, extraHeight = 0) {
		const draw = ImGui.GetForegroundDrawList();
		const viewport = ImGui.GetMainViewport
			? ImGui.GetMainViewport()
			: { WorkPos: ImGui.GetWindowPos(), WorkSize: ImGui.GetWindowSize() };

		// measure text
		let maxWidth = 0,
			totalHeight = 0;
		const heights = [];
		for (let i = 0; i < lines.length; i++) {
			const size = ImGui.CalcTextSize(lines[i]);
			maxWidth = Math.max(maxWidth, size.x);
			heights.push(size.y);
			totalHeight += size.y + (i ? OVERLAY_LINE_GAP : 0);
		}

		const contentWidth = Math.max(maxWidth, extraWidth);
		const contentHeight =
			totalHeight + (extraHeight ? BLOCK_GAP + extraHeight : 0);

		// bg + border
		const x1 = viewport.WorkPos.x + viewport.WorkSize.x - OVERLAY_MARGIN;
		const y1 = viewport.WorkPos.y + viewport.WorkSize.y - OVERLAY_MARGIN;
		const x0 = x1 - contentWidth - 14;
		const y0 = y1 - contentHeight - 14;
		draw.AddRectFilled(
			new ImGui.Vec2(x0, y0),
			new ImGui.Vec2(x1, y1),
			COLOR_INFO_OVERLAY_FILL,
			OVERLAY_RADIUS
		);
		draw.AddRect(
			new ImGui.Vec2(x0, y0),
			new ImGui.Vec2(x1, y1),
			COLOR_INFO_OVERLAY_STROKE,
			OVERLAY_RADIUS,
			0,
			1
		);

		// text
		let cy = y0 + OVERLAY_PAD;
		const cx = x0 + OVERLAY_PAD;
		for (let i = 0; i < lines.length; i++) {
			draw.AddText(new ImGui.Vec2(cx, cy), COLOR_INFO_OVERLAY_TEXT, lines[i]);
			cy += heights[i] + OVERLAY_LINE_GAP;
		}

		// where to place extra blocks
		const cursorX = cx;
		const cursorY = cy + (extraHeight ? BLOCK_GAP : 0);
		return { draw, cursorX, cursorY, contentWidth };
	}

	_drawPreviewFromArray(draw, x0, y0, scale, width, height, colors) {
		this._drawPreview(
			draw,
			x0,
			y0,
			scale,
			width,
			height,
			(tx, ty) => colors[ty * width + tx]
		);
	}

	_drawPreview(draw, x0, y0, scale, width, height, getColor) {
		for (let ty = 0; ty < height; ty++) {
			for (let tx = 0; tx < width; tx++) {
				const color = getColor(tx, ty) >>> 0;
				const x = x0 + tx * scale,
					y = y0 + ty * scale;

				draw.AddRectFilled(
					new ImGui.Vec2(x, y),
					new ImGui.Vec2(x + scale, y + scale),
					color
				);
			}
		}
	}

	_drawPaletteRow(draw, x, y, colors4) {
		for (let i = 0; i < 4; i++) {
			const color = colors4[i] >>> 0;
			const x0 = x + i * SWATCH_SIZE,
				y0 = y;

			draw.AddRectFilled(
				new ImGui.Vec2(x0, y0),
				new ImGui.Vec2(x0 + SWATCH_SIZE, y0 + SWATCH_SIZE),
				color,
				3
			);
			draw.AddRect(
				new ImGui.Vec2(x0, y0),
				new ImGui.Vec2(x0 + SWATCH_SIZE, y0 + SWATCH_SIZE),
				RGBA(0, 0, 0, 200),
				3,
				0,
				1
			);
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
