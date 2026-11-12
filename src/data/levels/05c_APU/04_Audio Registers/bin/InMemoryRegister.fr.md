# `InMemoryRegister`

📄 /lib/InMemoryRegister.js 📄

Cette classe facilite l'implémentation des registres mappés en mémoire utilisés par le hardware NEEES.

## Utilisation

1. Crée une classe pour chaque registre mappé en mémoire. Pour créer un registre PPU, étend `InMemoryRegister.PPU`. Pour un registre APU, étend `InMemoryRegister.APU`.
2. Dans la méthode `onLoad()`, utilise `addField(...)`/`addWritableField(...)` pour définir les _champs_ qui résident dans les bits du registre (voir exemple ci-dessous).
3. Si le registre peut être lu par le 🧠 CPU, implémente `onRead()`. Sinon, les lectures retourneront `0`.
4. Si le registre peut être écrit par le 🧠 CPU, implémente `onWrite(value)`. Sinon, les écritures n'auront aucun effet.

### Exemples

Les exemples sont basés sur les registres 🖥️ PPU, mais **les registres 🔊 APU fonctionnent de la même façon**.

#### ✏️ En écriture seule

Les registres en écriture seule sont remplis par les jeux via des écritures mémoire exécutées par le 🧠 CPU. En écrivant à leur adresse mémoire, les jeux définissent une valeur que la 🖥️ PPU peut interroger plus tard pour effectuer différentes actions, comme changer la taille des sprites. Certaines écritures peuvent aussi déclencher des effets immédiats.

```javascript
import InMemoryRegister from "/lib/InMemoryRegister";

class PPUCtrl extends InMemoryRegister.PPU {
  onLoad() {
    this.addField("nameTableId", 0, 2) //         bits 0-1
      .addField("vramAddressIncrement32", 2) //   bit 2
      .addField("sprite8x8PatternTableId", 3) //  bit 3
      .addField("backgroundPatternTableId", 4) // bit 4
      .addField("spriteSize", 5) //               bit 5
      .addField("generateNMIOnVBlank", 7); //     bit 7
  }

  // quand onRead() n'est pas défini, les lectures retournent 0

  onWrite(value) {
    this.setValue(value); // cet appel met à jour `this.value` et tous les champs

    // tu peux déclencher d'autres opérations ici avec `this.ppu`
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

#### 🔍 En lecture seule

Les registres en lecture seule sont remplis par la 🖥️ PPU. Les jeux peuvent lire leur état via des lectures mémoire exécutées par le 🧠 CPU. Certaines lectures peuvent aussi déclencher des effets immédiats.

```javascript
import InMemoryRegister from "/lib/InMemoryRegister";

class PPUStatus extends InMemoryRegister.PPU {
  onLoad() {
    this.addWritableField("spriteOverflow", 5) //    bit 5
      .addWritableField("sprite0Hit", 6) //          bit 6
      .addWritableField("isInVBlankInterval", 7); // bit 7

    this.setValue(0b10000000); // tu peux définir un état initial ici !
  }

  onRead(value) {
    return this.value; // cela changera selon les champs inscriptibles
  }

  // quand onWrite(...) n'est pas défini, les écritures n'ont aucun effet
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
