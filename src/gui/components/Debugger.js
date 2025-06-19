import React, { PureComponent } from "react";
import styles from "./Debugger.module.css";

const ImGui = window.ImGui;
const ImGui_Impl = window.ImGui_Impl;

export default class Debugger extends PureComponent {
	static get id() {
		return "Debugger";
	}

	async initialize(args, level) {
		this._level = level;

		this._input = "";
		this._float = 0.4;
	}

	render() {
		return (
			<div className={styles.container}>
				<canvas
					className={styles.imgui}
					ref={this._onCanvas}
					tabindex="1"
				></canvas>
			</div>
		);
	}

	focus = () => {};

	_draw = () => {
		ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);
		ImGui.SetNextWindowSize(
			new ImGui.ImVec2(294, 140),
			ImGui.Cond.FirstUseEver
		);

		ImGui.Begin(
			"Debug window",
			null,
			ImGui.WindowFlags.NoMove |
				ImGui.WindowFlags.NoResize |
				ImGui.WindowFlags.NoCollapse
		);
		if (ImGui.Button("Save")) {
			alert("Test");
		}

		ImGui.InputText("field 1", (v = this._input) => (this._input = v), 256);
		ImGui.SliderFloat(
			"field 2",
			(v = this._float) => (this._float = v),
			0.0,
			1.0
		);

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
