# `InMemoryRegister`

`📄 /lib/InMemoryRegister.js`

This class facilitates implementing the memory-mapped registers used by NEEES hardware.

## Usage

- Create a class for each memory-mapped register extending from `InMemoryRegister.{UnitName}`. For example, to create a PPU register, extend from `InMemoryRegister.PPU`. For an APU register, extend from `InMemoryRegister.APU`.
- In the `onLoad()` method, use `addField(...)`/`addWritableField(...)` to add _subfields_ that live inside the register bits (see example below).
- If the register can be read by the 🧠 CPU, implement `onRead()`. Otherwise, reads will return `0`. A typical implementation will look like this:

```javascript
onRead() {
	return this.value; // `this.value` holds the last value written to the register
}
```

- If the register can be written by the 🧠 CPU, implement `onWrite(value)`. Otherwise, writes will have no effect. A typical implementation will look like this:

```javascript
onWrite(value) {
	this.setValue(value); // this sets `this.value` and updates all the subfields
}
```

### Example

```javascript
class PPUCtrl extends InMemoryRegister.PPU {
	onLoad() {
		this.addField("nameTableId", 0, 2)
			.addField("vramAddressIncrement32", 2)
			.addField("sprite8x8PatternTableId", 3)
			.addField("backgroundPatternTableId", 4)
			.addField("spriteSize", 5)
			.addField("generateNMIOnVBlank", 7);
	}

	onWrite(value) {
		this.setValue(value);
	}
}
```
