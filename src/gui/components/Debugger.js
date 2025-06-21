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
				ImGui.Combo(
					"Region",
					(value = this._memRegion) => (this._memRegion = value),
					[
						"All",
						"CPU $0000-$2000 // WRAM",
						"CPU $0800-$1FFF // WRAM Mirror",
						"CPU $2000-$2007 // PPU Registers",
					]
				);

				this._memoryEditor.DrawContents(
					this._memData,
					MEM_TOTAL - MEM_START,
					MEM_START
				);
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("CPU")) {
				(() => {
					const flags =
						ImGui.TableFlags.SizingFixedFit |
						ImGui.TableFlags.RowBg |
						ImGui.TableFlags.Borders |
						ImGui.TableFlags.NoHostExtendX;

					if (ImGui.BeginTable("table1", 5, flags)) {
						ImGui.TableSetupColumn("[A]", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn("[X]", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn("[Y]", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn("[SP]", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn("[PC]", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableHeadersRow();

						ImGui.TableNextRow();
						for (let column = 0; column < 5; column++) {
							ImGui.TableSetColumnIndex(column);
							ImGui.Text(column === 4 ? "$8000" : "$00");
						}

						ImGui.EndTable();
					}
				})();

				ImGui.SameLine();

				(() => {
					const flags =
						ImGui.TableFlags.SizingFixedFit |
						ImGui.TableFlags.RowBg |
						ImGui.TableFlags.Borders |
						ImGui.TableFlags.NoHostExtendX;

					if (ImGui.BeginTable("table2", 8, flags)) {
						ImGui.TableSetupColumn("N", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn("V", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn("-", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn("-", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn("D", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn("I", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn("Z", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableSetupColumn("C", ImGui.TableColumnFlags.WidthFixed);
						ImGui.TableHeadersRow();

						ImGui.TableNextRow();
						for (let column = 0; column < 8; column++) {
							ImGui.TableSetColumnIndex(column);
							ImGui.Text(column === 3 ? "1" : "0");
						}

						ImGui.EndTable();
					}
				})();

				(() => {
					const flags =
						ImGui.TableFlags.SizingFixedFit |
						ImGui.TableFlags.RowBg |
						ImGui.TableFlags.Borders |
						ImGui.TableFlags.ScrollY |
						ImGui.TableFlags.NoHostExtendX;

					if (ImGui.BeginTable("table3", 4, flags)) {
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

						for (let i = 0; i < 32; i++) {
							ImGui.TableNextRow();
							for (let column = 0; column < 4; column++) {
								ImGui.TableSetColumnIndex(column);
								ImGui.Text(
									column === 0
										? "C000"
										: column === 1
										? "4C F5 C5"
										: column === 2
										? "JMP $C5F5"
										: "A:00 X:00 Y:00 P:24 SP:FD CYC:7"
								);
							}
						}

						ImGui.EndTable();
					}
				})();

				ImGui.EndTabItem();
			}

			if (ImGui.BeginTabItem("PPU")) {
				ImGui.Text("hello PPU");
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("APU")) {
				ImGui.Text("hello APU");
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("Cartridge")) {
				ImGui.Text("hello Cartridge");
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("Controller")) {
				ImGui.Text("hello Controller");
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("Mapper")) {
				ImGui.Text("hello Mapper");
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("Logs")) {
				ImGui.Text("hello Mapper");
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
