const ImGui = window.ImGui;

const MEM_START = 0x0000;
const MEM_TOTAL = 0xffff + 1;

export default class Debugger_Memory {
	constructor() {
		this._memRegion = 0;
		this._memData = new ArrayBuffer(MEM_TOTAL);
		this._memoryEditor = new window.ImGui_Memory_Editor.MemoryEditor();
		this._memoryEditor.ReadOnly = true; // (this prevents a crash!)
		this._memoryEditor.OptAddrDigitsCount = 4;
		this._memoryEditor.ReadFn = (__, address) => {
			const neees = window.EMULATION?.neees;
			if (!neees) return 0;

			// reimplementing some memory-mapped reads to avoid triggering side effects

			if (address >= 0x2008 && address <= 0x3fff)
				address = 0x2000 + ((address - 0x2008) % 0x0008);

			switch (address) {
				case 0x2002:
					return neees.ppu.registers?.ppuStatus.value;
				case 0x2007:
					return neees.ppu.registers?.ppuData.buffer ?? 0;
				default:
					return neees.cpu.memory.read(address);
			}
		};
	}

	draw() {
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
	}
}
