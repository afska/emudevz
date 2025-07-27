import InMemoryRegister from "/lib/InMemoryRegister";

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
    /* TODO: IMPLEMENT */
  }
}

class PulseTimerHighLCL extends InMemoryRegister.APU {
  onLoad() {
    /* TODO: IMPLEMENT */
  }

  onWrite(value) {
    /* TODO: IMPLEMENT */
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

export default class AudioRegisters {
  constructor(apu) {
    this.pulses = [0, 1].map((id) => ({
      control: new PulseControl(apu), //                  $4000/$4004
      sweep: new PulseSweep(apu, id), //                  $4001/$4005
      timerLow: new PulseTimerLow(apu, id), //            $4002/$4006
      timerHighLCL: new PulseTimerHighLCL(apu, id) //     $4003/$4007
    }));

    this.triangle = {
      lengthControl: new TriangleLengthControl(apu), //           $4008
      timerLow: new TriangleTimerLow(apu), //             $400A
      timerHighLCL: new TriangleTimerHighLCL(apu) //      $400B
    };

    this.noise = {
      control: new NoiseControl(apu), //                  $400C
      form: new NoiseForm(apu), //                        $400E
      lcl: new NoiseLCL(apu) //                           $400F
    };

    this.dmc = {
      control: new DMCControl(apu), //                    $4010
      load: new DMCLoad(apu), //                          $4011
      sampleAddress: new DMCSampleAddress(apu), //        $4012
      sampleLength: new DMCSampleLength(apu) //           $4013
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
