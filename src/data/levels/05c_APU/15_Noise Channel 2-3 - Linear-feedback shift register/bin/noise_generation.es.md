# Generación de Ruido

- El 💥 Canal Ruido tiene un **registro de desplazamiento** de 15 bits que se activa periódicamente.
- El bit `7` de 🌪️ NoiseForm es la **bandera de modo**, que afecta el patrón de ruido.
- Los bits `0-3` de 🌪️ NoiseForm forman un índice a una tabla fija de "períodos de ruido", que es:

```javascript
[2, 4, 8, 16, 32, 48, 64, 80, 101, 127, 190, 254, 381, 508, 1017, 2034]
```

- Si el **índice de período** es -por ejemplo- `3`, el **período de ruido** será `16`. Esto significa que el registro de desplazamiento se activará una vez cada `16` ciclos de la APU (llamadas a `step()`).

- Cuando se activa el registro de desplazamiento de 15 bits, ocurren las siguientes acciones en orden:

  - se calcula un bit de `feedback`:
    - si la bandera de modo está encendida => `bit 0 ^ bit 6`
    - si la bandera de modo está apagada => `bit 0 ^ bit 1`
  - el registro de desplazamiento se **desplaza a la derecha** un bit (`>> 1`)
  - el bit `14`, el más a la izquierda, se reemplaza con el `feedback` calculado antes

<div style="text-align: center">
  <img alt="noise" src="assets/bitshifts/noise.gif" width="134" height="115" />
  <pre>Ejemplo con bandera de modo encendida</pre>
</div>

- El sample de salida del canal es el **volumen de la envolvente**, excepto cuando:
  - el bit `0` del registro de desplazamiento está activo
  - el contador de longitud es `0`
