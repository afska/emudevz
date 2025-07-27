const byte = {
	/** Converts `s8` to an unsigned byte (-2 => 254). */
	/** It also forces `s8` to fit in 8 bits (257 => 1). */
	toU8(s8) {
		return s8 & 0xff;
	},

	/** Converts `u8` to a signed byte (254 => -2). */
	toS8(u8) {
		return (u8 << 24) >> 24;
	},

	/** Forces a `value` to fit in 16 bits (65537 => 1). */
	toU16(value) {
		return value & 0xffff;
	},

	/** Returns whether `u8` can be represented as a single byte or not. */
	overflows(u8) {
		return u8 >= 256;
	},

	/** Returns whether `s8` is positive or not. */
	isPositive(s8) {
		return !((s8 >> 7) & 1);
	},

	/** Returns whether `s8` is negative or not. */
	isNegative(s8) {
		return !!((s8 >> 7) & 1);
	},

	/** Returns the bit located at `position` in `number`, as a boolean. */
	getFlag(number, position) {
		return !!this.getBit(number, position);
	},

	/** Returns the bit located at `position` in `number`. */
	getBit(number, position) {
		return (number >> position) & 1;
	},

	/** Returns an updated `u8`, with a `bit` changed to `value` (0 or 1). */
	setBit(u8, bit, value) {
		const mask = 1 << bit;
		return (u8 & ~mask) | ((value & 0b1) << bit);
	},

	/** Returns a sub-number of `size` bits inside `u8`, starting at `startPosition`. */
	getBits(u8, startPosition, size) {
		return (u8 >> startPosition) & (0xff >> (8 - size));
	},

	/**
	 * Inserts a `value` of `size` bits inside `u8`, starting at `startPosition`.
	 * Returns the updated number.
	 */
	setBits(u8, startPosition, size, value) {
		const mask = ((1 << size) - 1) << startPosition;
		return (u8 & ~mask) | ((value << startPosition) & mask);
	},

	/** Returns the most significant byte of `u16`. */
	highByteOf(u16) {
		return u16 >> 8;
	},

	/** Returns the least significant byte of `u16`. */
	lowByteOf(u16) {
		return u16 & 0xff;
	},

	/** Returns a 16-bit number from `highByte` and `lowByte`. */
	buildU16(highByte, lowByte) {
		return ((highByte & 0xff) << 8) | (lowByte & 0xff);
	},

	/** Returns the upper nybble of `u8`. */
	highNybbleOf(u8) {
		return u8 >> 4;
	},

	/** Returns the lower nybble of `u8`. */
	lowNybbleOf(u8) {
		return u8 & 0b1111;
	},

	/** Returns an 8-bit number from `highNybble` and `lowNybble`. */
	buildU8(highNybble, lowNybble) {
		return ((highNybble & 0b1111) << 4) | (lowNybble & 0b1111);
	},

	/** Returns an 8-bit number from `bit0`, `bit1`, `bit2`, etc. */
	bitfield(bit0, bit1, bit2, bit3, bit4, bit5, bit6, bit7) {
		return (
			((bit0 & 1) << 0) |
			((bit1 & 1) << 1) |
			((bit2 & 1) << 2) |
			((bit3 & 1) << 3) |
			((bit4 & 1) << 4) |
			((bit5 & 1) << 5) |
			((bit6 & 1) << 6) |
			((bit7 & 1) << 7)
		);
	},

	/** Returns a 2-bit number from `highBit` and `lowBit`. */
	buildU2(highBit, lowBit) {
		return (highBit << 1) | lowBit;
	},

	/** Returns a random byte ([1, `max`]). */
	random(max = 254) {
		return 1 + Math.floor(Math.random() * max);
	},
};

class InMemoryRegister {
	constructor() {
		this.value = 0;
		this._readOnlyFields = [];

		this.onLoad();
	}

	/** Called when instantiating the register. */
	onLoad() {}

	/** Called when the CPU reads the memory address. */
	onRead() {
		return 0;
	}

	/** Called when the CPU writes the memory address. */
	onWrite(value) {}

	/** Sets the value manually (updating internal accessors). */
	setValue(value) {
		this.value = byte.toU8(value);
		this._writeReadOnlyFields();
	}

