import NES from "nes-emu";
import assembler from "./assembler";

const CODE_ADDRESS = 0x4020;
const TIMEOUT = 3000;

export default {
	CODE_ADDRESS,

	create(code, preCode = null) {
		const { instructions, bytes } = assembler.compile(code);
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
				return (this.readAt(address + 1) << 8) | this.readAt(address);
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
		cpu.pc.value = CODE_ADDRESS;

		if (preCode != null) {
			try {
				const preCpu = this.create(preCode).cpu;
				let randomByte = Math.floor(Math.random() * 255);
				if (randomByte === 7) randomByte++;
				preCpu.memory.writeAt(0x4000, Math.random() < 0.5 ? 7 : randomByte);
				preCpu.run();
				for (let i = 0; i < 0xffff; i++)
					cpu.memory.writeAt(i, preCpu.memory.readAt(i));
			} catch (e) {
				throw new Error("Pre-code failed!");
			}
		}

		bytes.forEach((byte, i) => memory.writeAt(CODE_ADDRESS + i, byte));

		cpu.run = () => {
			const startTime = Date.now();

			while (true) {
				cpu.step();

				const lineNumber = instructions.find(
					(it) => this.CODE_ADDRESS + it.address === cpu.pc.value
				)?.lineNumber;

				if (!lineNumber) break;
				if (Date.now() - startTime > TIMEOUT)
					throw new Error("Execution timed out (infinite loop?)");
			}
		};

		return { instructions, bytes, cpu };
	},
};
