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
	numberOr0(value) {
		const number = Number(value);
		return isNaN(number) ? 0 : number;
	},
	withTextColor(hex, draw) {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;
		ImGui.PushStyleColor(ImGui.Col.Text, new ImGui.Vec4(r, g, b, 1));
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
};
