# Mapa de memoria de la CPU

| Rango de direcciones | Tamaño  | Dispositivo                                     |
| -------------------- | ------- | ----------------------------------------------- |
| `$0000-$07FF`        | `$0800` | 🐏 RAM interna de `2` KiB                       |
| `$0800-$1FFF`        | `$1800` | 🚽 Espejo de `$0000-$07FF`                      |
| `$2000-$2007`        | `$0008` | 🖥️ Registros de la PPU                          |
| `$2008-$3FFF`        | `$1FF8` | 🚽 Espejo de `$2000-$2007`                      |
| `$4000-$4013`        | `$0014` | 🔊 Registros de la APU                          |
| `$4014-$4014`        | `$0001` | 🖥️ Registro OAMDMA de la PPU                    |
| `$4015-$4015`        | `$0001` | 🔊 Registros APUStatus / APUControl             |
| `$4016-$4016`        | `$0001` | 🎮 Puerto de mando 1                            |
| `$4017-$4017`        | `$0001` | 🎮 Puerto de mando 2 / 🔊 APUFrameCounter       |
| `$4018-$401F`        | `$0008` | 🧸 Sin uso                                      |
| `$4020-$FFFF`        | `$BFE0` | 💾 Espacio del cartucho (PRG-ROM, mapper, etc.) |

#### Chips de memoria de la CPU

- 🐏 WRAM (`2` KiB)

#### 🚽 Pista para espejos

```
byte.getMirroredAddress(address, mirrorRangeStart, mirrorRangeEnd, targetRangeStart, targetRangeEnd)
// ^ example:
// read(0x2009) ==
// read(byte.getMirroredAddress(0x2009, 0x2008, 0x3fff, 0x2000, 0x2007)) ==
// read(0x2001)
```
