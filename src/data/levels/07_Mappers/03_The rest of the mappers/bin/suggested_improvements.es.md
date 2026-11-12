# Mejoras sugeridas para tu emulador

<div class="embed-image"><img alt="Achievement" src="assets/graphics/achievement_complete.png" style="width: 30%; margin: 16px" /></div>

¡Felicitaciones por haber llegado hasta aquí! Ahora que tienes control total sobre el emulador y puedes cambiar todo como creas conveniente, hay muchas áreas en las que puedes mejorarlo. Las mejoras ni siquiera tienen que eliminar los componentes que construiste a lo largo del juego, ya que el emulador que creaste es sorprendentemente capaz. Puede que no sea el más preciso, ¡pero no subestimes ni al emulador ni tus propias capacidades! Muchos juegos funcionarán correctamente siempre que implementes bien la emulación de los mappers.

Estas son algunas mejoras sugeridas que puedes aplicar a la emulación sin realizar cambios importantes en la arquitectura general:

#### 🎮 Mando

Algunos juegos no responderán a las entradas debido a la forma en que está implementado actualmente el mando. Los capítulos anteriores no profundizaron mucho en esto, pero existe un concepto llamado `open bus`, que significa que ciertos bits de un byte pueden contener basura o valores sin sentido al leerlos, debido a que no hay nada conectado a esos bits. En el caso de la entrada del mando, recuerda que solo se utilizaba el primer bit (el bit `0`). Esto funciona bien para el `99%` de los juegos, pero unos pocos dependen de encontrar valores de open bus al leer los puertos del mando.

El byte alto de la dirección suele ser lo último que queda en el bus, por lo que, en muchos casos (aunque no en todos), también se utiliza como valor de open bus. En el caso de la entrada del mando, como se lee desde `$4016` y `$4017`, el valor de open bus es `$40`.

Una implementación sencilla consistiría en cambiar el valor devuelto por el método `onRead()` a:

```js
return 0x40 | +isPressed;
```

Al agregar esto a la emulación del mando, los juegos relacionados con `personas que reparten periódicos`, `una persona enfadada llamada Max` y algunos otros ya deberían aceptar entradas.

#### ✋ Interrupciones

En el posjuego, puedes agregar tantos mappers para la NEEES como desees. Sin embargo, a medida que implementes las IRQ de la APU, mejores la precisión del momento en que la PPU envía una NMI o agregues mappers más complejos que envíen sus propias IRQ, como `MMC3`, descubrirás que la forma en que tu emulador envía interrupciones a la CPU es muy simple y puede no ser suficiente para manejar todos estos casos.

##### Solicitud, atención y reconocimiento

BrokenNEEES normalmente ejecuta una instrucción (que tarda `N` ciclos) y luego ejecuta `N * 3` puntos de la PPU para ponerse al día. Si se produce una NMI durante cualquiera de estos puntos, la CPU salta inmediatamente al _manejador de interrupciones_. Esa última parte no es ideal. Una CPU real funciona más o menos así:
```
- Inicio
- Obtener la siguiente instrucción    < <
- Decodificar la instrucción           | |
- Ejecutar la instrucción              | |
- ¿Hay una interrupción pendiente? --no- |
-   |---sí---> Atender la interrupción --|
```

Por lo tanto, en el hardware real, la PPU (que funciona en paralelo) solo _solicitaría_ la interrupción. La CPU terminaría la instrucción actual antes de atenderla. Cuando un dispositivo _solicita_ una interrupción, puede seguir solicitándola hasta que la interrupción sea _reconocida_. Reconocer una interrupción significa eliminar la condición que provocó la solicitud. El simple hecho de atender la interrupción (saltar al _manejador de interrupciones_) no necesariamente la reconoce, por lo que la interrupción puede permanecer pendiente hasta que se lea o escriba el registro correspondiente.

##### Solución propuesta

Varios dispositivos pueden enviar IRQ a la CPU:
- la APU (¡puede enviar dos IRQ diferentes!)
- el mapper (normalmente mediante contadores de ciclos de CPU o contadores de scanlines)
- la propia CPU, cuando se ejecuta `BRK`

Para manejar todas estas interrupciones, junto con NMI y RESET, podrías considerar reescribir la forma en que la clase `Emulator` envía interrupciones.

La clase `Emulator` proporciona varias funciones `onIntr` dentro de `_clockAPU(...)`, `_clockPPU(...)` y otros métodos, pero estas desvían inmediatamente la CPU hacia una interrupción, incluso cuando puede no ser el mejor momento para hacerlo. En su lugar, considera hacer que estas funciones `onIntr` pongan las interrupciones "en cola" para que la CPU las maneje cuando corresponda, mediante un sistema de prioridades.

Prioridades de interrupción sugeridas, de mayor a menor, y quién debería encargarse de reconocerlas:

