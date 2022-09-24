import NES from "nes-emu";

export default {
	create(code) {
		const cpu = new NES().cpu;

		const memory = {
			bytes: new Uint8Array(0xffff + 1),
			readAt(address) {
				return this.bytes[address] || 0;
			},
			readBytesAt(address, n) {
				return n === 2 ? this.read2BytesAt(address) : this.readAt(address);
			},
			read2BytesAt(address) {
				return (this.readAt(address) << 8) | this.readAt(address + 1);
			},
			writeAt(address, byte) {
				if (address > 0 && address <= 0xffff) this.bytes[address] = byte;
			},
		};
		const context = {
			cpu,
			memoryBus: { cpu: memory },
		};

		cpu.memory = memory;
		cpu.context = context;
		cpu.stack.context = context;
		cpu.pc.value = 0x4020;

		code.forEach((byte, i) => memory.writeAt(0x4020 + i, byte));

		return cpu;
	},
};
