import utils from "./utils";

const ImGui = window.ImGui;

const MEM_TOTAL = 0x10000;

const REGIONS = [
	{ label: "All", start: 0x0000, size: MEM_TOTAL },
	{ label: "CPU $0000-$07FF | WRAM (2 KiB)", start: 0x0000, size: 0x0800 },
	{
		label: "CPU $0800-$1FFF | Mirrors of $0000-$07FF",
		start: 0x0800,
		size: 0x1800,
	},
	{ label: "CPU $2000-$2007 | PPU registers", start: 0x2000, size: 0x0008 },
	{
		label: "CPU $2008-$3FFF | Mirrors of $2000-$2007",
		start: 0x2008,
		size: 0x1ff8,
	},
	{ label: "CPU $4000-$4013 | APU registers", start: 0x4000, size: 0x0014 },
	{ label: "CPU $4014-$4014 | PPU's OAMDMA", start: 0x4014, size: 0x0001 },
	{
		label: "CPU $4015-$4015 | APUStatus / APUControl registers",
		start: 0x4015,
		size: 0x0001,
	},
	{
		label: "CPU $4016-$4016 | Controller port 1",
		start: 0x4016,
		size: 0x0001,
	},
	{
		label: "CPU $4017-$4017 | Controller port 2 / APUFrameCounter",
		start: 0x4017,
		size: 0x0001,
	},
	{ label: "CPU $4018-$401F | Unused", start: 0x4018, size: 0x0008 },
	{ label: "CPU $4020-$FFFF | Cartridge space", start: 0x4020, size: 0xbfe0 },

	{ label: "PPU $0000-$1FFF | Pattern tables", start: 0x0000, size: 0x2000 },
	{ label: "PPU $2000-$2FFF | Name tables", start: 0x2000, size: 0x1000 },
	{
		label: "PPU $3000-$3EFF | Mirrors of $2000-$2EFF",
		start: 0x3000,
		size: 0x0f00,
	},
	{ label: "PPU $3F00-$3F1F | Palette RAM", start: 0x3f00, size: 0x0020 },
	{
		label: "PPU $3F20-$3FFF | Mirrors of $3F00-$3F1F",
		start: 0x3f20,
		size: 0x00e0,
	},
	{ label: "PPU OAM RAM", start: 0x0000, size: 0x0100 },
];

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
					return utils.numberOr0(neees.ppu.registers?.ppuStatus.value);
				case 0x2007:
					return utils.numberOr0(neees.ppu.registers?.ppuData.buffer);
				default:
					return utils.numberOr0(neees.cpu.memory.read(address));
			}
		};
	}

	draw() {
		utils.fullWidthFieldWithLabel("Region", (label) => {
			ImGui.Combo(
				label,
				(v = this._memRegion) => (this._memRegion = v),
				REGIONS.map((r) => r.label)
			);
		});

		const region = REGIONS[this._memRegion];
		this._memoryEditor.DrawContents(this._memData, region.size, region.start);
	}
}
