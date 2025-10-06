export default {
  getSaveState(neees) {
    return {
      cpu: neees.cpu.getSaveState?.() ?? {
        pc: neees.cpu.pc.getValue(),
        sp: neees.cpu.sp.getValue(),
        flags: neees.cpu.flags.getValue(),
        cycle: neees.cpu.cycle,
        a: neees.cpu.a.getValue(),
        x: neees.cpu.x.getValue(),
        y: neees.cpu.y.getValue(),
        memory: {
          ram: Array.from(neees.cpu.memory.ram),
          ppuRegisters: [
            neees.ppu.registers?.ppuCtrl.value,
            neees.ppu.registers?.ppuMask.value,
            neees.ppu.registers?.ppuStatus.value,
            neees.ppu.registers?.oamAddr.value,
            neees.ppu.registers?.oamData.value,
            neees.ppu.registers?.ppuScroll.value,
            neees.ppu.registers?.ppuAddr.value,
            neees.ppu.registers?.ppuData.value,
            neees.ppu.registers?.oamDma.value
          ],
          apuRegisters: [
            neees.apu.registers?.pulses[0].control.value,
            neees.apu.registers?.pulses[0].sweep.value,
            neees.apu.registers?.pulses[0].timerLow.value,
            neees.apu.registers?.pulses[0].timerHighLCL.value,
            neees.apu.registers?.pulses[1].control.value,
            neees.apu.registers?.pulses[1].sweep.value,
            neees.apu.registers?.pulses[1].timerLow.value,
            neees.apu.registers?.pulses[1].timerHighLCL.value,
            neees.apu.registers?.triangle.lengthControl.value,
            0,
            neees.apu.registers?.triangle.timerLow.value,
            neees.apu.registers?.triangle.timerHighLCL.value,
            neees.apu.registers?.noise.control.value,
            0,
            neees.apu.registers?.noise.form.value,
            neees.apu.registers?.noise.lcl.value,
            neees.apu.registers?.dmc.control.value,
            neees.apu.registers?.dmc.load.value,
            neees.apu.registers?.dmc.sampleAddress.value,
            neees.apu.registers?.dmc.sampleLength.value
          ],
          apuControl: neees.apu.registers?.apuControl.value,
          apuFrameCounter: neees.apu.registers?.apuFrameCounter.value
        }
      },
      ppu: neees.ppu.getSaveState?.() ?? {
        frame: neees.ppu.frame,
        scanline: neees.ppu.scanline,
        cycle: neees.ppu.cycle,
        memory: {
          vram: Array.from(neees.ppu.memory?.vram || []),
          paletteRam: Array.from(neees.ppu.memory?.paletteRam || []),
          oamRam: Array.from(neees.ppu.memory?.oamRam || []),
          mirroringId: neees.ppu.memory?.mirroringId
        },
        loopy: neees.ppu.loopy?.getSaveState()
      },
      apu: neees.apu.getSaveState?.() ?? {
        sampleCounter: neees.apu.sampleCounter,
        frameSequencerCounter: neees.apu.frameSequencer?.counter || 0,
        sample: neees.apu.sample,
        pulse1: this._getAPUPulse(neees, 0),
        pulse2: this._getAPUPulse(neees, 1),
        triangle: this._getAPUTriangle(neees),
        noise: this._getAPUNoise(neees),
        dmc: this._getAPUDMC(neees)
      },
      mapper: neees.context.mapper.getSaveState(),
      saveFile: neees.getSaveFile()
    };
  },
  setSaveState(neees, saveState) {
    // CPU
    if (neees.cpu.setSaveState == null) {
      neees.cpu.pc.setValue(saveState.cpu.pc);
      neees.cpu.sp.setValue(saveState.cpu.sp);
      neees.cpu.flags.setValue(saveState.cpu.flags);
      neees.cpu.cycle = saveState.cpu.cycle;
      neees.cpu.a.setValue(saveState.cpu.a);
      neees.cpu.x.setValue(saveState.cpu.x);
      neees.cpu.y.setValue(saveState.cpu.y);
      neees.cpu.memory.ram.set(saveState.cpu.memory.ram);
      [
        neees.ppu.registers?.ppuCtrl,
        neees.ppu.registers?.ppuMask,
        neees.ppu.registers?.ppuStatus,
        neees.ppu.registers?.oamAddr,
        neees.ppu.registers?.oamData,
        neees.ppu.registers?.ppuScroll,
        neees.ppu.registers?.ppuAddr,
        neees.ppu.registers?.ppuData,
        neees.ppu.registers?.oamDma
      ].forEach((register, i) => {
        register?.setValue(saveState.cpu.memory.ppuRegisters[i]);
      });
      [
        neees.apu.registers?.pulses[0].control,
        neees.apu.registers?.pulses[0].sweep,
        neees.apu.registers?.pulses[0].timerLow,
        neees.apu.registers?.pulses[0].timerHighLCL,
        neees.apu.registers?.pulses[1].control,
        neees.apu.registers?.pulses[1].sweep,
        neees.apu.registers?.pulses[1].timerLow,
        neees.apu.registers?.pulses[1].timerHighLCL,
        neees.apu.registers?.triangle.lengthControl,
        null,
        neees.apu.registers?.triangle.timerLow,
        neees.apu.registers?.triangle.timerHighLCL,
        neees.apu.registers?.noise.control,
        null,
        neees.apu.registers?.noise.form,
        neees.apu.registers?.noise.lcl,
        neees.apu.registers?.dmc.control,
        neees.apu.registers?.dmc.load,
        neees.apu.registers?.dmc.sampleAddress,
        neees.apu.registers?.dmc.sampleLength
      ].forEach((register, i) => {
        register?.setValue(saveState.cpu.memory.apuRegisters[i]);
      });
      neees.apu.registers?.apuControl?.setValue(
        saveState.cpu.memory.apuControl
      );
      neees.apu.registers?.apuFrameCounter?.setValue(
        saveState.cpu.memory.apuFrameCounter
      );
    } else {
      neees.cpu.setSaveState(saveState.cpu, neees);
    }

    // PPU
    if (neees.ppu.setSaveState == null) {
      neees.ppu.frame = saveState.ppu.frame;
      neees.ppu.scanline = saveState.ppu.scanline;
      neees.ppu.cycle = saveState.ppu.cycle;
      neees.ppu.memory?.vram?.set(saveState.ppu.memory.vram);
      neees.ppu.memory?.paletteRam?.set(saveState.ppu.memory.paletteRam);
      neees.ppu.memory?.oamRam?.set(saveState.ppu.memory.oamRam);
      if (saveState.ppu.memory.mirroringId != null)
        neees.ppu.memory?.changeNameTableMirroringTo?.(
          saveState.ppu.memory.mirroringId
        );
      if (saveState.ppu.loopy != null)
        neees.ppu.loopy?.setSaveState?.(saveState.ppu.loopy);
    } else {
      neees.ppu.setSaveState(saveState.ppu, neees);
    }

    // APU
    if (neees.apu.setSaveState == null) {
      neees.apu.sampleCounter = saveState.apu.sampleCounter;
      if (neees.apu.frameSequencer != null)
        neees.apu.frameSequencer.counter = saveState.apu.frameSequencerCounter;
      neees.apu.sample = saveState.apu.sample;
      this._setAPUPulse(neees, 0, "pulse1", saveState);
      this._setAPUPulse(neees, 1, "pulse2", saveState);
      if (saveState.apu.triangle != null)
        this._setAPUTriangle(neees, saveState);
      if (saveState.apu.noise != null) this._setAPUNoise(neees, saveState);
      if (saveState.apu.dmc != null) this._setAPUDMC(neees, saveState);
    } else {
      neees.apu.setSaveState(saveState.apu, neees);
    }

    // Mapper
    neees.context.mapper.setSaveState(saveState.mapper);
  },

  _getAPUPulse(neees, index) {
    const channel = neees.apu.channels?.pulses[index];
    if (!channel) return null;

    return {
      outputSample: channel.outputSample || 0,
      oscillator:
        channel.oscillator != null
          ? {
              frequency: channel.oscillator.frequency,
              dutyCycle: channel.oscillator.dutyCycle,
              volume: channel.oscillator.volume
            }
          : null,
      lengthCounter:
        channel.lengthCounter != null
          ? {
              counter: channel.lengthCounter.counter
            }
          : null,
      volumeEnvelope:
        channel.volumeEnvelope != null
          ? this._getAPUEnvelope(channel.volumeEnvelope)
          : null,
      frequencySweep:
        channel.frequencySweep != null
          ? {
              startFlag: channel.frequencySweep.startFlag,
              dividerCount: channel.frequencySweep.dividerCount,
              sweepDelta: channel.frequencySweep.sweepDelta,
              mute: channel.frequencySweep.mute
            }
          : null,
      timer: channel.timer || 0
    };
  },

  _setAPUPulse(neees, index, name, saveState) {
    const channel = neees.apu.channels?.pulses[index];
    const pulseState = saveState.apu[name];

    if (channel == null || pulseState == null) return;

    channel.outputSample = pulseState.outputSample;
    if (pulseState.oscillator != null && channel.oscillator != null) {
      channel.oscillator.frequency = pulseState.oscillator.frequency;
      channel.oscillator.dutyCycle = pulseState.oscillator.dutyCycle;
      channel.oscillator.volume = pulseState.oscillator.volume;
    }
    if (pulseState.lengthCounter != null && channel.lengthCounter != null)
      channel.lengthCounter.counter = pulseState.lengthCounter.counter;
    if (pulseState.volumeEnvelope != null && channel.volumeEnvelope != null)
      this._setAPUEnvelope(channel.volumeEnvelope, pulseState.volumeEnvelope);
    if (pulseState.frequencySweep != null && channel.frequencySweep != null) {
      channel.frequencySweep.startFlag = pulseState.frequencySweep.startFlag;
      channel.frequencySweep.dividerCount =
        pulseState.frequencySweep.dividerCount;
      channel.frequencySweep.sweepDelta = pulseState.frequencySweep.sweepDelta;
      channel.frequencySweep.mute = pulseState.frequencySweep.mute;
    }
    channel.timer = pulseState.timer;
  },

  _getAPUTriangle(neees) {
    const channel = neees.apu.channels?.triangle;
    if (!channel) return null;

    return {
      outputSample: channel.outputSample || 0,
      oscillator:
        channel.oscillator != null
          ? {
              frequency: channel.oscillator.frequency
            }
          : null,
      lengthCounter:
        channel.lengthCounter != null
          ? {
              counter: channel.lengthCounter.counter
            }
          : null,
      linearLengthCounter:
        channel.linearLengthCounter != null
          ? {
              counter: channel.linearLengthCounter.counter,
              reload: channel.linearLengthCounter.reload,
              reloadFlag: channel.linearLengthCounter.reloadFlag
            }
          : null
    };
  },

  _setAPUTriangle(neees, saveState) {
    const channel = neees.apu.channels?.triangle;
    const triangleState = saveState.apu.triangle;

    if (channel == null || triangleState == null) return;

    channel.outputSample = triangleState.outputSample;
    if (triangleState.oscillator != null && channel.oscillator != null)
      channel.oscillator.frequency = triangleState.oscillator.frequency;
    if (triangleState.lengthCounter != null && channel.lengthCounter != null)
      channel.lengthCounter.counter = triangleState.lengthCounter.counter;
    if (
      triangleState.linearLengthCounter != null &&
      channel.linearLengthCounter != null
    ) {
      channel.linearLengthCounter.counter =
        triangleState.linearLengthCounter.counter;
      channel.linearLengthCounter.reload =
        triangleState.linearLengthCounter.reload;
      channel.linearLengthCounter.reloadFlag =
        triangleState.linearLengthCounter.reloadFlag;
    }
  },

  _getAPUNoise(neees) {
    const channel = neees.apu.channels?.noise;
    if (!channel) return null;

    return {
      outputSample: channel.outputSample || 0,
      lengthCounter:
        channel.lengthCounter != null
          ? {
              counter: channel.lengthCounter.counter
            }
          : null,
      volumeEnvelope:
        channel.volumeEnvelope != null
          ? this._getAPUEnvelope(channel.volumeEnvelope)
          : null,
      shift: channel.shift || 1,
      dividerCount: channel.dividerCount || 0
    };
  },

  _setAPUNoise(neees, saveState) {
    const channel = neees.apu.channels?.noise;
    const noiseState = saveState.apu.noise;

    if (channel == null || noiseState == null) return;

    channel.outputSample = noiseState.outputSample;
    if (noiseState.lengthCounter != null && channel.lengthCounter != null)
      channel.lengthCounter.counter = noiseState.lengthCounter.counter;
    if (noiseState.volumeEnvelope != null && channel.volumeEnvelope != null)
      this._setAPUEnvelope(channel.volumeEnvelope, noiseState.volumeEnvelope);
    channel.shift = noiseState.shift;
    channel.dividerCount = noiseState.dividerCount;
  },

  _getAPUDMC(neees) {
    const channel = neees.apu.channels?.dmc;
    if (!channel) return null;

    return {
      outputSample: channel.outputSample || 0,
      startFlag: channel.dpcm?.startFlag || false,
      isActive: channel.dpcm?.isActive || false,
      buffer: channel.dpcm?.buffer,
      cursorByte: channel.dpcm?.cursorByte || 0,
      cursorBit: channel.dpcm?.cursorBit || 0,
      dividerPeriod: channel.dpcm?.dividerPeriod || 0,
      dividerCount: channel.dpcm?.dividerCount || 0,
      sampleAddress: channel.dpcm?.sampleAddress || 0,
      sampleLength: channel.dpcm?.sampleLength || 0
    };
  },

  _setAPUDMC(neees, saveState) {
    const channel = neees.apu.channels?.dmc;
    const dmcState = saveState.apu.dmc;

    if (channel == null || dmcState == null) return;

    channel.outputSample = dmcState.outputSample;
    if (channel.dpcm != null) {
      channel.dpcm.startFlag = dmcState.startFlag;
      channel.dpcm.isActive = dmcState.isActive;
      channel.dpcm.buffer = dmcState.buffer;
      channel.dpcm.cursorByte = dmcState.cursorByte;
      channel.dpcm.cursorBit = dmcState.cursorBit;
      channel.dpcm.dividerPeriod = dmcState.dividerPeriod;
      channel.dpcm.dividerCount = dmcState.dividerCount;
      channel.dpcm.sampleAddress = dmcState.sampleAddress;
      channel.dpcm.sampleLength = dmcState.sampleLength;
    }
  },

  _getAPUEnvelope(envelope) {
    return {
      startFlag: envelope.startFlag,
      dividerCount: envelope.dividerCount,
      volume: envelope.volume
    };
  },

  _setAPUEnvelope(envelope, envelopeState) {
    envelope.startFlag = envelopeState.startFlag;
    envelope.dividerCount = envelopeState.dividerCount;
    envelope.volume = envelopeState.volume;
  }
};
