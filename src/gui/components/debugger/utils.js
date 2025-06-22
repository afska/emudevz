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
};
