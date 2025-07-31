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
		this.addField("shiftCount", 0, 3)
			.addField("negateFlag", 3)
			.addField("dividerPeriodMinusOne", 4, 3)
			.addField("enabledFlag", 7);
	}

	onWrite(value) {
		this.setValue(value);

		const channel = this.apu.channels.pulses[this.id];
		channel.frequencySweep.startFlag = true;
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
		this.addField("timerHigh", 0, 3).addField("lengthCounterLoad", 3, 5);
	}

	onWrite(value) {
		this.setValue(value);

		const channel = this.apu.channels.pulses[this.id];
		channel.lengthCounter.counter = noteLengths[this.lengthCounterLoad];
		channel.volumeEnvelope.startFlag = true;
		channel.updateTimer();
	}
}

class TriangleLengthControl extends InMemoryRegister.APU {
	onLoad() {
		this.addField("linearCounterReload", 0, 7).addField("halt", 7);
	}

	onWrite(value) {
		this.setValue(value);

		const channel = this.apu.channels.triangle;
		channel.linearLengthCounter.reload = this.linearCounterReload;
	}
}

class TriangleTimerLow extends InMemoryRegister.APU {
	onWrite(value) {
		this.setValue(value);
	}
}

class TriangleTimerHighLCL extends InMemoryRegister.APU {
	onLoad() {
		this.addField("timerHigh", 0, 3).addField("lengthCounterLoad", 3, 5);
	}

	onWrite(value) {
		this.setValue(value);

		const channel = this.apu.channels.triangle;
		channel.lengthCounter.counter = noteLengths[this.lengthCounterLoad];
		channel.linearLengthCounter.reloadFlag = true;
	}
}

class NoiseControl extends InMemoryRegister.APU {
	onLoad() {
		this.addField("volumeOrEnvelopePeriod", 0, 4)
			.addField("constantVolume", 4)
			.addField("envelopeLoopOrLengthCounterHalt", 5);
	}

	onWrite(value) {
		this.setValue(value);
	}
}

class NoiseForm extends InMemoryRegister.APU {
	onLoad() {
		this.addField("periodId", 0, 4).addField("mode", 7);
	}

	onWrite(value) {
		this.setValue(value);
	}
}

class NoiseLCL extends InMemoryRegister.APU {
	onLoad() {
		this.addField("lengthCounterLoad", 3, 5);
	}

	onWrite(value) {
		this.setValue(value);

		const channel = this.apu.channels.noise;
		channel.lengthCounter.counter = noteLengths[this.lengthCounterLoad];
		channel.volumeEnvelope.startFlag = true;
	}
}

class DMCControl extends InMemoryRegister.APU {
	onLoad() {
		this.addField("dpcmPeriodId", 0, 4).addField("loop", 6);
	}

	onWrite(value) {
		this.setValue(value);
	}
}

class DMCLoad extends InMemoryRegister.APU {
	onLoad() {
		this.addField("directLoad", 0, 7);
	}

	onWrite(value) {
		this.setValue(value);

		this.apu.channels.dmc.outputSample = this.directLoad;
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

		if (!this.enablePulse1) this.apu.channels.pulses[0].lengthCounter.reset();
		if (!this.enablePulse2) this.apu.channels.pulses[1].lengthCounter.reset();
		if (!this.enableTriangle) {
			this.apu.channels.triangle.lengthCounter.reset();
			this.apu.channels.triangle.linearLengthCounter.fullReset();
		}
		if (!this.enableNoise) this.apu.channels.noise.lengthCounter.reset();
		if (!this.enableDMC) this.apu.channels.dmc.dpcm.stop();
		else if (this.apu.channels.dmc.dpcm.remainingBytes() === 0)
			this.apu.channels.dmc.dpcm.start();
	}
}

class APUFrameCounter extends InMemoryRegister.APU {
	onLoad() {
		this.addField("use5StepSequencer", 7);
	}

