# `InMemoryRegister`

`📄 /lib/InMemoryRegister.js`

This class facilitates implementing the memory-mapped registers used by NEEES hardware.

## Usage

1. Create a class for each memory-mapped register extending from `InMemoryRegister.{UnitName}`. For example, to create a PPU register, extend from `InMemoryRegister.PPU`. For an APU register, extend from `InMemoryRegister.APU`.
2. In the `onLoad()` method, use `addField(...)`/`addWritableField(...)` to add _fields_ that live inside the register bits (see example below).
3. If the register can be read by the 🧠 CPU, implement `onRead()`. Otherwise, reads will return `0`.
4. If the register can be written by the 🧠 CPU, implement `onWrite(value)`. Otherwise, writes will have no effect.

### Examples

The examples are based on 🖥️ PPU registers, but 🔊 APU registers work the same way.

#### ✏️ Write-only

Write-only registers are filled by the games through memory writes executed by the 🧠 CPU. By writing to their memory address, games set a value that the 🖥️ PPU can query later to perform different actions, like changing the sprite size. Some writes can trigger immediate effects too.

```javascript
class PPUCtrl extends InMemoryRegister.PPU {
	onLoad() {
		this.addField("nameTableId", 0, 2) //           bits 0-1
			.addField("vramAddressIncrement32", 2) //   bit 2
			.addField("sprite8x8PatternTableId", 3) //  bit 3
			.addField("backgroundPatternTableId", 4) // bit 4
			.addField("spriteSize", 5) //               bit 5
			.addField("generateNMIOnVBlank", 7); //     bit 7
	}

	// when onRead() is not defined, reads return 0

	onWrite(value) {
		this.setValue(value); // this updates this.value and all the fields

		// you can trigger other operations here with `this.ppu`
	}
}

const ppuCtrl = new PPUCtrl(ppu);
ppuCtrl.onWrite(0b10010010);

ppuCtrl.onRead(); //                 => 0
ppuCtrl.nameTableId; //              => 2
ppuCtrl.vramAddressIncrement32; //   => 0
ppuCtrl.sprite8x8PatternTableId; //  => 0
ppuCtrl.backgroundPatternTableId; // => 1
ppuCtrl.spriteSize; //               => 0
ppuCtrl.generateNMIOnVBlank; //      => 1
```

#### 🔍 Read-only

Read-only registers are filled by the 🖥️ PPU. Games can read their state through memory reads executed by the 🧠 CPU.

```javascript
class PPUStatus extends InMemoryRegister.PPU {
	onLoad() {
		this.addWritableField("spriteOverflow", 5) //      bit 5
			.addWritableField("sprite0Hit", 6) //          bit 6
			.addWritableField("isInVBlankInterval", 7); // bit 7

		this.setValue(0b10000000); // you can set an initial state here!
	}

	onRead(value) {
		return this.value; // this will change based on the writable fields
	}

	// when onWrite(...) is not defined, writes will have no effect
}

const ppuStatus = new PPUStatus(ppu);
ppuStatus.onRead(); // 0b0b10000000

ppuStatus.isInVBlankInterval = 0;
ppuStatus.onRead(); // 0b0b00000000

ppuStatus.isInVBlankInterval = 1;
ppuStatus.spriteOverflow = 1;
ppuStatus.onRead(); // 0b0b10100000

ppuStatus.sprite0Hit = 1;
ppuStatus.onRead(); // 0b0b11100000
```
