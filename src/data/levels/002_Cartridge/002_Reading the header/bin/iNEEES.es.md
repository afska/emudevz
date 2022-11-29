# Formato iNEEES

Un archivo iNEEES consiste de las siguientes secciones, en orden:

- Cabecera (`16` bytes)
- Relleno, si existe (`0` or `512` bytes)
- Datos PRG-ROM (`16384` \* `x` bytes)
- Datos CHR-ROM (`8192` \* `y` bytes)

## Cabecera

El formato de la cabecera es el siguiente:

- `0-3`: Constante `$4E $45 $53 $1A`
- `4`: Tamaño del PRG-ROM en unidades de `16` KiB
- `5`: Tamaño del CHR-ROM en unidades de `8` KiB (el valor `0` significa que la placa usa CHR-RAM)
- `6`: Flags 6 - Mapper (nybble inferior), mirroring, memoria persistente, relleno
- `7`: Flags 7 - Mapper (nybble superior)
- `8-15`: Relleno sin uso

Las placas de cartuchos se dividen en clases llamadas **mappers** basadas en similitudes de hardware y comportamiento, y cada mapper tiene asignado un número de 8 bits.

### Flags 6

```
76543210
||||||||
|||||||+- Mirroring: 0: horizontal (para scroll vertical)
|||||||              1: vertical (para scroll horizontal)
||||||+-- 1: El cartucho contiene memoria persistente (`$6000`-`$7FFF`)
|||||+--- 1: El archivo contiene relleno de 512 bytes antes de los datos PRG-ROM
||||+---- 1: Ignorar mirroring y proveer VRAM de 4 pantallas
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
