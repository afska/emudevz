# Mando

La NEEES tiene soporte para `2` mandos, mapeados a las direcciones CPU `$4016` (jugador `1`) y `$4017` (jugador `2`).

## 🎮 Uso

Leer la dirección de un mando devuelve `1` cuando un botón está presionado o `0` cuando no lo está, y los botones avanzan en un orden específico. Esto significa que, para obtener el estado de todos los botones, los juegos tienen que leer `8` veces.

Los botones avanzan de la siguiente manera:

`A` -> `B` -> `Select` -> `Start` -> `Up` -> `Down` -> `Left` -> `Right`

Después de leer el estado del botón `Right`, las lecturas posteriores devolverán `1` hasta que el juego reinicie la secuencia escribiendo `1` y luego `0` en `$4016` (ver abajo).

## 🔄 Modo strobe

Al escribir en `$4016` (dirección del mando del jugador `1`), el **primer bit** del valor escrito configura el `modo strobe`:
- con el bit de strobe `encendido`, las lecturas siempre informan el estado del botón `A`
- con el bit de strobe `apagado`, las lecturas avanzan por la secuencia mencionada

Al poner el bit de strobe en `encendido`, la secuencia **se reinicia** al botón `A` **en ambos mandos**.

Escribir en `$4017` no afecta a los mandos; controla un registro de APU llamado 🧮  APUFrameCounter.
