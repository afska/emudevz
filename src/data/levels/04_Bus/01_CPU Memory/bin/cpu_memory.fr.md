# Cartographie mémoire du CPU

| Plage d'adresses | Taille  | Périphérique                                       |
| ---------------- | ------- | -------------------------------------------------- |
| `$0000-$07FF`    | `$0800` | 🐏 WRAM (`2` Kio)                                  |
| `$0800-$1FFF`    | `$1800` | 🚽 Miroirs de `$0000-$07FF`                        |
| `$2000-$2007`    | `$0008` | 🖥️ Registres PPU                                   |
| `$2008-$3FFF`    | `$1FF8` | 🚽 Miroirs de `$2000-$2007`                        |
| `$4000-$4013`    | `$0014` | 🔊 Registres APU                                   |
| `$4014-$4014`    | `$0001` | 🖥️ Registre OAMDMA de la PPU                       |
| `$4015-$4015`    | `$0001` | 🔊 Registres APUStatus / APUControl                |
| `$4016-$4016`    | `$0001` | 🎮 Port manette 1                                  |
| `$4017-$4017`    | `$0001` | 🎮 Port manette 2 / 🔊 APUFrameCounter             |
| `$4018-$401F`    | `$0008` | 🧸 Inutilisé                                       |
| `$4020-$FFFF`    | `$BFE0` | 💾 Espace cartouche (PRG-ROM, mapper, etc.)        |

#### Régions mémoire du CPU

- 🐏 WRAM (`2` Kio)
