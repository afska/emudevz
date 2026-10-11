# `InMemoryRegister`

📄 /lib/InMemoryRegister.js 📄

Этот класс упрощает реализацию регистров оборудования NEEES, отображённых в память.

## Использование

1. Создай класс для каждого регистра, отображённого в память. Для регистра PPU наследуй его от `InMemoryRegister.PPU`, для регистра APU — от `InMemoryRegister.APU`.
2. В методе `onLoad()` используй `addField(...)`/`addWritableField(...)`, чтобы задать _поля_, занимающие биты регистра (см. пример ниже).
3. Если 🧠 CPU может читать регистр, реализуй `onRead()`. Иначе чтение будет возвращать `0`.
4. Если 🧠 CPU может записывать в регистр, реализуй `onWrite(value)`. Иначе запись не будет иметь эффекта.

### Примеры

Примеры используют регистры 🖥️ PPU, но **регистры 🔊 APU работают так же**.

#### ✏️ Только запись

Игры заполняют регистры, доступные только для записи, через операции записи в память, которые выполняет 🧠 CPU. По адресу регистра игра задаёт значение, которое 🖥️ PPU затем читает для разных действий, например для изменения размера спрайта. Некоторые записи также сразу вызывают дополнительные эффекты.

```javascript
import InMemoryRegister from "/lib/InMemoryRegister";

class PPUCtrl extends InMemoryRegister.PPU {
  onLoad() {
    this.addField("nameTableId", 0, 2) //         биты 0–1
      .addField("vramAddressIncrement32", 2) //   бит 2
      .addField("sprite8x8PatternTableId", 3) //  бит 3
      .addField("backgroundPatternTableId", 4) // бит 4
      .addField("spriteSize", 5) //               бит 5
      .addField("generateNMIOnVBlank", 7); //     бит 7
  }

  // если onRead() не определён, чтение возвращает 0

  onWrite(value) {
    this.setValue(value); // этот вызов обновляет `this.value` и все поля

    // здесь можно запустить другие операции через `this.ppu`
  }
}

const ppuCtrl = new PPUCtrl(ppu);
ppuCtrl.onWrite(0b10010010);

ppuCtrl.onRead(); //                 => 0
ppuCtrl.value; //                    => 146
ppuCtrl.nameTableId; //              => 2
ppuCtrl.vramAddressIncrement32; //   => 0
ppuCtrl.sprite8x8PatternTableId; //  => 0
ppuCtrl.backgroundPatternTableId; // => 1
ppuCtrl.spriteSize; //               => 0
ppuCtrl.generateNMIOnVBlank; //      => 1
```

#### 🔍 Только чтение

Регистры, доступные только для чтения, заполняет 🖥️ PPU. Игры узнают их состояние через операции чтения памяти, которые выполняет 🧠 CPU. Некоторые чтения также сразу вызывают дополнительные эффекты.

```javascript
import InMemoryRegister from "/lib/InMemoryRegister";

class PPUStatus extends InMemoryRegister.PPU {
  onLoad() {
    this.addWritableField("spriteOverflow", 5) //    бит 5
      .addWritableField("sprite0Hit", 6) //          бит 6
      .addWritableField("isInVBlankInterval", 7); // бит 7

    this.setValue(0b10000000); // здесь можно задать начальное состояние!
  }

  onRead(value) {
    return this.value; // значение меняется в зависимости от полей, доступных для записи
  }

  // если onWrite(...) не определён, запись не имеет эффекта
}

const ppuStatus = new PPUStatus(ppu);
ppuStatus.onRead(); // 0b10000000

ppuStatus.isInVBlankInterval = 0;
ppuStatus.onRead(); // 0b00000000

ppuStatus.isInVBlankInterval = 1;
ppuStatus.spriteOverflow = 1;
ppuStatus.onRead(); // 0b10100000

ppuStatus.sprite0Hit = 1;
ppuStatus.onRead(); // 0b11100000
```
