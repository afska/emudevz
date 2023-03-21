import _ from "lodash";
import byte from "../byte";

export const getIndirectAddress = (cpu, address) => {
	const start = byte.toU8(address);
	const end = byte.toU8(start + 1);
	const low = cpu.memory.read(start);
	const high = cpu.memory.read(end);

	return byte.buildU16(high, low);
};

const hex = (value, length) =>
	_.padStart(value.toString(16).toUpperCase(), length, "0");

export default class NESTestLogger {
	constructor() {
		this.lastLog = null;
	}

	log(cpu, originalPC, operation, input, argument) {
		const memory = cpu.memory;

		const section = (string, length) =>
			_.padEnd(string.substr(0, length), length);
		const hexArgument = (value) => {
			if (operation.addressingMode.inputSize === 0) return "";

			return operation.addressingMode.inputSize === 2
				? hex(value, 4)
				: hex(value, 2);
		};
		const formatParameter = () => {
			const instructionsWithValue = [
				"STA",
				"STX",
				"STY",
				"LDA",
				"LDX",
				"LDY",
				"BIT",
				"ORA",
				"AND",
				"EOR",
				"ADC",
				"SBC",
				"CMP",
				"CPX",
				"CPY",
				"LSR",
				"ASL",
				"ROR",
				"ROL",
				"INC",
				"DEC",
			];

			const $input = hexArgument(input, 2);
			const $argument = hexArgument(argument, 2);
			let finalAddress = null;

			try {
				finalAddress = operation.addressingMode.getAddress(cpu, input);
			} catch (e) {}

			switch (operation.addressingMode.id) {
				case "IMPLICIT":
					if (operation.instruction.id.endsWith("a")) return "A";
					else return "";
				case "IMMEDIATE":
					return `#$${$argument}`;
				case "ABSOLUTE":
					let $address = `$${$input}`;
					if (
						_.includes(
							instructionsWithValue,
							operation.instruction.id.slice(0, 3)
						)
					)
						$address += ` = ${hex(memory.read(finalAddress), 2)}`;
					return $address;
				case "ZERO_PAGE":
					return `$${$input} = ${hex(memory.read(finalAddress), 2)}`;
				case "INDEXED_ABSOLUTE_X":
				case "INDEXED_ZERO_PAGE_X":
					return `$${$input},X @ ${hexArgument(finalAddress)} = ${hex(
						memory.read(finalAddress),
						2
					)}`;
				case "INDEXED_ABSOLUTE_Y":
				case "INDEXED_ZERO_PAGE_Y":
					return `$${$input},Y @ ${hexArgument(finalAddress)} = ${hex(
						memory.read(finalAddress),
						2
					)}`;
				case "INDIRECT":
					return `($${$input}) = ${hex(finalAddress, 4)}`;
				case "INDEXED_INDIRECT":
					return `($${$input},X) @ ${hex(
						byte.toU8(input + cpu.x.getValue()),
						2
					)} = ${hex(finalAddress, 4)} = ${hex(memory.read(finalAddress), 2)}`;
				case "INDIRECT_INDEXED":
					return `($${$input}),Y = ${hex(
						getIndirectAddress(cpu, input),
						4
					)} @ ${hex(finalAddress, 4)} = ${hex(memory.read(finalAddress), 2)}`;
				default:
					return `$${$argument}`;
			}
		};

		const $counter = section(hex(originalPC, 4), 6);

		const $operation = hex(operation.id, 2);
		let $arguments = " ";
		if (operation.addressingMode.inputSize > 0) {
			$arguments +=
				operation.addressingMode.inputSize === 2
					? hex(byte.lowByteOf(input), 2) + " " + hex(byte.highByteOf(input), 2)
					: hex(input, 2);
		}
		const $commandHex = section($operation + $arguments, 10);

		const $assembly = section(
			operation.instruction.id.slice(0, 3) + " " + formatParameter(),
			32
		);

		const $registers =
			["a", "x", "y"]
				.map((register) => {
					return (
						register.toUpperCase() + ":" + hex(cpu[register].getValue(), 2)
					);
				})
				.join(" ") +
			" P:" +
			hex(cpu.flags.getValue(), 2) +
			" SP:" +
			hex(cpu.sp.getValue(), 2);

		const $cpuCycle = "CYC:" + cpu.cycle;
		const $status = `${$registers} ${$cpuCycle}`;

		this.lastLog = $counter + $commandHex + $assembly + $status;
	}
}
