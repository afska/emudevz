const ImGui = window.ImGui;

export default {
	fullWidthFieldWithLabel(label, draw) {
		const avail = ImGui.GetContentRegionAvail().x;
		const labelW = ImGui.CalcTextSize(label).x;
		const comboW = avail - labelW - ImGui.GetStyle().ItemInnerSpacing.x;

		ImGui.PushItemWidth(comboW);
		draw(label);
		ImGui.PopItemWidth();
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
	simpleSection(id, label, draw, textColor = null) {
		if (textColor != null)
			this.withTextColor(textColor, () => ImGui.Text(label));
		else ImGui.Text(label);

		draw();
	},
	simpleTab(name, draw, isSelected = null) {
		if (isSelected != null) ImGui.BeginDisabled(true);
		const opened = ImGui.BeginTabItem(
			name,
			null,
			isSelected ? ImGui.TabItemFlags.SetSelected : ImGui.TabItemFlags.None
		);
		if (isSelected != null) ImGui.EndDisabled(true);

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
	boolean(label, value) {
		ImGui.BeginDisabled(true);
		ImGui.Checkbox(label, () => value);
		ImGui.EndDisabled();
	},
	value(fieldName, value) {
		ImGui.Text(`${fieldName} =`);
		ImGui.SameLine();
		this.withTextColor("#c39f79", () => ImGui.Text(`${value}`));
	},
	hexToVec4(hex) {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;
		return new ImGui.Vec4(r, g, b, 1);
	},
	withTextColor(hex, draw) {
		ImGui.PushStyleColor(ImGui.Col.Text, this.hexToVec4(hex));
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
};