| Interrupción             | Quién la reconoce                                           | Prioridad (un valor menor es mayor) |
| ------------------------ | ----------------------------------------------------------- | ----------------------------------- |
| RESET                    | CPU                                                         | `0`                                   |
| NMI                      | CPU                                                         | `1`                                   |
| BRK (IRQ)                | CPU                                                         | `2`                                   |
| Contador de frames de la APU (IRQ) | Registros de la APU (cuando la CPU accede a ellos) | `3`                                   |
| DMC de la APU finalizado (IRQ) | Registros de la APU (cuando la CPU escribe en ellos) | `4`                                   |
| Mapper (IRQ)             | Mapper (cuando la CPU escribe en un registro específico del mapper) | `5`                          |

<br />

Enviar las interrupciones de esta forma también permite emular con mayor precisión las IRQ de los mappers, porque los juegos pueden indicar al mapper o a otro componente de hardware que las interrupciones fueron atendidas o canceladas. De lo contrario, en la NEEES real, los dispositivos continuarían enviando constantemente su señal de interrupción. Manejar las interrupciones de esta manera también permitiría que la PPU señale VBlank en el ciclo `1`, como corresponde, en lugar de hacerlo en el ciclo `0`, como se indicó en un capítulo anterior.

Esta lista de sugerencias no proporcionará un tutorial completo, pero considera agregar a la CPU algo similar a un pseudorregistro llamado `PendingInterrupts`, que lleve el control de las interrupciones pendientes. Puedes hacerlo con `InMemoryRegister` para mantener el estado de todas ellas, o con un booleano para cada origen de interrupción: Reset, NMI, BRK, frame de la APU, DMC de la APU y mapper. Luego, proporciona métodos sencillos como `raise(id)` y `acknowledge(id)` que activen y desactiven esos booleanos. Después, en el método `step()` de la CPU, en lugar de devolver `this._addCycles(operation)`, devuelve una llamada a un método como `this._checkInterrupts(cycles)`. Dentro de ese método, comprueba cuál es la interrupción pendiente con mayor prioridad y, si existe alguna, haz que la CPU atienda la interrupción (`this.interrupt(...)`) y devuelve el parámetro `cycles`, modificándolo si se atendió la interrupción.

Por supuesto, hay muchas formas de manejar y reconocer interrupciones pendientes, así que puedes aprender y experimentar libremente. Para este ejemplo, se eligieron los dispositivos internos como las prioridades más altas.

#### 🖥️ PPU

También hay muchas áreas en las que se puede mejorar la PPU. Sin embargo, este tema sería demasiado extenso y quedaría fuera del alcance de este pequeño documento de sugerencias. En su lugar, estos son dos ejemplos breves de aspectos que pueden mejorarse:

- Tiles ficticios en `BackgroundRenderer`: La PPU de la NEEES real pide más de `32` tiles por scanline, aunque no hace gran cosa con ellos, ¡y algunos mappers como `MMC2` y `MMC4` detectan estas lecturas! Para simplificar, los capítulos anteriores solo pedían `32`. Realizar estas lecturas que normalmente no se utilizan permitirá que ciertos juegos que usan `MMC2` y `MMC4` funcionen sin errores gráficos. En `BackgroundRenderer::renderScanline()`, haz que el bucle continúe hasta `x < 272` y dibuja píxeles del fondo únicamente cuando `x < 256` (deja que el bucle siga haciendo todo lo demás; no se necesitan más cambios). Después de hacer esto, notarás que el juego relacionado con `un boxeador desfavorecido que aspira a llegar a la cima` ya no debería mostrar un cuadrilátero corrupto o con errores gráficos.

- `SpriteRenderer`: Si mejoras la PPU lo suficiente como para que funcione el `juego de boxeo`, hay un pequeño cambio que conviene realizar en el renderizado de sprites. Notarás que el boxeador oponente se convierte en un conjunto desordenado de tiles con errores gráficos cuando realiza sus ataques especiales. Para corregirlo, basta con hacer que el método `_evaluate()` deje de devolver una lista de sprites en orden inverso. Sin embargo, esto crea problemas en otros juegos, como el `tercer juego del plomero`, que necesita que la lista de sprites esté invertida para poder colocar a los enemigos detrás de las tuberías y crear la ilusión de que salen de ellas. Para conciliar ambos casos, podrías:
    - Reescribir por completo el renderizado de sprites para mejorar su precisión, o:
    - (¡Ten en cuenta que esto es un hack y no es preciso!) Escribir un pequeño método que devuelva `true` si el ID del mapper es `9` o `10`, y utilizar ese resultado para decidir si se invierte la lista de sprites. Esto permitiría que tanto el `tercer juego del plomero` como el `juego de boxeo` se muestren correctamente.

#### 🔊 APU

Es posible que hayas notado que, en algunos juegos que utilizan samples DPCM, se escucha estática o ruido distorsionado en determinadas situaciones. Para corregirlo, edita `DPCM.js` y agrega `this.isActive = false` al método `stop()`. La forma más sencilla de comprobarlo es con el `juego de boxeo`: cuando el público deja de animar, se escucha fácilmente un zumbido estático si no se aplica este ajuste.
