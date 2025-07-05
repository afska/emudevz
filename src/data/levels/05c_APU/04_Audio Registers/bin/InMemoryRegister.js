import byte from "./byte";

/** An 8-bit register with multiple status flags and values mapped to memory. */
export default class InMemoryRegister {
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
  onWrite(value) { }

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
      }
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
