const ImGui = window.ImGui;
const ImGui_Impl = window.ImGui_Impl;

export default {
	window(name, { margin = 10, flags = 0 }, draw) {
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
			name,
			null,
			ImGui.WindowFlags.NoMove |
				ImGui.WindowFlags.NoResize |
				ImGui.WindowFlags.NoCollapse |
				flags
		);

		draw();

		ImGui.End();
	},
	simpleTab(unit, name, draw) {
		const isSelected =
			name === unit.selectedTab || (unit.args.readOnly ? false : null);

		if (typeof isSelected === "boolean") ImGui.BeginDisabled(true);
		const opened = ImGui.BeginTabItem(
			name,
			null,
			isSelected ? ImGui.TabItemFlags.SetSelected : ImGui.TabItemFlags.None
		);
		if (typeof isSelected === "boolean") ImGui.EndDisabled(true);

		if (opened) {
			ImGui.BeginChild(
				"Child" + name,
				new ImGui.ImVec2(0, 0),
				false,
				ImGui.WindowFlags.None
			);
			draw();
			ImGui.EndChild();
			ImGui.EndTabItem();
		}
	},
	simpleTable(id, label, draw) {
		const flags =
			ImGui.TableFlags.SizingStretchProp |
			ImGui.TableFlags.RowBg |
			ImGui.TableFlags.Borders;

		if (ImGui.BeginTable(id, 1, flags)) {
			ImGui.TableSetupColumn(label, ImGui.TableColumnFlags.None);
			ImGui.TableHeadersRow();
			ImGui.TableNextRow();
			ImGui.TableSetColumnIndex(0);
			draw();
			ImGui.EndTable();
		}
	},
	simpleSection(label, draw, textColor = null) {
		if (textColor != null)
			this.withTextColor(textColor, () => ImGui.Text(label));
		else ImGui.Text(label);

		draw();
	},
	fullWidthFieldWithLabel(label, draw) {
		const availableWidth = ImGui.GetContentRegionAvail().x;
		const labelWidth = ImGui.CalcTextSize(label).x;
		const comboW =
			availableWidth - labelWidth - ImGui.GetStyle().ItemInnerSpacing.x;

		ImGui.PushItemWidth(comboW);
		draw(label);
		ImGui.PopItemWidth();
	},
	progressBar(value, text) {
		ImGui.ProgressBar(value, new ImGui.Vec2(-1, 16), text);
	},
	wave(samples, n, min, max, height = 40) {
		const waveSize = new ImGui.Vec2(ImGui.GetContentRegionAvail().x, height);
		ImGui.PlotLines("", samples, n, 0, "", min, max, waveSize);
	},
	dutyCycle(dutyWave) {
		ImGui.PlotHistogram(
			"",
			dutyWave,
			dutyWave.length,
			0,
			"",
			0,
			1,
			new ImGui.Vec2(80, 16)
		);
	},
	booleanSquare(isActive, label, activeColor) {
		ImGui.BeginDisabled(true);

		if (isActive) {
			const vec4Color = this.colorHexToVec4(activeColor);

			ImGui.PushStyleColor(ImGui.Col.Button, vec4Color);
			ImGui.PushStyleColor(ImGui.Col.ButtonHovered, vec4Color);
			ImGui.PushStyleColor(ImGui.Col.ButtonActive, vec4Color);
			ImGui.Button(label);
			ImGui.PopStyleColor(3);
		} else {
			ImGui.BeginDisabled(true);
			ImGui.Button(label);
		}

		ImGui.EndDisabled();
	},
	value(fieldName, value) {
		ImGui.Text(`${fieldName} =`);
		ImGui.SameLine();
		this.withTextColor("#c39f79", () => ImGui.Text(`${value}`));
	},
	boolean(label, value) {
		ImGui.BeginDisabled(true);
		ImGui.Checkbox(label, () => value);
		ImGui.EndDisabled();
	},
	colorHexToVec4(hex) {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;
		return new ImGui.Vec4(r, g, b, 1);
	},
	newTexture(width, height) {
		const gl = ImGui_Impl.gl;

		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// $aabbggrr buffer
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			width,
			height,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null
		);

		return texture;
	},
	updateTexture(texture, width, height, pixels) {
		const gl = ImGui_Impl.gl;

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texSubImage2D(
			gl.TEXTURE_2D,
			0,
			0,
			0,
			width,
			height,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array(pixels.buffer)
		);
	},
	deleteTexture(texture) {
		const gl = ImGui_Impl.gl;
		gl.deleteTexture(texture);
	},
	withWaveColor(hex, draw) {
		if (hex != null) {
			const vec4Color = this.colorHexToVec4(hex);
			ImGui.PushStyleColor(ImGui.Col.PlotHistogram, vec4Color);
			ImGui.PushStyleColor(ImGui.Col.PlotHistogramHovered, vec4Color);
			ImGui.PushStyleColor(ImGui.Col.PlotLines, vec4Color);
			ImGui.PushStyleColor(ImGui.Col.PlotLinesHovered, vec4Color);
		}

		draw();

		if (hex != null) ImGui.PopStyleColor(4);
	},
	withTextColor(hex, draw) {
		ImGui.PushStyleColor(ImGui.Col.Text, this.colorHexToVec4(hex));
		draw();
		ImGui.PopStyleColor();
	},
	withBgColor(hex, draw) {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;
		ImGui.PushStyleColor(ImGui.Col.Button, new ImGui.Vec4(r, g, b, 1));
		ImGui.PushStyleColor(
			ImGui.Col.ButtonHovered,
			new ImGui.Vec4(r * 1.1, g * 1.1, b * 1.1, 1)
		);
		ImGui.PushStyleColor(
			ImGui.Col.ButtonActive,
			new ImGui.Vec4(r * 0.9, g * 0.9, b * 0.9, 1)
		);
		draw();
		ImGui.PopStyleColor(3);
	},
	numberOr0(value) {
		const number = Number(value);
		return isNaN(number) ? 0 : number;
	},
	centerNextItemX(width) {
		const availableWidth = ImGui.GetContentRegionAvail().x;
		ImGui.SetCursorPosX(
			ImGui.GetCursorPosX() + Math.max(0, (availableWidth - width) / 2)
		);
	},
	rightAlignedButton(label, action) {
		const regionMaxX = ImGui.GetWindowContentRegionMax().x;
		const buttonWidth =
			ImGui.CalcTextSize(label).x + ImGui.GetStyle().FramePadding.x * 2;
		ImGui.SetCursorPosX(regionMaxX - buttonWidth);
		ImGui.AlignTextToFramePadding();
		if (ImGui.Button(label)) {
			action();
		}
	},
};
