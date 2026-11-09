# Carte mémoire PPU

| Plage d'adresses | Taille  | Périphérique                                    |
| ---------------- | ------- | ----------------------------------------------- |
| `$0000-$1FFF`    | `$2000` | 🕊️ Pattern tables 0 et 1 (mapper)               |
| `$2000-$2FFF`    | `$1000` | 🏞️ Name tables 0 à 3 (VRAM + miroir)            |
| `$3000-$3EFF`    | `$0F00` | 🚽 Miroirs de `$2000-$2EFF`                     |
| `$3F00-$3F1F`    | `$0020` | 🎨 Palette RAM                                  |
| `$3F20-$3FFF`    | `$00E0` | 🚽 Miroirs de `$3F00-$3F1F`                     |

#### Régions mémoire PPU

- 🐏 VRAM (`2` Kio)
- 🐏 Palette RAM (`32` octets)
- 🐏 OAM RAM (`256` octets)