	onWrite(value) {
		this.setValue(value);

		this.apu.frameSequencer.reset();
		this.apu.onQuarterFrameClock();
		this.apu.onHalfFrameClock();
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

const QUARTERS_4_STEP = [3729, 7457, 11186, 14916];
const QUARTERS_5_STEP = [3729, 7457, 11186, 18641];

class FrameSequencer {
	constructor(apu) {
		this.apu = apu;
		this.reset();
	}

	reset() {
		this.counter = 0;
	}

	step() {
		this.counter++;

		const use5StepSequencer = this.apu.registers.apuFrameCounter
			.use5StepSequencer;

		const quarters = use5StepSequencer ? QUARTERS_5_STEP : QUARTERS_4_STEP;
		const isQuarter =
			this.counter === quarters[0] ||
			this.counter === quarters[1] ||
			this.counter === quarters[2] ||
			this.counter === quarters[3];
		const isHalf = this.counter === quarters[1] || this.counter === quarters[3];
		const isEnd = this.counter === quarters[3];

		if (isQuarter) this.apu.onQuarterFrameClock();
		if (isHalf) this.apu.onHalfFrameClock();

		if (isEnd) this.reset();
	}
}

const noteLengths = [
	10,
	254,
	20,
	2,
	40,
	4,
	80,
	6,
	160,
	8,
	60,
	10,
	14,
	12,
	26,
	14,
	12,
	16,
	24,
	18,
	48,
	20,
	96,
	22,
	192,
	24,
	72,
	26,
	16,
	28,
	32,
	30,
];

class LengthCounter {
	constructor() {
		this.counter = 0;
	}

	reset() {
		this.counter = 0;
	}

	isActive() {
		return this.counter > 0;
	}

	clock(isEnabled, isHalted) {
		if (!isEnabled) {
			this.reset();
		} else if (this.isActive() && !isHalted) {
			this.counter--;
		}
	}
}

class VolumeEnvelope {
	constructor() {
		// input
		this.startFlag = false;

		// output
		this.dividerCount = 0;
		this.volume = 0;
	}

	clock(period, loop) {
		// start if needed
		if (this.startFlag) {
			this.startFlag = false;
			this.volume = 15;
			this.dividerCount = period;
			return;
		}

		// wait until dividerCount == 0
		if (this.dividerCount > 0) {
			this.dividerCount--;
			return;
		}

		// change volume
		this.dividerCount = period;
		if (this.volume === 0) {
			if (loop) this.volume = 15;
		} else {
			this.volume--;
		}
	}
}

class FrequencySweep {
	constructor(channel) {
		this.channel = channel;

		// input
		this.startFlag = false;

		// output
		this.dividerCount = 0;
		this.mute = 0;
	}

	clock() {
		const register = this.channel.registers.sweep;

		if (
			register.enabledFlag &&
			register.shiftCount > 0 &&
			this.dividerCount === 0 &&
			!this.mute
		) {
			const sweepDelta = this.channel.timer >> register.shiftCount;
			this.channel.timer += sweepDelta * (register.negateFlag ? -1 : 1);
		}

		if (this.dividerCount === 0 || this.startFlag) {
			this.dividerCount = register.dividerPeriodMinusOne + 1;
			this.startFlag = false;
		} else this.dividerCount--;
	}

	muteIfNeeded() {
		this.mute = this.channel.timer < 8 || this.channel.timer > 0x7ff;
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
		this.lengthCounter = new LengthCounter();
		this.volumeEnvelope = new VolumeEnvelope();
		this.frequencySweep = new FrequencySweep(this);
	}

	sample() {
		if (
			!this.isEnabled() ||
			!this.lengthCounter.isActive() ||
			this.frequencySweep.mute
		)
			return this.outputSample || 0;

		this.oscillator.frequency = 1789773 / (16 * (this.timer + 1));
		this.oscillator.dutyCycle = this.registers.control.dutyCycleId;
		this.oscillator.volume = this.registers.control.constantVolume
			? this.registers.control.volumeOrEnvelopePeriod
			: this.volumeEnvelope.volume;

		this.outputSample = this.oscillator.sample();

		return this.outputSample;
	}

	updateTimer() {
		this.timer = byte.buildU16(
			this.registers.timerHighLCL.timerHigh,
			this.registers.timerLow.value
		);
	}

	step() {
		this.frequencySweep.muteIfNeeded();
		if (!this.registers.sweep.enabledFlag) this.updateTimer();
	}

	isEnabled() {
		return !!this.apu.registers.apuControl[this.enableFlagName];
	}

	quarterFrame() {
		this.volumeEnvelope.clock(
			this.registers.control.volumeOrEnvelopePeriod,
			this.registers.control.envelopeLoopOrLengthCounterHalt
		);
	}

	halfFrame() {
		this.lengthCounter.clock(
			this.isEnabled(),
			this.registers.control.envelopeLoopOrLengthCounterHalt
		);
		this.frequencySweep.clock();
	}
}

const TRIANGLE_SEQUENCE = [
	15,
	14,
	13,
	12,
	11,
	10,
	9,
	8,
	7,
	6,
	5,
	4,
	3,
	2,
	1,
	0,
	0,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
];

/** A triangle wave generator. */
class TriangleOscillator {
	constructor() {
		this.frequency = 0;

		this._phase = 0; // (0~1)
	}

	/** Generates a new sample (0~15). */
	sample() {
		this._phase = (this._phase + this.frequency / APU_SAMPLE_RATE) % 1;
		const step = Math.floor(this._phase * TRIANGLE_SEQUENCE.length);

		return TRIANGLE_SEQUENCE[step];
	}
}

class LinearLengthCounter extends LengthCounter {
	constructor() {
		super();

		this.reload = 0;
		this.reloadFlag = false;
	}

	fullReset() {
		this.reset();
		this.reload = 0;
		this.reloadFlag = false;
	}

	clock(isEnabled, isHalted) {
		if (!isEnabled) {
			this.reset();
			return;
		}

		if (this.reloadFlag) this.counter = this.reload;
		else super.clock(isEnabled, isHalted);

		if (!isHalted) this.reloadFlag = false;
	}
}

class TriangleChannel {
	constructor(apu) {
		this.apu = apu;
		this.registers = this.apu.registers.triangle;
		this.oscillator = new TriangleOscillator();
		this.lengthCounter = new LengthCounter();
		this.linearLengthCounter = new LinearLengthCounter();
	}

	sample() {
		if (
			!this.isEnabled() ||
			!this.lengthCounter.isActive() ||
			!this.linearLengthCounter.isActive()
		)
			return this.outputSample || 0;

		const timer = byte.buildU16(
			this.registers.timerHighLCL.timerHigh,
			this.registers.timerLow.value
		);

		if (timer < 2 || timer > 0x7ff) return 0;

		this.oscillator.frequency = 1789773 / (16 * (timer + 1)) / 2;

		this.outputSample = this.oscillator.sample();

		return this.outputSample;
	}

	quarterFrame() {
		this.linearLengthCounter.clock(
			this.isEnabled(),
			this.registers.lengthControl.halt
		);
	}

	halfFrame() {
		this.lengthCounter.clock(
			this.isEnabled(),
			this.registers.lengthControl.halt
		);
	}

	isEnabled() {
		return !!this.apu.registers.apuControl.enableTriangle;
	}
}

const noisePeriods = [
	2,
	4,
	8,
	16,
	32,
	48,
	64,
	80,
	101,
	127,
	190,
	254,
	381,
	508,
	1017,
	2034,
];

class NoiseChannel {
	constructor(apu) {
		this.apu = apu;

		this.registers = this.apu.registers.noise;

		this.lengthCounter = new LengthCounter();
		this.volumeEnvelope = new VolumeEnvelope();

		this.shift = 0b1; // (the shift register is 15 bits wide)
		this.dividerCount = 0;
	}

	sample() {
		if (
			!this.isEnabled() ||
			!this.lengthCounter.isActive() ||
			byte.getBit(this.shift, 0)
		)
			return 0;

		return this.registers.control.constantVolume
			? this.registers.control.volumeOrEnvelopePeriod
			: this.volumeEnvelope.volume;
	}

	step() {
		this.dividerCount++;
		if (this.dividerCount >= noisePeriods[this.registers.form.periodId])
			this.dividerCount = 0;
		else return;

		const bitPosition = this.registers.form.mode ? 6 : 1;

		const bit = byte.getBit(this.shift, bitPosition);
		const feedback = byte.getBit(this.shift, 0) ^ bit;

		this.shift = (this.shift >> 1) | (feedback << 14);
	}

	quarterFrame() {
		this.volumeEnvelope.clock(
			this.registers.control.volumeOrEnvelopePeriod,
			this.registers.control.envelopeLoopOrLengthCounterHalt
		);
	}

	halfFrame() {
		this.lengthCounter.clock(
			this.isEnabled(),
			this.registers.control.envelopeLoopOrLengthCounterHalt
		);
	}

	isEnabled() {
		return this.apu.registers.apuControl.enableNoise;
	}
}

/**
 * DPCM (Δ-Modulation) channel handler.
 * Manages sample playback: fetching bits, looping, and outputting variations.
 */
class DPCM {
	constructor(dmcChannel) {
		this.dmcChannel = dmcChannel;

		this.startFlag = false;
		this.isActive = false;
		this.buffer = null;
		this.cursorByte = 0;
		this.cursorBit = 0;
		this.dividerPeriod = 0;
		this.dividerCount = 0;
		this.sampleAddress = 0;
		this.sampleLength = 0;
	}

	/**
	 * Called each APU cycle to handle DPCM timing, sample fetching,
	 * bit processing, output variation, and looping.
	 */
	update() {
		if (this.startFlag) {
			const dividerPeriod = dpcmPeriods[this.registers.control.dpcmPeriodId];

			this.startFlag = false;
			this.isActive = true;
			this.cursorByte = -1;
			this.cursorBit = 0;
			this.dividerPeriod = dividerPeriod;
			this.dividerCount = dividerPeriod - 1;

			// sample address = %11AAAAAA.AA000000 = $C000 + (A * 64)
			this.sampleAddress = 0xc000 + this.registers.sampleAddress.value * 64;
			// sample length = %LLLL.LLLL0001 = (L * 16) + 1 bytes
			this.sampleLength = this.registers.sampleLength.value * 16 + 1;

			this.dmcChannel.outputSample = 0;
		}

		if (!this.isActive) return;

		this.dividerCount++;
		if (this.dividerCount >= this.dividerPeriod) this.dividerCount = 0;
		else return;

		const hasSampleFinished = this.cursorByte === this.sampleLength;
		const hasByteFinished = this.cursorBit === 8;

		if (this.buffer === null || hasByteFinished) {
			this.cursorByte++;
			this.cursorBit = 0;

			if (hasSampleFinished) {
				this.isActive = false;
				this.buffer = null;
				this.dmcChannel.outputSample = 0;
				return;
			}

			let address = this.sampleAddress + this.cursorByte;
			if (address > 0xffff) {
				// (if it exceeds $FFFF, it is wrapped around to $8000)
				address = 0x8000 + (address % 0xffff);
			}
			this.buffer = this.cpu.memory.read(address);
		}

		const variation = byte.getBit(this.buffer, this.cursorBit) ? 1 : -1;
		this.dmcChannel.outputSample += variation;

		this.cursorBit++;
		if (hasSampleFinished && hasByteFinished && this.registers.control.loop)
			this.start();
	}

	/**
	 * Sets the startFlag so playback begins on next update.
	 */
	start() {
		this.startFlag = true;
	}

	/**
	 * Stops playback immediately by moving cursor to sample end.
	 */
	stop() {
		this.cursorByte = this.sampleLength;
	}

	/**
	 * Returns remaining bytes in sample, or 0 if inactive.
	 */
	remainingBytes() {
		if (!this.isActive) return 0;

		return this.sampleLength - this.cursorByte;
	}

	get cpu() {
		return this.dmcChannel.cpu;
	}

	get registers() {
		return this.dmcChannel.registers;
	}
}

/**
 * A list of all DPCM periods. The `DMCControl` register points to this table.
 */
const dpcmPeriods = [
	214,
	190,
	170,
	160,
	143,
	127,
	113,
	107,
	95,
	80,
	71,
	64,
	53,
	42,
	36,
	27,
];

class DMCChannel {
	constructor(apu, cpu) {
		this.apu = apu;
		this.cpu = cpu;

		this.registers = this.apu.registers.dmc;

		this.outputSample = 0;
		this.dpcm = new DPCM(this);
	}

	sample() {
		return this.outputSample;
	}

	step() {
		this.dpcm.update();
	}
}

export default class APU {
	constructor(cpu) {
		this.cpu = cpu;

		this.sampleCounter = 0;
		this.sample = 0;

		this.registers = new AudioRegisters(this);
		this.frameSequencer = new FrameSequencer(this);
		this.channels = {
			pulses: [
				new PulseChannel(this, 0, "enablePulse1"),
				new PulseChannel(this, 1, "enablePulse2"),
			],
			triangle: new TriangleChannel(this),
			noise: new NoiseChannel(this),
			dmc: new DMCChannel(this, this.cpu),
		};
	}

	step(onSample) {
		this.channels.pulses[0].step();
		this.channels.pulses[1].step();
		this.channels.noise.step();
		this.channels.dmc.step();
		this.sampleCounter++;
		this.frameSequencer.step();

		if (this.sampleCounter === 20) {
			this.sampleCounter = 0;

			const pulse1 = this.channels.pulses[0].sample();
			const pulse2 = this.channels.pulses[1].sample();
			const triangle = this.channels.triangle.sample();
			const noise = this.channels.noise.sample();
			const dmc = this.channels.dmc.sample();
			this.sample = (pulse1 + pulse2 + triangle + noise + dmc) * 0.01;

			onSample(this.sample, pulse1, pulse2, triangle, noise, dmc);
		}
	}

	onQuarterFrameClock() {
		this.channels.pulses[0].quarterFrame();
		this.channels.pulses[1].quarterFrame();
		this.channels.triangle.quarterFrame();
		this.channels.noise.quarterFrame();
	}

	onHalfFrameClock() {
		this.channels.pulses[0].halfFrame();
		this.channels.pulses[1].halfFrame();
		this.channels.triangle.halfFrame();
		this.channels.noise.halfFrame();
	}
}
