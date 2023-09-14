# Mapa de memoria de la PPU

| Rango de direcciones | Tamaño  | Dispositivo                          |
| -------------------- | ------- | ------------------------------------ |
| `$0000-$1FFF`        | `$2000` | 🕊️ Pattern tables 0 y 1 (mapper)     |
| `$2000-$2FFF`        | `$1000` | 🏞️ Name tables 0 a 3 (VRAM + mirror) |
| `$3000-$3EFF`        | `$0F00` | 🚽 Espejo de `$2000-$2EFF`           |
| `$3F00-$3F1F`        | `$0020` | 🎨 Palette RAM                       |
| `$3F20-$3FFF`        | `$00E0` | 🚽 Espejo de `$3F00-$3F1F`           |

#### Regiones de memoria de la PPU

- 🐏 VRAM (`2` KiB)
- 🐏 Palette RAM (`32` bytes)
- 🐏 OAM RAM (`256` bytes)
