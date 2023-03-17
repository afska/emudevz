# Formato iNEEES

Un archivo iNEEES consiste de las siguientes secciones, en orden:

- 🗣️ Cabecera (`16` bytes)
- 🧸 Relleno, si existe (`0` or `512` bytes)
- 💻 Datos `PRG-ROM` (`16384` \* `x` bytes)
  - `x` = byte `4` de la cabecera
- 👾 Datos `CHR-ROM` (`8192` \* `y` bytes)
  - `y` = byte `5` de la cabecera

## Cabecera

El formato de la cabecera es el siguiente:

- `0-3`: Constante `$4E $45 $53 $1A`
- `4`: Tamaño del 💻 `PRG-ROM` en unidades de `16` KiB
- `5`: Tamaño del 👾 `CHR-ROM` en unidades de `8` KiB (el valor `0` significa que la placa usa `8` KiB de 👾 `CHR-RAM`)
- `6`: Flags 6 - 🧠 Mapper (nybble inferior), 🚽 mirroring, 🔋 guardado de progreso (`PRG-RAM`), 🧸 relleno
- `7`: Flags 7 - 🧠 Mapper (nybble superior)
- `8-15`: 🧸 Relleno sin uso

🧠 Las placas de cartuchos se dividen en clases llamadas **mappers** basadas en similitudes de hardware y comportamiento, y cada mapper tiene asignado un número de 8 bits.

🚽 Cada cartucho también define un **tipo de mirroring** que afecta directamente al arreglo de pantallas y cómo el juego manejará el scrolling.

Por ahora:

- 🧠 El id de mapper puede ser cualquier número entre `0` y `255`.
- 🚽 El tipo de mirroring puede ser cualquiera de estos: `HORIZONTAL`, `VERTICAL`, `FOUR_SCREENS`.

### Flags 6

```
76543210
||||||||
|||||||+- Mirroring: 0: HORIZONTAL (para scroll vertical)
|||||||              1: VERTICAL (para scroll horizontal)
||||||+-- 1: El cartucho contiene PRG-RAM (para guardado de progreso)
|||||+--- 1: El archivo contiene relleno de 512 bytes antes de los datos PRG-ROM
||||+---- 1: Ignorar el bit 0 y usar el mirroring FOUR_SCREENS
++++----- Nybble inferior del número de mapper
```

### Flags 7

```
76543210
||||||||
||||||||
||||||||
||||||||
||||||||
||||++++- Relleno sin uso
++++----- Nybble superior del número de mapper
```
