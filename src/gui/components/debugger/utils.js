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
};