	/** Adds a read-only field of `size` bits named `name`, starting at `startPosition`. */
	addField(name, startPosition, size = 1) {
		this._readOnlyFields.push({ name, startPosition, size });
		this[name] = 0;

		return this;
	}

	/** Adds a writable field of `size` bits named `name`, starting at `startPosition`. */
	addWritableField(name, startPosition, size = 1) {
		Object.defineProperty(this, name, {
			get() {
				return byte.getBits(this.value, startPosition, size);
			},
			set(value) {
				this.value = byte.toU8(
					byte.setBits(this.value, startPosition, size, value)
				);
			},
		});

		return this;
	}

	_writeReadOnlyFields() {
		for (let { name, startPosition, size } of this._readOnlyFields)
			this[name] = byte.getBits(this.value, startPosition, size);
	}

	static get PPU() {
		return class PPUInMemoryRegister extends InMemoryRegister {
			constructor(ppu) {
				super();

				this.ppu = ppu;
			}
		};
	}

	static get APU() {
		return class APUInMemoryRegister extends InMemoryRegister {
			constructor(apu, id) {
				super();

				this.apu = apu;
				this.id = id;
			}
		};
	}
}

class PulseControl extends InMemoryRegister.APU {
	onLoad() {
		this.addField("volumeOrEnvelopePeriod", 0, 4)
			.addField("constantVolume", 4)
			.addField("envelopeLoopOrLengthCounterHalt", 5)
			.addField("dutyCycleId", 6, 2);
	}

	onWrite(value) {
		this.setValue(value);
	}
}

class PulseSweep extends InMemoryRegister.APU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class PulseTimerLow extends InMemoryRegister.APU {
	onWrite(value) {
		this.setValue(value);

		const channel = this.apu.channels.pulses[this.id];
		channel.updateTimer();
	}
}

class PulseTimerHighLCL extends InMemoryRegister.APU {
	onLoad() {
		this.addField("timerHigh", 0, 3);
	}

	onWrite(value) {
		this.setValue(value);

		const channel = this.apu.channels.pulses[this.id];
		channel.updateTimer();
	}
}

class TriangleLengthControl extends InMemoryRegister.APU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class TriangleTimerLow extends InMemoryRegister.APU {
	onWrite(value) {
		this.setValue(value);
	}
}

class TriangleTimerHighLCL extends InMemoryRegister.APU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class NoiseControl extends InMemoryRegister.APU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class NoiseForm extends InMemoryRegister.APU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class NoiseLCL extends InMemoryRegister.APU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class DMCControl extends InMemoryRegister.APU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class DMCLoad extends InMemoryRegister.APU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class DMCSampleAddress extends InMemoryRegister.APU {
	onWrite(value) {
		this.setValue(value);
	}
}

class DMCSampleLength extends InMemoryRegister.APU {
	onWrite(value) {
		this.setValue(value);
	}
}

class APUStatus extends InMemoryRegister.APU {
	onRead() {
		/* TODO: IMPLEMENT */
	}
}

class APUControl extends InMemoryRegister.APU {
	onLoad() {
		this.addField("enablePulse1", 0)
			.addField("enablePulse2", 1)
			.addField("enableTriangle", 2)
			.addField("enableNoise", 3)
			.addField("enableDMC", 4);
	}

	onWrite(value) {
		this.setValue(value);
	}
}

class APUFrameCounter extends InMemoryRegister.APU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class AudioRegisters {
	constructor(apu) {
		this.pulses = [0, 1].map((id) => ({
			control: new PulseControl(apu), //                  $4000/$4004
			sweep: new PulseSweep(apu, id), //                  $4001/$4005
			timerLow: new PulseTimerLow(apu, id), //            $4002/$4006
			timerHighLCL: new PulseTimerHighLCL(apu, id), //     $4003/$4007
		}));

		this.triangle = {
			lengthControl: new TriangleLengthControl(apu), //           $4008
			timerLow: new TriangleTimerLow(apu), //             $400A
			timerHighLCL: new TriangleTimerHighLCL(apu), //      $400B
		};

		this.noise = {
			control: new NoiseControl(apu), //                  $400C
			form: new NoiseForm(apu), //                        $400E
			lcl: new NoiseLCL(apu), //                           $400F
		};

		this.dmc = {
			control: new DMCControl(apu), //                    $4010
			load: new DMCLoad(apu), //                          $4011
			sampleAddress: new DMCSampleAddress(apu), //        $4012
			sampleLength: new DMCSampleLength(apu), //           $4013
		};

		this.apuStatus = new APUStatus(apu); //               $4015 (read)
		this.apuControl = new APUControl(apu); //             $4015 (write)
		this.apuFrameCounter = new APUFrameCounter(apu); //   $4017
	}

