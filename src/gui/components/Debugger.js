import React, { PureComponent } from "react";
import DebuggerGUI from "./debugger/DebuggerGUI";
import styles from "./Debugger.module.css";

const ImGui = window.ImGui;
const ImGui_Impl = window.ImGui_Impl;

export const GenericDebugger = (DebuggerGUIClass = DebuggerGUI) =>
	class Debugger extends PureComponent {
		static get id() {
			return "Debugger";
		}

		async initialize(args, level) {
			this._level = level;

			this.debuggerGUI = new DebuggerGUIClass(args);
		}

		render() {
			const { accessory } = this.props;

			return (
				<div className={styles.container}>
					{accessory}
					<canvas
						className={styles.imgui}
						ref={this._onCanvas}
						tabIndex="-1"
					></canvas>
				</div>
			);
		}

		focus = () => {};

		do = (action) => {
			action(this.debuggerGUI);
		};

		_draw = () => {
			this.debuggerGUI.draw();
		};

		_onCanvas = (canvas) => {
			this._canvas = canvas;
			if (!canvas) return;
			const self = this;

			(async function () {
				await ImGui.default();

				const devicePixelRatio = window.devicePixelRatio || 1;
				canvas.width = canvas.scrollWidth * devicePixelRatio;
				canvas.height = canvas.scrollHeight * devicePixelRatio;
				window.addEventListener("resize", self._onResize);

				ImGui.CreateContext();
				ImGui_Impl.Init(canvas);

				self.debuggerGUI.init();

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

		componentWillUnmount() {
			if (this.debuggerGUI != null) this.debuggerGUI.destroy();
			window.removeEventListener("resize", this._onResize);
			ImGui_Impl.Shutdown();
			ImGui.DestroyContext();
			if (this._animationFrame)
				window.cancelAnimationFrame(this._animationFrame);
		}

		_onResize = () => {
			const canvas = this._canvas;
			if (!canvas) return;

			const devicePixelRatio = window.devicePixelRatio || 1;
			canvas.width = canvas.scrollWidth * devicePixelRatio;
			canvas.height = canvas.scrollHeight * devicePixelRatio;
		};
	};

export default GenericDebugger();
