import React, { PureComponent } from "react";
import styles from "./Debugger.module.css";

const ImGui = window.ImGui;
const ImGui_Impl = window.ImGui_Impl;

const MEM_START = 0x0000;
const MEM_TOTAL = 0xffff + 1;

export default class Debugger extends PureComponent {
	static get id() {
		return "Debugger";
	}

	async initialize(args, level) {
		this._level = level;

		this._input = "";
		this._float = 0.4;
		this._memRegion = 0;
		this._memData = new ArrayBuffer(MEM_TOTAL);
		this._memoryEditor = new window.ImGui_Memory_Editor.MemoryEditor();
		this._memoryEditor.ReadOnly = true; // (this prevents a crash!)
		// this._memoryEditor.OptShowOptions = false;
		this._memoryEditor.OptAddrDigitsCount = 4;
		this._memoryEditor.ReadFn = (__, addr) => {
			return addr % 256;
		};
	}

	render() {
		return (
			<div className={styles.container}>
				<canvas
					className={styles.imgui}
					ref={this._onCanvas}
					tabIndex="-1"
				></canvas>
			</div>
		);
	}

	focus = () => {};

	_draw = () => {
		const margin = 10;
		ImGui.SetNextWindowPos(
			new ImGui.ImVec2(margin, margin),
			ImGui.Cond.FirstUseEver
		);
		const io = ImGui.GetIO();
		ImGui.SetNextWindowSize(
			new ImGui.ImVec2(
				io.DisplaySize.x - margin * 2,
				io.DisplaySize.y - margin * 2
			)
		);

		ImGui.Begin(
			"Debugger",
			null,
			ImGui.WindowFlags.NoMove |
				ImGui.WindowFlags.NoResize |
				ImGui.WindowFlags.NoCollapse
		);

		if (ImGui.BeginTabBar("Tabs")) {
			if (ImGui.BeginTabItem("Memory")) {
				const label = "Region";
				const style = ImGui.GetStyle();
				// compute how much width the combo itself can use, leaving room for the label + spacing
				const avail = ImGui.GetContentRegionAvail().x;
				const labelW = ImGui.CalcTextSize(label).x;
				const comboW = avail - labelW - style.ItemInnerSpacing.x;

				ImGui.PushItemWidth(comboW);
				ImGui.Combo(label, (v = this._memRegion) => (this._memRegion = v), [
					"All",
					"CPU $0000-$2000 // WRAM",
					"CPU $0800-$1FFF // WRAM Mirror",
					"CPU $2000-$2007 // PPU Registers",
				]);
				ImGui.PopItemWidth();

				this._memoryEditor.DrawContents(
					this._memData,
					MEM_TOTAL - MEM_START,
					MEM_START
				);
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("CPU")) {
				// compute widths of table1 and table2 so we can center them with a gap
				const style = ImGui.GetStyle();
				const headers1 = ["[A]", "[X]", "[Y]", "[SP]", "[PC]"];
				const headers2 = ["N", "V", "-", "-", "D", "I", "Z", "C"];
				let table1W = 0,
					table2W = 0;

				for (let h of headers1)
					table1W += ImGui.CalcTextSize(h).x + style.CellPadding.x * 2;
				table1W +=
					style.ItemInnerSpacing.x * (headers1.length - 1) +
					style.FrameBorderSize * 2;
				for (let h of headers2)
					table2W += ImGui.CalcTextSize(h).x + style.CellPadding.x * 2;
				table2W +=
					style.ItemInnerSpacing.x * (headers2.length - 1) +
					style.FrameBorderSize * 2;

				const availW = ImGui.GetContentRegionAvail().x;
				const gap = style.ItemSpacing.x;
				const offset = (availW - table1W - table2W - gap) * 0.5;
				ImGui.SetCursorPosX(ImGui.GetCursorPosX() + offset);

				{
					const flags =
						ImGui.TableFlags.SizingFixedFit |
						ImGui.TableFlags.RowBg |
						ImGui.TableFlags.Borders |
						ImGui.TableFlags.NoHostExtendX;
					if (ImGui.BeginTable("table1", headers1.length, flags)) {
						for (let h of headers1) {
							ImGui.TableSetupColumn(h, ImGui.TableColumnFlags.WidthFixed);
						}
						ImGui.TableHeadersRow();
						ImGui.TableNextRow();
						for (let i = 0; i < headers1.length; i++) {
							ImGui.TableSetColumnIndex(i);
							ImGui.Text(i === 4 ? "$8000" : "$00");
						}
						ImGui.EndTable();
					}
				}

				ImGui.SameLine(undefined, gap);

				{
					const flags =
						ImGui.TableFlags.SizingFixedFit |
						ImGui.TableFlags.RowBg |
						ImGui.TableFlags.Borders |
						ImGui.TableFlags.NoHostExtendX;
					if (ImGui.BeginTable("table2", headers2.length, flags)) {
						for (let h of headers2) {
							ImGui.TableSetupColumn(h, ImGui.TableColumnFlags.WidthFixed);
						}
						ImGui.TableHeadersRow();
						ImGui.TableNextRow();
						for (let i = 0; i < headers2.length; i++) {
							ImGui.TableSetColumnIndex(i);
							ImGui.Text(i === 3 ? "1" : "0");
						}
						ImGui.EndTable();
					}
				}

				{
					const flags =
						ImGui.TableFlags.SizingFixedFit |
						ImGui.TableFlags.RowBg |
						ImGui.TableFlags.Borders |
						ImGui.TableFlags.ScrollY |
						ImGui.TableFlags.NoHostExtendX;
					if (ImGui.BeginTable("table3", 4, flags)) {
						ImGui.TableSetupScrollFreeze(0, 1);
						ImGui.TableSetupColumn("[PC]", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn(
							"Binary",
							ImGui.TableColumnFlags.WidthFixed,
							10 * 8
						);
						ImGui.TableSetupColumn(
							"Instruction",
							ImGui.TableColumnFlags.WidthFixed,
							16 * 8
						);
						ImGui.TableSetupColumn(
							"Context",
							ImGui.TableColumnFlags.WidthFixed
						);
						ImGui.TableHeadersRow();

						for (let row = 0; row < 32; row++) {
							ImGui.TableNextRow();
							for (let col = 0; col < 4; col++) {
								ImGui.TableSetColumnIndex(col);
								ImGui.Text(
									col === 0
										? "C000"
										: col === 1
										? "4C F5 C5"
										: col === 2
										? "JMP $C5F5"
										: "A:00 X:00 Y:00 P:24 SP:FD CYC:7"
								);
							}
						}
						ImGui.EndTable();
					}
				}

				ImGui.EndTabItem();
			}

			if (ImGui.BeginTabItem("PPU")) {
				ImGui.Text("hello PPU");

				const gl = ImGui_Impl.gl;
				const pixels = new Uint32Array(256 * 240);
				for (let y = 0; y < 240; y++) {
					for (let x = 0; x < 256; x++) {
						const r = x & 0xff;
						const g = y & 0xff;
						const b = Math.floor(Math.random() * 128) & 0xff;
						const a = 0xff;
						pixels[y * 256 + x] = (a << 24) | (b << 16) | (g << 8) | r;
					}
				}
				gl.bindTexture(gl.TEXTURE_2D, this._fbTex0);
				gl.texSubImage2D(
					gl.TEXTURE_2D,
					0,
					0,
					0,
					256,
					240,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					new Uint8Array(pixels.buffer)
				);

				const drawList = ImGui.GetWindowDrawList();
				const p = ImGui.GetCursorScreenPos();
				drawList.AddImage(
					this._fbTex0,
					p,
					new ImGui.Vec2(p.x + 256, p.y + 240)
				);

				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("APU")) {
				const N = 100;
				// example wave data
				const square1 = Array.from({ length: N }, (_, i) =>
					i % 20 < 10 ? 1 : -1
				);
				const square2 = Array.from({ length: N }, (_, i) =>
					i % 40 < 10 ? 1 : -1
				);
				const triangle = Array.from({ length: N }, (_, i) => {
					const period = 50,
						t = i % period;
					return t < period / 2
						? (t / (period / 2)) * 2 - 1
						: ((period - t) / (period / 2)) * 2 - 1;
				});
				const noise = Array.from({ length: N }, () => Math.random() * 2 - 1);
				const dmc = Array.from({ length: N }, () => Math.random() * 2 - 1);
				const mix = square1.map(
					(v, i) => (v + square2[i] + triangle[i] + noise[i] + dmc[i]) / 5
				);

				const size = new ImGui.Vec2(0, 80);
				ImGui.PlotLines("Pulse Channel 1", square1, N, 0, "", -1, 1, size);
				ImGui.PlotLines("Pulse Channel 2", square2, N, 0, "", -1, 1, size);
				ImGui.PlotLines("Triangle Channel", triangle, N, 0, "", -1, 1, size);
				ImGui.PlotLines("Noise Channel", noise, N, 0, "", -1, 1, size);
				ImGui.PlotLines("DMC Channel", dmc, N, 0, "", -1, 1, size);
				ImGui.PlotLines("Mix", mix, N, 0, "", -1, 1, size);

				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("External")) {
				const buttons = [
					"Up",
					"Down",
					"Left",
					"Right",
					"A",
					"B",
					"Select",
					"Start",
				];
				for (let c = 1; c <= 2; c++) {
					{
						const flags =
							ImGui.TableFlags.SizingFixedFit |
							ImGui.TableFlags.RowBg |
							ImGui.TableFlags.Borders |
							ImGui.TableFlags.NoHostExtendX;
						if (ImGui.BeginTable("controller" + c, 1, flags)) {
							ImGui.TableSetupColumn(
								`Controller ${c}`,
								ImGui.TableColumnFlags.WidthFixed
							);
							ImGui.TableHeadersRow();
							ImGui.TableNextRow();
							ImGui.TableSetColumnIndex(0);
							for (let i = 0; i < buttons.length; i++) {
								const pressed = c === 1 ? i % 2 === 0 : i % 3 === 0; // mock
								const col = pressed
									? new ImGui.Vec4(0xc3 / 255, 0x9f / 255, 0x79 / 255, 1) // #c39f79
									: new ImGui.Vec4(0.5, 0.5, 0.5, 1); // gray
								ImGui.TextColored(col, buttons[i]);
								ImGui.SameLine();
							}
							ImGui.EndTable();
						}
					}
					ImGui.SameLine();
				}
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("Logs")) {
				ImGui.Text("hello Logs");
				ImGui.EndTabItem();
			}
		}

		// if (ImGui.Button("Save")) {
		// 	alert("Test");
		// }

		// ImGui.InputText("field 1", (v = this._input) => (this._input = v), 256);
		// ImGui.SliderFloat(
		// 	"field 2",
		// 	(v = this._float) => (this._float = v),
		// 	0.0,
		// 	1.0
		// );

		ImGui.End();
	};

	_onCanvas = (canvas) => {
		if (!canvas) return;
		const self = this;

		(async function () {
			await ImGui.default();

			const devicePixelRatio = window.devicePixelRatio || 1;
			canvas.width = canvas.scrollWidth * devicePixelRatio;
			canvas.height = canvas.scrollHeight * devicePixelRatio;
			window.addEventListener("resize", () => {
				const devicePixelRatio = window.devicePixelRatio || 1;
				canvas.width = canvas.scrollWidth * devicePixelRatio;
				canvas.height = canvas.scrollHeight * devicePixelRatio;
			});

			ImGui.CreateContext();
			ImGui_Impl.Init(canvas);

			// Buffer
			const gl = ImGui_Impl.gl;
			self._fbTex0 = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, self._fbTex0);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			// allocate empty RGBA buffer
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				256,
				240,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				null
			);

			// ImGui.StyleColorsDark(); // DISABLED
			ImGui.StyleColorsClassic();

			window.requestAnimationFrame(_loop);
			function _loop(time) {
				ImGui_Impl.NewFrame(time);
				ImGui.NewFrame();

				self._draw();

				ImGui.EndFrame();
				ImGui.Render();
				ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

				self._animationFrame = window.requestAnimationFrame(_loop);
			}
		})();
	};

	componentDidMount() {}

	componentWillUnmount() {
		// TODO: REMOVE RESIZE LISTENER, window.addEventListener("resize"
		ImGui_Impl.Shutdown();
		ImGui.DestroyContext();
		if (this._animationFrame) window.cancelAnimationFrame(this._animationFrame);
	}

	// _logError(err) {
	// 	ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0), "Error: ");
	// 	ImGui.SameLine();
	// 	ImGui.Text(err.message);
	// }
}