	read(address) {
		if (address === 0x4015) return this.apuStatus.onRead();

		return this._getRegister(address)?.onRead();
	}

	write(address, value) {
		if (address === 0x4015) return this.apuControl.onWrite(value);

		this._getRegister(address)?.onWrite(value);
	}

	_getRegister(address) {
		switch (address) {
			case 0x4000:
				return this.pulses[0].control;
			case 0x4001:
				return this.pulses[0].sweep;
			case 0x4002:
				return this.pulses[0].timerLow;
			case 0x4003:
				return this.pulses[0].timerHighLCL;
			case 0x4004:
				return this.pulses[1].control;
			case 0x4005:
				return this.pulses[1].sweep;
			case 0x4006:
				return this.pulses[1].timerLow;
			case 0x4007:
				return this.pulses[1].timerHighLCL;
			case 0x4008:
				return this.triangle.lengthControl;
			case 0x400a:
				return this.triangle.timerLow;
			case 0x400b:
				return this.triangle.timerHighLCL;
			case 0x400c:
				return this.noise.control;
			case 0x400e:
				return this.noise.form;
			case 0x400f:
				return this.noise.lcl;
			case 0x4010:
				return this.dmc.control;
			case 0x4011:
				return this.dmc.load;
			case 0x4012:
				return this.dmc.sampleAddress;
			case 0x4013:
				return this.dmc.sampleLength;
			case 0x4017:
				return this.apuFrameCounter;
			default:
		}
	}
}

const APU_SAMPLE_RATE = 44100;
const DUTY_TABLE = [0.125, 0.25, 0.5, 0.75];

/** A pulse wave generator. */
class PulseOscillator {
	constructor() {
		this.frequency = 0;
		this.dutyCycle = 0; // (0~3)
		this.volume = 15; // (0~5)

		this._phase = 0; // (0~1)
	}

	/** Generates a new sample (0~15). */
	sample() {
		this._phase = (this._phase + this.frequency / APU_SAMPLE_RATE) % 1;

		return this._phase < DUTY_TABLE[this.dutyCycle] ? this.volume : 0;
	}
}

class PulseChannel {
	constructor(apu, id, enableFlagName) {
		this.apu = apu;

		this.id = id;
		this.enableFlagName = enableFlagName;

		this.timer = 0;
		this.registers = this.apu.registers.pulses[this.id];
		this.oscillator = new PulseOscillator();
	}

	sample() {
		this.oscillator.frequency = 1789773 / (16 * (this.timer + 1));
		this.oscillator.dutyCycle = this.registers.control.dutyCycleId;
		this.oscillator.volume = this.registers.control.volumeOrEnvelopePeriod;

		return this.oscillator.sample();
	}

	updateTimer() {
		this.timer = byte.buildU16(
			this.registers.timerHighLCL.timerHigh,
			this.registers.timerLow.value
		);
	}

	step() {
		this.updateTimer();
	}

	isEnabled() {
		return !!this.apu.registers.apuControl[this.enableFlagName];
	}
}

export default class APU {
	constructor(cpu) {
		this.cpu = cpu;

		this.sampleCounter = 0;
		this.sample = 0;

		this.registers = new AudioRegisters(this);
		this.channels = {
			pulses: [
				new PulseChannel(this, 0, "enablePulse1"),
				new PulseChannel(this, 1, "enablePulse2"),
			],
		};
	}

	step(onSample) {
		this.channels.pulses[0].step();
		this.channels.pulses[1].step();
		this.sampleCounter++;

		if (this.sampleCounter === 20) {
			this.sampleCounter = 0;

			const pulse1 = this.channels.pulses[0].sample();
			const pulse2 = this.channels.pulses[1].sample();
			this.sample = (pulse1 + pulse2) * 0.01;

			onSample(this.sample, pulse1, pulse2);
		}
	}
}
