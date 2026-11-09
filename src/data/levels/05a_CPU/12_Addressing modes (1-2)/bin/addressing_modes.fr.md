# Modes d'adressage

#### Simples

| Nom           | Exemple       | Taille entrée | Entrée                         | Sortie (pseudocode)                           |
| ------------- | ------------- | ------------- | ------------------------------ | --------------------------------------------- |
| Implicit      | `INX`         | `0`           | 🚫                             | 🚫                                            |
| Immediate     | `LDA #$08`    | `1`           | 🔢 **valeur** _finale_         | 🔢                                            |
| Absolute      | `LDA $C002`   | `2`           | 🐏 **adresse** _complète_      | 🔢/🐏                                         |
| Zero Page     | `LDA $15`     | `1`           | 🐏 **adresse** _partielle_     | 🔢/🐏                                         |
| Relative      | `BNE @label`  | `1`           | 🐏 **adresse** _relative_      | 🐏 **(\*)**<br/>`toU16([PC] + toS8(address))` |
| Indirect      | `JMP ($4080)` | `2`           | 🐏 **adresse** _indirecte_     | 🐏<br/>`read16(address)`                      |

#### Indexés

| Nom              | Exemple       | Taille entrée | Entrée                         | Sortie (pseudocode)                                                                                                                                                             |
| ---------------- | ------------- | ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zero Page,X      | `STA $60,X`   | `1`           | 🐏 **adresse** _partielle_     | 🔢/🐏<br/>`toU8(address+[X])`                                                                                                                                                   |
| Zero Page,Y      | `STA $60,Y`   | `1`           | 🐏 **adresse** _partielle_     | 🔢/🐏<br/>`toU8(address+[Y])`                                                                                                                                                   |
| Absolute,X       | `STA $4050,X` | `2`           | 🐏 **adresse** _complète_      | 🔢/🐏 **(\*)**<br/>`toU16(address+[X])`                                                                                                                                         |
| Absolute,Y       | `STA $4050,Y` | `2`           | 🐏 **adresse** _complète_      | 🔢/🐏 **(\*)**<br/>`toU16(address+[Y])`                                                                                                                                         |
| Indexed Indirect | `STA ($01,X)` | `1`           | 🐏 **adresse** _partielle_     | 🔢/🐏<br/><br/>`const start = toU8(address+[X]);`<br/>`const end = toU8(start+1);`<br/><br/>`buildU16(read(end), read(start))`                                                  |
| Indirect Indexed | `LDA ($03),Y` | `1`           | 🐏 **adresse** _partielle_     | 🔢/🐏 **(\*)**<br/><br/>`const start = address;`<br/>`const end = toU8(start+1);`<br/>`const baseAddress = buildU16(read(end), read(start));`<br/><br/>`toU16(baseAddress+[Y])` |

<hr>

**(\*)** Ces modes d'adressage définissent la _sortie_ comme la somme d'une _adresse de base_ et d'un décalage, ajoutant `1` cycle supplémentaire (`cpu.extraCycles++`) si une limite de page est franchie. C'est-à-dire quand l'_adresse de base_ et la _sortie_ diffèrent dans leur octet de poids fort (par exemple, additionner `$3BFF + 1` provoque un _franchissement de page_).

⚠️ Tous les opcodes n'ont pas cette pénalité de franchissement de page, donc les modes d'adressage reçoivent un booléen `hasPageCrossPenalty` qui indique s'il faut ajouter des cycles lors du franchissement d'une limite de page. Pour être clair, il faut ajouter des cycles si **les deux** conditions sont remplies (`hasPageCrossPenalty && thereIsPageCross`).
