export default {
	"[A]|Accumulator": {
		also: {
			es: "[A]|Acumulador",
		},
		icon: "🔢",
		version: 1,
		en:
			"_(Accumulator Register)_ A CPU register used to store the result of arithmetic and logic operations.",
		es:
			"_(Registro Acumulador)_ Un registro de CPU usado para almacenar el resultado de operaciones aritméticas y lógicas.",
	},
	"[PC]": {
		icon: "🔢",
		version: 1,
		en:
			"_(Program Counter)_ A CPU register used to store the address of the next instruction to execute.",
		es:
			"_(Contador de Programa)_ Un registro de CPU usado para almacenar la dirección de la próxima instrucción a ejecutar.",
	},
	"[SP]": {
		icon: "🔢",
		version: 1,
		en: "_(Stack Pointer)_ A CPU register used to track the top of the stack.",
		es:
			"_(Puntero de Pila)_ Un registro de CPU usado para localizar la cima de la pila.",
	},
	"[X]": {
		icon: "🔢",
		version: 1,
		en: "_(X Register)_ A CPU register used to index memory and control loops.",
		es:
			"_(Registro X)_ Un registro de CPU usado para indexar memoria y controlar ciclos.",
	},
	"[Y]": {
		icon: "🔢",
		version: 1,
		en: "_(Y Register)_ A CPU register used for indexing and comparisons.",
		es:
			"_(Registro Y)_ Un registro de CPU usado para indexar memoria y hacer comparaciones.",
	},
	"Address space": {
		also: {
			es: "Espacio de direcciones",
		},
		icon: "🐏",
		version: 1,
		en:
			"The full range of memory addresses a component is able to access directly. <br /><br />In the NEEES, the CPU and the PPU each have their own address space. <br /><br />We differentiate these two spaces by saying `CPU address $xxxx` or `PPU address $xxxx`, or simply $CPU `$xxxx` and $PPU `$xxxx`.",
		es:
			"El rango completo de direcciones de memoria que un componente puede acceder directamente. <br /><br />En la NEEES, tanto la CPU como la PPU tienen su propio espacio de direcciones. <br /><br />Distinguimos estos espacios diciendo `dirección CPU $xxxx` o `dirección PPU $xxxx`, o simplemente $CPU `$xxxx` y $PPU `$xxxx`.",
	},
	"Addressing mode|_Addressing modes": {
		also: {
			es: "Modo de direccionamiento|_Modos de direccionamiento",
		},
		icon: "📍",
		version: 1,
		en: "A way for an instruction to specify where its data is located.",
		es:
			"Una forma que tiene una instrucción de especificar dónde está el dato que necesita.",
	},
	Amplitude: {
		also: {
			es: "Amplitud",
		},
		icon: "📶",
		version: 1,
		en:
			"The height of the wave peaks. It defines the volume or loudness of the sound.",
		es:
			"La altura de los picos de la onda. Define el volumen o la intensidad del sonido.",
	},
	APU: {
		icon: "🔊",
		version: 1,
		en: "The _Audio Processing Unit_. It handles sound, producing audio waves.",
		es:
			"La _Unidad de Procesamiento de Audio_. Maneja el sonido, produciendo ondas de audio.",
	},
	"APU cycle|_APU cycles": {
		also: {
			es: "Ciclo de APU|_Ciclos de APU",
		},
		icon: "🐢",
		version: 1,
		en:
			"The basic timing unit of the APU; each cycle corresponds to one APU clock tick and advances its internal state. <br /><br />The APU runs at `half` the CPU clock rate. For every APU cycle, the CPU runs `2` cycles.",
		es:
			"La unidad de tiempo básica de la APU; cada ciclo corresponde a un tick de reloj de la APU y avanza su estado interno. <br /><br />La APU funciona a la `mitad` de la velocidad de la CPU. Por cada ciclo de APU, la CPU ejecuta `2` ciclos.",
	},
	"APU register|_APU registers|Audio register|_Audio registers": {
		also: {
			es:
				"Registro de APU|_Registros de APU|_Registro APU|_Registros APU|Registro de Audio|_Registros de Audio",
		},
		icon: "🔢",
		version: 1,
		en:
			"A memory-mapped register used to control sound channels or volume. <br /><br />In the NEEES, they are mapped to addresses `$4000` - `$4013`, `$4015` (APUControl / APUStatus), and `$4017` (APUFrameCounter).",
		es:
			"Un registro mapeado en memoria usado para controlar los canales de sonido o el volumen. <br /><br />En la NEEES, están mapeados en las direcciones `$4000` - `$4013`, `$4015` (APUControl / APUStatus), y `$4017` (APUFrameCounter).",
	},
	APUControl: {
		icon: "🎛️",
		version: 1,
		en:
			"An audio register that enables or disables each APU channel (pulse, triangle, noise, DMC). <br /><br />It is available for writing at CPU address `$4015`.",
		es:
			"Un registro de control de audio que habilita o deshabilita cada canal de la APU (pulso, triangular, ruido, DMC). <br /><br />Está disponible para escritura en la dirección de CPU `$4015`.",
	},
	APUFrameCounter: {
		icon: "🧮",
		version: 1,
		en:
			"An audio register that controls the APU's sequencer (`4`- or `5`-step). <br /><br />It is available at CPU address `$4017`.",
		es:
			"Un registro de audio que controla el secuenciador de la APU (`4` o `5` pasos). <br /><br />Está disponible en la dirección de CPU `$4017`.",
	},
	APUStatus: {
		icon: "📊",
		version: 1,
		en:
			"An audio status register that reports which channels are active and if DPCM is active. <br /><br />It is available for reading at CPU address `$4015`.",
		es:
			"Un registro de estado de audio que indica qué canales están activos y si el DPCM está activo. <br /><br />Está disponible para lectura en la dirección de CPU `$4015`.",
	},
	Assembly: {
		also: {
			es: "Ensamblador|_Assembly",
		},
		icon: "🔨",
		version: 1,
		en:
			"A low-level programming language that maps very closely to the machine code understood by the CPU.",
		es:
			"Un lenguaje de programación de bajo nivel que se asemeja mucho al código máquina que la CPU entiende.",
	},
	"Assembly code": {
		also: {
			es: "Código ensamblador",
		},
		icon: "🔨",
		version: 1,
		en: "Code written in assembly language.",
		es: "Código escrito en lenguaje ensamblador.",
	},
	"Attribute table|Attribute tables": {
		icon: "🖍️📖",
		version: 1,
		en:
			"A map of palette indexes for backgrounds, stored at the end of each name table.",
		es:
			"Un mapa de índices de paleta para fondos, almacenado al final de cada name table.",
	},
	"Audio channel|APU channel|Channel|_Audio channels|_APU channels|_Channels": {
		also: {
			es:
				"Canal de audio|Canal APU|Canal|_Canales de audio|_Canales APU|_Canales|_Canal de la APU|_Canales de la APU",
		},
		icon: "🎛️",
		version: 1,
		en:
			"A component of the APU responsible for generating a specific type of sound. Each channel has its own parameters and behavior. <br /><br />The NEEES has `2` Pulse Channels, `1` Triangle Channel, `1` Noise Channel, and `1` DMC Channel.",
		es:
			"Un componente de la APU encargado de generar un tipo específico de sonido. Cada canal tiene sus propios parámetros y comportamiento. <br /><br />La NEEES tiene `2` Canales Pulso, `1` Canal Triangular, `1` Canal Ruido, y `1` Canal DMC.",
	},
	"Audio sample|_Audio samples|Sample|_Samples": {
		also: {
			es: "Sample de audio|_Samples de audio|Sample|_Samples",
		},
		icon: "📈",
		version: 1,
		en:
			"A number that represents the height of a wave at a specific point in time. Waves are stored as a stream of these values. <br /><br/>In the NEEES, these are numbers in the `0-15` range. When emulating the APU, we use a `44100` Hz sample rate. <br /><br />The word `sample` can also refer to a recorded `sound clip` (multiple samples), so its interpretation depends on the context.",
		es:
			"Un número que representa la altura de una onda en un punto específico en el tiempo. Las ondas se almacenan como una secuencia de estos valores. <br /><br/>En la NEEES, estos números están en el rango `0-15`. Al emular la APU, usamos una frecuencia de muestreo de `44100` Hz. <br /><br/>La palabra `sample` también puede referirse a un `clip de sonido` grabado (múltiples samples), por lo que su interpretación depende del contexto.",
	},
	"Audio wave|_Audio waves|Wave|_Waves": {
		also: {
			es: "Onda de audio|_Ondas de audio|Onda|_Ondas",
		},
		icon: "🌊",
		version: 1,
		en:
			"A representation of how sound varies over time, stored as a stream of samples that describe the wave's height at each moment. <br /><br />A wave has a form, frequency and amplitude.",
		es:
			"Una representación de cómo varía el sonido a lo largo del tiempo, almacenada como una secuencia de samples que describen la altura de la onda en cada instante. <br /><br />Una onda tiene forma, frecuencia y amplitud.",
	},
	"Background|_Backgrounds": {
		also: {
			es: "Fondo|_Fondos",
		},
		icon: "🏞️",
		version: 1,
		en: "A static image behind the sprites, stored in a name table.",
		es:
			"Una imagen estática detrás de los sprites, almacenada en una name table.",
	},
	"Bank-switching|Bank switching": {
		icon: "🔄",
		version: 1,
		en:
			"A technique that swaps which memory bank is mapped into the CPU or PPU address space, allowing access to more code or graphics than the fixed address range permits.",
		es:
			"Una técnica que intercambia qué banco de memoria está mapeado en el espacio de direcciones de CPU o PPU, permitiendo acceder a más código o gráficos de los que permite el rango de direcciones fijo.",
	},
	BrokenNEEES: {
		icon: "🕹️",
		version: 1,
		en:
			"A NEEES emulator found online. It's buggy as hell, but has a modular design, so components like Cartridge, CPU, PPU and APU can be replaced.",
		es:
			"Un emulador de NEEES encontrado en línea. Está lleno de bugs, pero tiene un diseño modular, por lo que se le pueden reemplazar componentes como el Cartucho, la CPU, PPU y APU.",
	},
	"Carry Flag": {
		also: {
			es: "Bandera Carry",
		},
		icon: "🏁",
		version: 1,
		en:
			"A CPU flag that indicates when an arithmetic operation has produced a _carry_. <br /><br />In the NEEES, that happens when the result exceeds the `8`-bit capacity (`255` for unsigned numbers).",
		es:
			"Una bandera de CPU que indica cuando una operación aritmética produjo un _carry_. <br /><br />En la NEEES, esto ocurre cuando el resultado sobrepasa el límite de `8` bits (`255` para números sin signo).",
	},
	"Cartridge|_Cartridges": {
		also: {
			es: "Cartucho|_Cartuchos",
		},
		icon: "💾",
		version: 1,
		en:
			"A removable piece of hardware that contains all the game chips, such as PRG-ROM, CHR-ROM, PRG-RAM, and the Mapper.",
		es:
			"Una pieza de hardware removible que contiene todos los chips del juego, como PRG-ROM, CHR-ROM, PRG-RAM, y el Mapper.",
	},
	"CHR-RAM": {
		icon: "👾",
		version: 1,
		en:
			"_(Character RAM)_ A RAM chip where some games write their graphics through code. Some cartridges use this type of memory instead of CHR-ROM.",
		es:
			"_(Character RAM)_ Un chip de RAM donde algunos juegos escriben sus gráficos vía código. Algunos cartuchos usan este tipo de memoria en lugar de CHR-ROM.",
	},
	"CHR-ROM": {
		icon: "👾",
		version: 1,
		en:
			"_(Character ROM)_ A ROM chip that contains the game graphics, inside the cartridge.",
		es:
			"_(Character ROM)_ Un chip de ROM que contiene los gráficos del juego, dentro del cartucho.",
	},
	"Color index|_Color indexes": {
		also: {
			es: "Índice de color|_Índices de color",
		},
		icon: "🎨",
		version: 1,
		en:
			"A number inside a tile pixel that selects a color from the palette. It ranges from `0` to `3`. <br /><br />In the background, index `0` is the `backdrop color`. <br />In sprites, index `0` is always transparent.",
		es:
			"Un número dentro de un píxel de tile que selecciona un color de la paleta. Va de `0` a `3`. <br /><br />En el fondo, el índice `0` es el `backdrop color`. <br />En los sprites, el índice `0` siempre es transparente.",
	},
	"Controller|_Controllers": {
		also: {
			es: "Mando|_Mandos",
		},
		icon: "🎮",
		version: 1,
		en:
			"An `8`-button gamepad (_D-pad + A,B + START,SELECT_). <br /><br />The NEEES accepts _(without extra hardware)_ up to two controllers.",
		es:
			"Un joystick de `8` botones (_D-pad + A,B + START,SELECT_). <br /><br />La NEEES acepta _(sin hardware extra)_ hasta dos mandos.",
	},
	CPU: {
		icon: "🧠",
		version: 1,
		en:
			"The _Central Processing Unit_. It reads games' code and executes their instructions.",
		es:
			"La _Unidad Central de Procesamiento_. Lee el código de los juegos y ejecuta sus instrucciones.",
	},
	"CPU address|_CPU addresses|$CPU|CPU memory": {
		also: {
			es:
				"Dirección CPU|_Direcciones CPU|_Dirección de CPU|_Direcciones de CPU|_Dirección de la CPU|_Direcciones de la CPU|$CPU|Memoria CPU|_Memoria de CPU|_Memoria de la CPU",
		},
		icon: "🐏",
		version: 1,
		en:
			"A memory address seen from the CPU's address space. <br /><br />In the NEEES, the CPU can access addresses from `$0000` to `$FFFF` (`64` KiB).",
		es:
			"Una dirección de memoria vista desde el espacio de direcciones de la CPU. <br /><br />En la NEEES, la CPU puede acceder a direcciones entre `$0000` y `$FFFF` (`64` KiB).",
	},
	"CPU cycle|_CPU cycles": {
		also: {
			es: "Ciclo de CPU|_Ciclos de CPU",
		},
		icon: "🐎",
		version: 1,
		en:
			"The basic timing unit of the CPU; each cycle corresponds to one CPU clock tick and advances its internal state.",
		es:
			"La unidad de tiempo básica de la CPU; cada ciclo corresponde a un tick de reloj de la CPU y avanza su estado interno.",
	},
	"CPU flag|_CPU flags": {
		also: {
			es: "Bandera de CPU|_Banderas de CPU",
		},
		icon: "🏁",
		version: 1,
		en: "A flag stored using one bit inside the Flags Register.",
		es: "Una bandera almacenada usando un bit dentro del Registro de Banderas.",
	},
	"CPU interrupt|_CPU interrupts|Interrupt|_Interrupts": {
		also: {
			es:
				"Interrupción de CPU|_Interrupciones de CPU|Interrupción|_Interrupciones",
		},
		icon: "✋",
		version: 1,
		en:
			"A signal that pauses the current program in order to handle a specific events. <br /><br />When such an event happens, the CPU saves its state ([PC] and flags register) in the stack and jumps to the vector associated with that event. <br /><br />After handling the event, the execution usually returns to where it was left off.",
		es:
			"Una señal que pausa el programa actual para manejar un evento específico. <br /><br />Cuando tal evento ocurre, la CPU guarda su estado ([PC] y registro de banderas) en la pila y salta al vector asociado con ese evento. <br /><br />Luego de manejar el evento, la ejecución suele continuar desde donde se interrumpió.",
	},
	"CPU register|_CPU registers": {
		also: {
			es: "Registro de CPU|_Registros de CPU",
		},
		icon: "🔢",
		version: 1,
		en:
			"A small, fast storage location inside the CPU used to hold data temporarily (like numbers, memory addresses, or results of operations) while it's working. <br /><br />In the NEEES, each register can hold a single byte (`8` bits) of data, with the exception of [PC] which is `2` bytes wide.",
		es:
			"Una ubicación pequeña y de rápido acceso dentro de la CPU usada para almacenar datos temporalmente (como números, direcciones de memoria, o resultados de operaciones) mientras está operando. <br /><br />En la NEEES, cada registro puede almacenar un solo byte (`8` bits) de datos, con la excepción de [PC] que ocupa `2` bytes.",
	},
	"Cycle|_Cycles": {
		also: {
			es: "Ciclo|_Ciclos",
		},
		icon: "🚲",
		version: 1,
		en:
			"A unit used to measure time in the system. The CPU, PPU, and APU all do work cycle by cycle. <br /><br />The duration of a cycle depends on the speed of each unit.",
		es:
			"Una unidad usada para medir el tiempo en el sistema. La CPU, la PPU y la APU hacen su trabajo ciclo a ciclo. <br /><br />La duración de un ciclo depende de la velocidad de cada unidad.",
	},
	"Divider period": {
		also: {
			es: "Período de divisor",
		},
		icon: "⏰",
		version: 1,
		en:
			"The number of cycles a divider waits before triggering its next output. <br /><br />For example, with a divider period of `15`, the divider will generate a timing pulse every `15` cycles.",
		es:
			"La cantidad de ciclos que un divisor espera antes de generar su siguiente salida. <br /><br />Por ejemplo, con un período de divisor de `15`, este generará un pulso de temporización cada `15` ciclos.",
	},
	"Divider|_Dividers": {
		also: {
			es: "Divisor|_Divisores",
		},
		icon: "⏰",
		version: 1,
		en:
			"A counter that reduces the system's master clock to a slower periodic signal by counting cycles and triggering an event at a fixed interval. <br /><br />It is used to clock other units at a slower rate. <br /><br />See also: Divider period.",
		es:
			"Un contador que reduce el reloj maestro del sistema a una señal periódica más lenta contando ciclos y activando un evento a intervalos fijos. <br /><br />Se usa para sincronizar otras unidades a una velocidad más baja. <br /><br />Ver también: Período de divisor.",
	},
	"DMA|DMA transfer": {
		also: {
			es: "DMA|Transferencia DMA",
		},
		icon: "⚡",
		version: 1,
		en:
			"_(Direct Memory Access)_ A mechanism that copies data from one memory area to another without using the CPU to move each byte manually. <br /><br />In the NEEES, DMA is only available to transfer OAM data through the OAMDMA register.",
		es:
			"_(Direct Memory Access)_ Un mecanismo que copia datos de una zona de memoria a otra sin que la CPU tenga que mover cada byte manualmente. <br /><br />En la NEEES, el DMA solo está disponible para transferir datos de OAM usando el registro OAMDMA.",
	},
	"DMC Channel|DMC": {
		also: {
			es: "Canal DMC|DMC",
		},
		icon: "📦",
		version: 1,
		en:
			"One of the APU's audio channels. It plays back digital samples from memory using the Delta Modulation technique, but it also can load samples directly.",
		es:
			"Uno de los canales de audio de la APU. Reproduce samples digitales desde la memoria usando la técnica de Modulación Delta, pero también puede cargar samples directamente.",
	},
	DMCControl: {
		icon: "📦",
		version: 1,
		en:
			"An audio register that controls DMC Channel's sample playback, and sets its playback rate index. <br /><br />It is available at CPU address `$4010`.",
		es:
			"Un registro de audio que controla la reproducción de sample del Canal DMC, y ajusta su índice de tasa de reproducción. <br /><br />Está disponible en la dirección de CPU `$4010`.",
	},
	DMCLoad: {
		icon: "📥",
		version: 1,
		en:
			"An audio register that holds the direct `7`-bit sample level for the DMC Channel. <br /><br />It is available at CPU address `$4011`.",
		es:
			"Un registro de audio que contiene el nivel de sample directo de `7` bits para el Canal DMC. <br /><br />Está disponible en la dirección de CPU `$4011`.",
	},
	DMCSampleAddress: {
		icon: "🐏",
		version: 1,
		en:
			"An audio register that sets the start address of the DMC sound clip in memory. <br /><br />It is available at CPU address `$4012`.",
		es:
			"Un registro de audio que establece la dirección de inicio del clip de sonido DMC en memoria. <br /><br />Está disponible en la dirección de CPU `$4012`.",
	},
	DMCSampleLength: {
		icon: "📐",
		version: 1,
		en:
			"An audio register that sets the length (in bytes) of the DMC sample to play. <br /><br />It is available at CPU address `$4013`.",
		es:
			"Un registro de audio que establece la longitud (en bytes) del sample DMC a reproducir. <br /><br />Está disponible en la dirección de CPU `$4013`.",
	},
	"DPCM|Delta Modulation": {
		also: {
			es: "DPCM|Modulación Delta",
		},
		icon: "🤏",
		version: 1,
		en:
			"_Delta Pulse-Code Modulation_, the audio compression format used by the DMC Channel when not using the _direct load_ mode. <br /><br />Samples are stored as the difference (delta) from the previous sample.",
		es:
			"_Delta Pulse-Code Modulation_, el formato de compresión de audio usado por el Canal DMC cuando no se usa el modo de _carga directa_. <br /><br />Los samples se almacenan como la diferencia (delta) respecto al sample anterior.",
	},
	"Duty cycle|_Duty cycles": {
		also: {
			es: "Ciclo de trabajo|_Ciclos de trabajo",
		},
		icon: "📊",
		version: 1,
		en:
			"The percentage of time a pulse wave stays high during one period. Affects the tone and timbre of the sound. <br /><br />In the NEEES, Pulse Channels support `4` duty cycles: `0` (`12.5%`), `1` (`25%`), `2` (`50%`) and `3` (`75%`).",
		es:
			"El porcentaje de tiempo que una onda de pulso se mantiene alta durante un período. Afecta el tono y el timbre del sonido. <br /><br />En la NEEES, los Canales Pulso soportan `4` ciclos de trabajo: `0` (`12.5%`), `1` (`25%`), `2` (`50%`) y `3` (`75%`).",
	},
	"Emulator core": {
		also: {
			es: "Núcleo del emulador|_Núcleo de emulador",
		},
		icon: "🌀",
		version: 1,
		en:
			"The component of an emulator responsible for simulating the target system's hardware components (CPU, PPU, APU, and memory buses) in software.",
		es:
			"La parte de un emulador encargada de simular por software los componentes de hardware del sistema objetivo (CPU, PPU, APU y buses de memoria).",
	},
	"Emulator frontend": {
		also: {
			es: "Frontend del emulador",
		},
		icon: "🌸",
		version: 1,
		en:
			"The component of an emulator that provides the user interface, input handling, and configuration surrounding the core simulation.",
		es:
			"La parte de un emulador que proporciona la interfaz de usuario, gestiona las entradas y la configuración alrededor de la simulación del núcleo.",
	},
	"Five-step sequence|Five-step": {
		also: {
			es: "Secuencia de cinco pasos|Cinco pasos",
		},
		icon: "🔀",
		version: 1,
		en: "A mode of the frame sequencer that runs a five-step pattern.",
		es:
			"Un modo del secuenciador de frames que ejecuta un patrón de cinco pasos.",
	},
	"Flag|_Flags": {
		also: {
			es: "Bandera|_Banderas",
		},
		icon: "🏁",
		version: 1,
		en:
			"A field that stores a value that can be either `true` or `false`. <br /><br />See also: CPU Flag.",
		es:
			"Un campo que almacena un valor que puede ser `true` o `false`. <br /><br />Ver también: Bandera de CPU.",
	},
	"Flags Register|P register": {
		also: {
			es: "Registro de Banderas|Registro P",
		},
		icon: "🔢",
		version: 1,
		en: "A CPU register used to store multiple CPU flags.",
		es: "Un registro de CPU usado para almacenar múltiples banderas de CPU.",
	},
	"Four-step sequence|Four-step": {
		also: {
			es: "Secuencia de cuatro pasos|Cuatro pasos",
		},
		icon: "🔀",
		version: 1,
		en: "A mode of the frame sequencer that runs a four-step pattern.",
		es:
			"Un modo del secuenciador de frames que ejecuta un patrón de cuatro pasos.",
	},
	"Frame buffer": {
		icon: "🔢",
		version: 1,
		en:
			"A block of memory that stores the color of each pixel on the screen. It's where the frame image is built before being displayed.",
		es:
			"Un bloque de memoria que almacena el color de cada píxel en pantalla. Es donde se construye la imagen del frame antes de mostrarse.",
	},
	"Frame|_Frames": {
		icon: "🖼️",
		version: 1,
		en:
			"A full image drawn on the screen, made of multiple scanlines. <br /><br />In the NEEES, it's `256x240` pixels, and the PPU renders `60` of them per second.",
		es:
			"Una imagen completa dibujada en la pantalla, compuesta por múltiples scanlines. <br /><br />En la NEEES, mide `256x240` píxeles, y la PPU renderiza `60` por segundo.",
	},
	Frequency: {
		also: {
			es: "Frecuencia",
		},
		icon: "🎚️",
		version: 1,
		en:
			"The number of times a wave repeats in one second. It determines the pitch of a sound. Measured in hertz (`Hz`). <br /><br />It is the inverse of the period.",
		es:
			"El número de veces que una onda se repite en un segundo. Determina el tono de un sonido. Se mide en hertz (`Hz`). <br /><br />Es la inversa del período.",
	},
	"Frequency sweep|_Frequency sweeps|Sweep|_Sweeps": {
		also: {
			es: "Barrido de frecuencia|_Barridos de frecuencia|Barrido|_Barridos",
		},
		icon: "🧹",
		version: 1,
		en:
			"A feature of Pulse Channels that periodically shifts their timer period up or down to create pitch-slide effects.",
		es:
			"Una funcionalidad de los Canales Pulso que desplaza periódicamente su período de timer hacia arriba o abajo para crear efectos de deslizamiento de tono.",
	},
	"Half frame|Half-frame|_Half frames|_Half-frames": {
		icon: "🕧",
		version: 1,
		en:
			"An event in the frame sequencer that occurs at every half sequence (second and fourth quarters), triggering length counter and sweep updates.",
		es:
			"Un evento de temporización en el secuenciador de frames que ocurre en el segundo y cuarto quarter-frame de su secuencia, activando las actualizaciones de contadores de longitud y barrido.",
	},
	"HBlank|Horizontal Blank": {
		icon: "🏝️",
		version: 1,
		en:
			"Short period after each scanline is drawn, where the PPU is idle before starting the next one.",
		es:
			"Período corto después de dibujar cada scanline, donde la PPU queda inactiva antes de comenzar la siguiente.",
	},
	iNEEES: {
		icon: "📝",
		version: 1,
		en:
			"A format that describes a NEEES cartridge. It contains its code (PRG-ROM), graphics (CHR-ROM), and a metadata header.",
		es:
			"Un formato que describe un cartucho de NEEES. Contiene su código (PRG-ROM), gráficos (CHR-ROM), y una cabecera con metadatos.",
	},
	"Instruction|_Instructions|CPU instruction|_CPU instructions": {
		also: {
			es: "Instrucción|_Instrucciones|Instrucción de CPU|_Instrucciones de CPU",
		},
		icon: "📖",
		version: 1,
		en:
			"A command that tells the CPU to do something, like adding numbers or jumping to another part of the program.",
		es:
			"Una orden que le dice a la CPU qué hacer, como sumar números o saltar a otra parte del programa.",
	},
	"Interrupt Disable Flag": {
		also: {
			es: "Bandera Interrupt Disable",
		},
		icon: "🏁",
		version: 1,
		en: "A CPU flag that, when set, disables maskable CPU interrupts.",
		es:
			"Una bandera de CPU que, cuando está activa, desactiva las interrupciones enmascarables de la CPU.",
	},
	"Interrupt vector|_Interrupt vectors|Vector|_Vectors": {
		also: {
			es: "Vector de interrupción|_Vectores de interrupción|Vector|_Vectores",
		},
		icon: "🔢",
		version: 1,
		en:
			"A well-known memory address associated with an event that triggers an interrupt.",
		es:
			"Una dirección de memoria conocida asociada a un evento que dispara una interrupción.",
	},
	JavaScript: {
		icon: "🗣️",
		version: 1,
		en:
			'A programming language created so that websites can proudly announce _"Welcome!"_ via an unstoppable alert box, but some people create emulators with it.',
		es:
			'Un lenguaje de programación creado para que los sitios web puedan anunciar orgullosamente _"¡Bienvenido!"_ mediante una caja de alerta imposible de cerrar, pero algunas personas hacen emuladores con él.',
	},
	"Least significant byte|LSB|Low byte": {
		also: {
			es: "Byte menos significativo|LSB|Low byte|Byte bajo",
		},
		icon: "🔢",
		version: 1,
		en:
			"The byte with the lowest positional value in a multi-byte number. <br /><br />For example, the LSB of `$AB15` is `$15`.",
		es:
			"El byte con el valor posicional más bajo en un número multibyte. <br /><br />Por ejemplo, el LSB de `$AB15` es `$15`.",
	},
	"Length counter|_Length counters": {
		also: {
			es: "Contador de longitud|_Contadores de longitud",
		},
		icon: "📏",
		version: 1,
		en:
			"A counter that determines the length of the notes. When it reaches zero, the channel silences.",
		es:
			"Un contador que determina la longitud de las notas. Al llegar a cero, silencia el canal.",
	},
	"Linear length counter|_Linear length counters": {
		also: {
			es: "Contador lineal de longitud|_Contadores lineales de longitud",
		},
		icon: "📏",
		version: 1,
		en:
			"A special length counter present in the Triangle Channel whose register value maps directly (linearly) to the number of ticks before silencing. Regular length counters use an index into a predefined table of durations instead.",
		es:
			"Un contador especial del Canal Triangular cuyo valor de registro se asigna de forma directa (lineal) al número de ciclos antes de silenciar. Los contadores de longitud normales usan un índice en una tabla predefinida de duraciones.",
	},
	"Little Endian": {
		icon: "🔢",
		version: 1,
		en:
			"A convention where the least significant byte is stored first in memory.",
		es:
			"Una convención donde el byte menos significativo se almacena primero en memoria.",
	},
	"Machine code|Game code|_Game's code|_Games' code": {
		also: {
			es:
				"Código máquina|Código de juego|_Código del juego|_Código de los juegos",
		},
		icon: "🔢",
		version: 1,
		en:
			"The bytes that the CPU interprets as code. It's often the product of translating assembly code, written by humans.",
		es:
			"Los bytes que la CPU interpreta como código. A menudo es el producto de traducir lenguaje ensamblador escrito por humanos.",
	},
	"Mapper|_Mappers": {
		icon: "🗜️",
		version: 1,
		en:
			"A chip in the cartridge that extends what the console can do, like adding more PRG-ROM or CHR-ROM banks or providing features such as switching mirroring types.",
		es:
			"Un chip en el cartucho que extiende lo que la consola puede hacer, como agregar más bancos de PRG-ROM o CHR-ROM, o proporcionar funciones como cambiar el tipo de mirroring.",
	},
	"Master palette": {
		also: {
			es: "Paleta maestra",
		},
		icon: "👑🎨",
		version: 1,
		en:
			"A list of `64` colors, hardcoded. Palettes reference these colors with indexes from `$00` to `$3F`.",
		es:
			"Una lista de `64` colores, hardcodeada. Las paletas referencian estos colores con índices de `$00` a `$3F`.",
	},
	"Memory address|_Memory addresses|Address|_Addresses": {
		also: {
			es: "Dirección de memoria|_Direcciones de memoria|Dirección|_Direcciones",
		},
		icon: "🐏",
		version: 1,
		en:
			"A number that represents a location in memory. <br /><br />In the NEEES, they take up `2` bytes, so they can go from `0` (`$0000`) to `65535` (`$FFFF`).",
		es:
			"Un número que representa una ubicación dentro de la memoria. <br /><br />En la NEEES, ocupan `2` bytes, por lo que pueden ir de `0` (`$0000`) a `65535` (`$FFFF`).",
	},
	"Memory bus|_Memory buses": {
		also: {
			es: "Bus de memoria|_Buses de memoria",
		},
		icon: "🚌",
		version: 1,
		en:
			"The set of connections that link components to memory, enabling them to read or write data.",
		es:
			"El conjunto de conexiones que enlaza los componentes con la memoria, permitiéndoles leer o escribir datos.",
	},
	"Memory mirror|_Memory mirrors|Mirror|_Mirrors": {
		also: {
			es: "Espejo de memoria|_Espejos de memoria|Espejo|_Espejos",
		},
		icon: "🚽",
		version: 1,
		en:
			"A copy of a memory region that appears at another address. They are used to fill unused address space or to provide alternative access points. <br /><br />In the NEEES, many CPU and PPU regions are mirrored across the address space. <br /><br />See also: Mirroring.",
		es:
			"Una copia de una región de memoria que aparece en otra dirección. Se usan para llenar espacio sin usar o para ofrecer accesos alternativos. <br /><br />En la NEEES, muchas regiones de la CPU y la PPU están espejadas a lo largo del espacio de direcciones. <br /><br />Ver también: Mirroring.",
	},
	"Memory-mapped register|_Memory-mapped registers": {
		also: {
			es: "Registro mapeado en memoria|_Registros mapeados en memoria",
		},
		icon: "🐏",
		version: 1,
		en:
			"A special memory address used to interact with hardware. Unlike CPU registers, reading or writing to them may trigger hardware behavior rather than just storing a value. <br /><br />In the NEEES, the PPU, APU, Controller, and Mappers expose these addresses so the game code can interact with the units through them.",
		es:
			"Una dirección de memoria especial usada para interactuar con el hardware. A diferencia de los registros de CPU, leer o escribir en ellos puede activar comportamientos del hardware en lugar de simplemente almacenar un valor. <br /><br />En la NEEES, la PPU, la APU, el Mando y los Mappers exponen estas direcciones para que el código del juego pueda comunicarse con ellos.",
	},
	Mirroring: {
		icon: "🚽",
		version: 1,
		en:
			"The mirroring type affects the screen arrangement and how the game will handle scrolling. <br /><br />See also: Memory mirror.",
		es:
			"El tipo de mirroring afecta la disposición de la pantalla y cómo el juego maneja el scrolling. <br /><br />Ver también: Espejo de memoria",
	},
	"Most significant byte|MSB|High byte": {
		also: {
			es: "Byte más significativo|MSB|High byte|Byte alto",
		},
		icon: "🔢",
		version: 1,
		en:
			"The byte with the highest positional value in a multi-byte number. <br /><br />For example, the MSB of `$AB15` is `$AB`.",
		es:
			"El byte con el valor posicional más alto en un número multibyte. <br /><br />Por ejemplo, el MSB de `$AB15` es `$AB`.",
	},
	"Name table|_Name tables|_Nametable|_Nametables": {
		icon: "🏞️📖",
		version: 1,
		en: "A map of tile indexes for backgrounds, stored in VRAM.",
		es: "Un mapa de índices de tiles para fondos, almacenado en VRAM.",
	},
	NEEES: {
		icon: "🕹️",
		version: 1,
		en:
			"The piece of hardware we're trying to emulate. People think it means _'No Entiendo' Enigmatic Enjoyment Solution_.",
		es:
			"La pieza de hardware que estamos tratando de emular. La gente piensa que significa _'No Entiendo' El Entretenimiento Saludable_.",
	},
	"Negative Flag": {
		also: {
			es: "Bandera Negative",
		},
		icon: "🏁",
		version: 1,
		en:
			"A CPU flag that indicates when the result of an operation is a negative number.",
		es:
			"Una bandera de CPU que indica cuando el resultado de una operación es un número negativo.",
	},
	NMI: {
		icon: "📹",
		version: 1,
		en:
			"_(Non-maskable interrupt)_ A CPU interrupt triggered at the start of VBlank, when the PPU finishes drawing a frame.",
		es:
			"_(Non-maskable interrupt)_ Una interrupción de CPU disparada al principio del VBlank, cuando la PPU termina de dibujar un frame.",
	},
	"Noise Channel": {
		also: {
			es: "Canal Ruido",
		},
		icon: "💥",
		version: 1,
		en:
			"One of the APU's audio channels. It generates a random-sounding signal, useful for percussion or sound effects like explosions.",
		es:
			"Uno de los canales de audio de la APU. Genera una señal con sonido aleatorio, útil para percusión o efectos como explosiones.",
	},
	NoiseControl: {
		icon: "💥",
		version: 1,
		en:
			"An audio register that configures the Noise Channel's envelope and length counter behavior. <br /><br />It is available at CPU address `$400C`.",
		es:
			"Un registro de audio que configura la envolvente y el comportamiento del contador de longitud del Canal Ruido. <br /><br />Está disponible en la dirección de CPU `$400C`.",
	},
	NoiseForm: {
		icon: "🌪️",
		version: 1,
		en:
			"An audio register that selects the Noise Channel's mode (periodic or white noise) and its period. <br /><br />It is available at CPU address `$400E`.",
		es:
			"Un registro de audio que selecciona el modo del Canal Ruido (ruido periódico o blanco) y su período. <br /><br />Está disponible en la dirección de CPU `$400E`.",
	},
	NoiseLCL: {
		icon: "📏",
		version: 1,
		en:
			"An audio register that loads the Noise Channel's length counter and restarts its envelope. <br /><br />It is available at CPU address `$400F`.",
		es:
			"Un registro de audio que carga el contador de longitud del Canal Ruido y reinicia su envolvente. <br /><br />Está disponible en la dirección de CPU `$400F`.",
	},
	"OAM entry|_OAM entries": {
		also: {
			es: "Entrada OAM|_Entradas OAM|_Entrada de OAM|_Entradas de OAM",
		},
		icon: "🛸📖",
		version: 1,
		en: "An entry inside the OAM table.",
		es: "Una entrada dentro de la tabla OAM.",
	},
	"OAM RAM": {
		icon: "🐏",
		version: 1,
		en:
			"A dedicated RAM area used to store the contents of OAM. <br /><br />In the NEEES, it's `256` bytes and holds all the sprite data.",
		es:
			"Una RAM dedicada usada para almacenar el contenido de OAM. <br /><br />En la NEEES, son `256` bytes que contienen todos los datos de los sprites.",
	},
	"OAM|OAM table": {
		also: {
			es: "OAM|Tabla OAM",
		},
		icon: "🛸📖",
		version: 1,
		en: "_(Object Attribute Memory)_ A list of sprites, stored in OAM RAM.",
		es:
			"_(Object Attribute Memory)_ Una lista de sprites, almacenada en OAM RAM.",
	},
	OAMAddr: {
		icon: "🏠",
		version: 1,
		en:
			"A video register that sets the address inside OAM where the next sprite data will be read or written. <br /><br />It is available at CPU address `$2003`.",
		es:
			"Un registro de video que establece la dirección dentro de OAM donde se leerán o escribirán los datos del próximo sprite. <br /><br />Está disponible en la dirección de CPU `$2003`.",
	},
	OAMData: {
		icon: "📝",
		version: 1,
		en:
			"A video register that reads or writes OAM data at the address pointed by OAMAddr. After each write, OAMAddr is auto-incremented. <br /><br />It is available at CPU address `$2004`.",
		es:
			"Un registro de video que lee o escribe datos OAM en la dirección apuntada por OAMAddr. Luego de cada escritura, OAMAddr es autoincrementada. <br /><br />Está disponible en la dirección de CPU `$2004`.",
	},
	OAMDMA: {
		icon: "⚡",
		version: 1,
		en:
			"A video register that triggers a DMA transfer, copying `256` bytes from CPU memory into OAM to update all sprite data quickly. <br /><br />It is available at CPU address `$4014`.",
		es:
			"Un registro de video que dispara una transferencia DMA, copiando `256` bytes desde la memoria de CPU hacia OAM para actualizar todos los datos de sprites rápidamente. <br /><br />Está disponible en la dirección de CPU `$4014`.",
	},
	"Opcode|_Opcodes": {
		icon: "🔢",
		version: 1,
		en:
			"_(Operation code)_ A number that, inside the machine code, represents an instruction code. <br /><br />In the NEEES, it defines both the instruction and the addressing mode.",
		es:
			"_(Operation code)_ Un número que, dentro del código máquina, define un código de instrucción. <br /><br />En la NEEES, define tanto la instrucción como el modo de direccionamiento.",
	},
	"Overflow Flag": {
		also: {
			es: "Bandera Overflow",
		},
		icon: "🏁",
		version: 1,
		en:
			"A CPU flag that indicates when an arithmetic operation produces a result outside the signed range that can be represented with the available number of bits.",
		es:
			"Una bandera de CPU que indica cuando una operación aritmética produce un resultado fuera del rango con signo que se puede representar con el número de bits disponibles.",
	},
	"Palette id|Palette index|_Palette indexes": {
		also: {
			es:
				"Índice de paleta|_Índices de paleta|_Índice de la paleta|_Índices de la paleta|Id de paleta|_Id de la paleta",
		},
		icon: "🎨",
		version: 1,
		en:
			"The index of a palette inside Palette RAM. Background and sprites use different sets. Ranges from `0` to `7`.",
		es:
			"El índice de una paleta dentro de Palette RAM. El fondo y los sprites usan conjuntos distintos. Va de `0` a `7`.",
	},
	"Palette RAM": {
		icon: "🐏",
		version: 1,
		en:
			"A small RAM area used to store palettes. <br /><br />In the NEEES, it holds `32` bytes for background and sprite color indexes.",
		es:
			"Una pequeña área de RAM usada para almacenar paletas. <br /><br />En la NEEES, contiene `32` bytes para los índices de color de fondo y sprites.",
	},
	"Palette|_Palettes": {
		also: {
			es: "Paleta|_Paletas",
		},
		icon: "🎨",
		version: 1,
		en:
			"A list of `4` colors, stored in Palette RAM, where each color is a pointer to the master palette. <br /><br />There are `8` palettes: `4` for the background and `4` for sprites.",
		es:
			"Una lista de `4` colores, almacenada en Palette RAM, donde cada color es un puntero a la paleta maestra. <br /><br />Hay `8` paletas: `4` para el fondo y `4` para sprites.",
	},
	"Pattern table id": {
		also: {
			es: "Id de pattern table|_Id de la pattern table",
		},
		icon: "👾",
		version: 1,
		en:
			"The index of a pattern table. There are `2`: `$PPU $0000` (`0`) and `$PPU $1000` (`1`).",
		es:
			"El índice de una pattern table. Hay `2`: `$PPU $0000` (`0`) y `$PPU $1000` (`1`).",
	},
	"Pattern table|_Pattern tables": {
		icon: "🕊️📖",
		version: 1,
		en: "A list of tiles stored in CHR-ROM or CHR-RAM.",
		es: "Una lista de tiles almacenada en CHR-ROM o CHR-RAM.",
	},
	Period: {
		also: {
			es: "Período",
		},
		icon: "⏱️",
		version: 1,
		en:
			"The time it takes for a wave to complete one full repetition, measured in seconds. <br /><br />It is the inverse of the frequency.",
		es:
			"El tiempo que tarda una onda en completar una repetición completa, medido en segundos. <br /><br />Es el inverso de la frecuencia.",
	},
	"Pixel|_Pixels": {
		also: {
			es: "Píxel|_Píxeles",
		},
		icon: "🔲",
		version: 1,
		en: "The smallest dot on the screen that can display a single color.",
		es: "El punto más pequeño en la pantalla que puede mostrar un solo color.",
	},
	PPU: {
		icon: "🖥️",
		version: 1,
		en:
			"The _Picture Processing Unit_. It draws graphics by putting pixels on the screen.",
		es:
			"La _Unidad de Procesamiento de Imagen_. Dibuja gráficos poniendo píxeles en la pantalla.",
	},
	"PPU address|_PPU addresses|$PPU|PPU memory": {
		also: {
			es:
				"Dirección PPU|_Direcciones PPU|_Dirección de PPU|_Direcciones de PPU|_Dirección de la PPU|_Direcciones de la PPU|$PPU|Memoria PPU|_Memoria de PPU|_Memoria de la PPU",
		},
		icon: "🐏",
		version: 1,
		en:
			"A memory address seen from the PPU's address space. <br /><br />In the NEEES, valid addresses go from `$0000` to `$3FFF`, with many regions being mirrored.",
		es:
			"Una dirección de memoria vista desde el espacio de direcciones de la PPU. <br /><br />En la NEEES, las direcciones válidas van de `$0000` a `$3FFF`, con muchas regiones espejadas.",
	},
	"PPU cycle|_PPU cycles": {
		also: {
			es: "Ciclo de PPU|_Ciclos de PPU",
		},
		icon: "🦅",
		version: 1,
		en:
			"The basic timing unit of the PPU; each cycle corresponds to one PPU clock tick and advances its internal state. <br /><br />The PPU runs at `3` times the CPU clock rate. For every CPU cycle, the PPU runs `3` cycles.",
		es:
			"La unidad de tiempo básica de la PPU; cada ciclo corresponde a un tick de reloj de la PPU y avanza su estado interno. <br /><br />La PPU funciona a `3` veces la velocidad de la CPU. Por cada ciclo de CPU, la PPU ejecuta `3` ciclos.",
	},
	"PPU register|_PPU registers|Video register|_Video registers": {
		also: {
			es:
				"Registro de PPU|_Registros de PPU|_Registro PPU|_Registros PPU|Registro de Video|_Registros de Video",
		},
		icon: "🔢",
		version: 1,
		en:
			"A memory-mapped register used to control the PPU or read its state. <br /><br />In the NEEES, they are mapped to addresses `$2000` - `$2007`, and `$4014` (OAMDMA).",
		es:
			"Un registro mapeado en memoria usado para controlar la PPU o leer su estado. <br /><br />En la NEEES, están mapeados en las direcciones `$2000` - `$2007`, y `$4014` (OAMDMA).",
	},
	PPUAddr: {
		icon: "📍",
		version: 1,
		en:
			"A video register that sets the PPU address for future reads or writes. <br /><br />Must be written twice: high byte first, then low byte. <br /><br />It is available at CPU address `$2006`.",
		es:
			"Un registro de video que establece la dirección PPU para futuras lecturas o escrituras. <br /><br />Debe escribirse dos veces: primero el byte alto, luego el byte bajo. <br /><br />Está disponible en la dirección de CPU `$2006`.",
	},
	PPUCtrl: {
		icon: "🎛️",
		version: 1,
		en:
			"A video register that sets basic PPU settings like NMI enable, sprite size, pattern table selection, and name table base. <br /><br />It is available at CPU address `$2000`.",
		es:
			"Un registro de video que configura ajustes básicos de la PPU como la habilitación de NMI, el tamaño de los sprites, la selección de pattern tables y la name table base. <br /><br />Está disponible en la dirección de CPU `$2000`.",
	},
	PPUData: {
		icon: "📦",
		version: 1,
		en:
			"A video register that reads or writes a byte of data from/to the PPU address pointed by PPUAddr. After each read/write, PPUAddr is auto-incremented. <br /><br />It is available at CPU address `$2007`.",
		es:
			"Un registro de video que lee o escribe un byte de datos desde/hacia la dirección PPU apuntada por PPUAddr. Luego de cada lectura/escritura, PPUAddr es autoincrementada. <br /><br />Está disponible en la dirección de CPU `$2007`.",
	},
	PPUMask: {
		icon: "🎭",
		version: 1,
		en:
			"A video register used to enable or disable parts of the background and sprites, as well as apply color effects like grayscale or emphasis. <br /><br />It is available at CPU address `$2001`.",
		es:
			"Un registro de video usado para habilitar o deshabilitar partes del fondo y los sprites, además de aplicar efectos de color como escala de grises o énfasis. <br /><br />Está disponible en la dirección de CPU `$2001`.",
	},
	PPUScroll: {
		icon: "📜",
		version: 1,
		en:
			"A video register that sets the background scroll position. <br /><br />Written twice per frame: once for X scroll, once for Y. <br /><br />It is available at CPU address `$2005`.",
		es:
			"Un registro de video que establece la posición de scrolling del fondo. <br /><br />Se escribe dos veces por frame: una para el scrolling horizontal, otra para el vertical. <br /><br />Está disponible en la dirección de CPU `$2005`.",
	},
	PPUStatus: {
		icon: "📊",
		version: 1,
		en:
			"A video register that shows whether the PPU is in VBlank, if sprite zero hit occurred, or if there's sprite overflow. Reading it also resets internal latches. <br /><br />It is available at CPU address `$2002`.",
		es:
			"Un registro de video que muestra si la PPU está en VBlank, si ocurrió un sprite-zero hit, o si hay sprite overflow. Leerlo también reinicia latches internos. <br /><br />Está disponible en la dirección de CPU `$2002`.",
	},
	"Pre-line": {
		icon: "🌠",
		version: 1,
		en:
			'A non-visible scanline where the PPU gets things ready for the upcoming frame. Also called "_scanline -1_".',
		es:
			'Una scanline no visible en la que la PPU prepara todo para el próximo frame. También se la llama "_scanline -1_".',
	},
	"PRG-RAM": {
		icon: "🔋",
		version: 1,
		en:
			"_(Program RAM)_ A battery-backed RAM chip that contains the save file, inside the cartridge.",
		es:
			"_(Program RAM)_ Un chip de RAM (alimentado a batería) que contiene la partida, dentro del cartucho.",
	},
	"PRG-ROM": {
		icon: "🤖",
		version: 1,
		en:
			"_(Program ROM)_ A ROM chip that contains the game code, inside the cartridge.",
		es:
			"_(Program ROM)_ Un chip de ROM que contiene el código del juego, dentro del cartucho.",
	},
	"Pulse Channel|_Pulse Channels": {
		also: {
			es: "Canal Pulso|_Canales Pulso",
		},
		icon: "🟦",
		version: 1,
		en:
			"One of the APU's audio channels. It plays pulse waves with adjustable duty cycles and pitch. <br /><br />The NEEES has two of these.",
		es:
			"Uno de los canales de audio de la APU. Reproduce ondas de pulso con ciclos de trabajo y tono ajustables. <br /><br />La NEEES tiene dos de estos.",
	},
	"Pulse wave|_Pulse waves": {
		also: {
			es: "Onda de pulso|_Ondas de pulso",
		},
		icon: "🟦",
		version: 1,
		en:
			"A waveform that alternates between two levels, creating a sharp, blocky sound. Used by the APU's Pulse Channels. <br /><br />It looks like this:<br />`_——__—_——_`",
		es:
			"Una forma de onda que alterna entre dos niveles, generando un sonido fuerte y entrecortado. Usada por los Canales Pulso de la APU. <br /><br />Se ve así:<br />`_——__—_——_`",
	},
	"Pulse1Control|PulseControl": {
		icon: "🟦",
		version: 1,
		en:
			"An audio register that configures the first Pulse Channel's duty cycle, envelope, and volume. <br /><br />It is available at CPU address `$4000`.",
		es:
			"Un registro de audio que configura el ciclo de trabajo, la envolvente y el volumen del primer Canal Pulso. <br /><br />Está disponible en la dirección de CPU `$4000`.",
	},
	"Pulse1Sweep|PulseSweep": {
		icon: "🧹",
		version: 1,
		en:
			"An audio register that sets up the first pulse channel's frequency sweep (rate, direction, and shift count). <br /><br />It is available at CPU address `$4001`.",
		es:
			"Un registro de audio que ajusta el barrido de frecuencia (velocidad, dirección y desplazamiento) del primer Canal Pulso. <br /><br />Está disponible en la dirección de CPU `$4001`.",
	},
	"Pulse1TimerHighLCL|PulseTimerHighLCL": {
		icon: "🕛",
		version: 1,
		en:
			"An audio register holding the high byte of the first Pulse Channel's timer and loading its length counter (which also starts the envelope). <br /><br />It is available at CPU address `$4003`.",
		es:
			"Un registro de audio que contiene el byte alto del timer del primer Canal Pulso y carga su contador de longitud (que además inicia la envolvente). <br /><br />Está disponible en la dirección de CPU `$4003`.",
	},
	"Pulse1TimerLow|PulseTimerLow": {
		icon: "🕡",
		version: 1,
		en:
			"An audio register holding the low byte of the first Pulse Channel's timer, which determines its pitch. <br /><br />It is available at CPU address `$4002`.",
		es:
			"Un registro de audio que contiene el byte bajo del timer del primer Canal Pulso, que determina su tono. <br /><br />Está disponible en la dirección de CPU `$4002`.",
	},
	Pulse2Control: {
		icon: "🟦",
		version: 1,
		en:
			"An audio register that configures the second Pulse Channel's duty cycle, envelope, and volume. <br /><br />It is available at CPU address `$4004`.",
		es:
			"Un registro de audio que configura el ciclo de trabajo, la envolvente y el volumen del segundo Canal Pulso. <br /><br />Está disponible en la dirección de CPU `$4004`.",
	},
	Pulse2Sweep: {
		icon: "🧹",
		version: 1,
		en:
			"An audio register that sets up the second Pulse Channel's frequency sweep (rate, direction, and shift count). <br /><br />It is available at CPU address `$4005`.",
		es:
			"Un registro de audio que ajusta el barrido de frecuencia (velocidad, dirección y desplazamiento) del segundo Canal Pulso. <br /><br />Está disponible en la dirección de CPU `$4005`.",
	},
	Pulse2TimerHighLCL: {
		icon: "🕛",
		version: 1,
		en:
			"An audio register holding the high byte of the second Pulse Channel's timer and loading its length counter (which also starts the envelope). <br /><br />It is available at CPU address `$4007`.",
		es:
			"Un registro de audio que contiene el byte alto del timer del segundo Canal Pulso y carga su contador de longitud (que además inicia la envolvente). <br /><br />Está disponible en la dirección de CPU `$4007`.",
	},
	Pulse2TimerLow: {
		icon: "🕡",
		version: 1,
		en:
			"An audio register holding the low byte of the second Pulse Channel's timer, which determines its pitch. <br /><br />It is available at CPU address `$4006`.",
		es:
			"Un registro de audio que contiene el byte bajo del timer del segundo Canal Pulso, que determina su tono. <br /><br />Está disponible en la dirección de CPU `$4006`.",
	},
	"Quarter frame|Quarter-frame|Quarter|_Quarter frames|_Quarter-frames|_Quarters": {
		icon: "🕒",
		version: 1,
		en:
			"An event in the frame sequencer that occurs at each quarter of its sequence, triggering envelope and linear length counter updates.",
		es:
			"Un evento de temporización en el secuenciador de frames que ocurre en cada cuarto de su secuencia, activando las actualizaciones de envolvente y contador lineal de longitud.",
	},
	"Register|_Registers": {
		also: {
			es: "Registro|_Registros",
		},
		icon: "🔣",
		version: 1,
		en:
			"A storage location used during program execution. <br /><br />See also: CPU register, Memory-mapped register.",
		es:
			"Una ubicación de almacenamiento usada durante la ejecución de un programa. <br /><br />Ver también: Registro de CPU, Registro mapeado en memoria.",
	},
	"Sample rate|_Sample rates": {
		also: {
			es: "Frecuencia de muestreo|_Frecuencias de muestreo",
		},
		icon: "💨",
		version: 1,
		en:
			"The number of samples taken per second to represent a sound. Measured in hertz (`Hz`).",
		es:
			"La cantidad de samples tomados por segundo para representar un sonido. Se mide en hertz (`Hz`).",
	},
	"Scanline|_Scanlines": {
		icon: "🌠",
		version: 1,
		en:
			"A single horizontal line of pixels drawn on the screen. The PPU draws one scanline at a time, from top to bottom, until the whole frame is complete.",
		es:
			"Una línea horizontal de píxeles dibujada en la pantalla. La PPU dibuja una scanline a la vez, de arriba hacia abajo, hasta completar todo el frame.",
	},
	Scrolling: {
		icon: "📜",
		version: 1,
		en:
			"A PPU feature that allows developers to move the background by adjusting the visible portion of the name table.",
		es:
			"Una función de la PPU que permite a los desarrolladores mover el fondo ajustando la porción visible de la name table.",
	},
	"Sequencer|Frame sequencer|Frame counter": {
		also: {
			es: "Secuenciador|Secuenciador de Frames|Contador de Frames",
		},
		icon: "🔀",
		version: 1,
		en:
			"An internal APU unit that cycles through four- or five-step patterns to generate timing signals for envelopes, sweeps, and length counters.",
		es:
			"Una unidad interna de la APU que cicla por patrones de cuatro o cinco pasos para generar señales de tiempo para envolventes, barridos y contadores de longitud.",
	},
	"Sprite evaluation": {
		also: {
			es: "Evaluación de sprites",
		},
		icon: "🕵️",
		version: 1,
		en:
			"A step performed on each scanline where the PPU checks which sprites should be rendered. It scans all entries in OAM and selects up to `8` sprites whose vertical position matches the current scanline. <br /><br />If more than `8` sprites are found, the sprite overflow flag is set.",
		es:
			"Un paso que se realiza en cada scanline donde la PPU determina qué sprites deben renderizarse. Escanea todas las entradas en OAM y selecciona hasta `8` sprites cuya posición vertical coincida con la scanline actual. <br /><br />Si se encuentran más de `8` sprites, se enciende la bandera de sprite overflow.",
	},
	"Sprite id|OAM id|OAM index|_OAM indexes": {
		also: {
			es:
				"OAM id|Índice OAM|_Índices OAM|Id de OAM|Id de sprite|_Id del sprite",
		},
		icon: "🛸",
		version: 1,
		en: "The index of a sprite inside OAM. It ranges from `0` to `63`.",
		es: "El índice de un sprite dentro de OAM. Va de `0` a `63`.",
	},
	"Sprite overflow": {
		icon: "🏁",
		version: 1,
		en:
			"A condition that occurs when more than `8` sprites appear on the same scanline. Only the first `8` are rendered. <br /><br />Games can retrieve this flag by reading bit `5` of PPUStatus.",
		es:
			"Una condición que ocurre cuando más de `8` sprites aparecen en la misma scanline. Solo se renderizan los primeros `8`. <br /><br />Los juegos pueden leer esta bandera desde el bit `5` de PPUStatus.",
	},
	"Sprite zero|_Sprite-zero": {
		also: {
			es: "Sprite cero|_Sprite-cero|_Sprite zero|Sprite-zero",
		},
		icon: "🛸",
		version: 1,
		en:
			"The sprite with OAM index `0`. It has special behavior in the PPU, such as triggering the sprite-zero hit when it overlaps the background.",
		es:
			"El sprite con índice OAM `0`. Tiene un comportamiento especial en la PPU, como activar el sprite-zero hit cuando se superpone con el fondo.",
	},
	"Sprite-zero hit|_Sprite zero hit|_Sprite-zero hits": {
		also: {
			es: "Sprite zero hit|_Sprite-zero hit|_Sprite-zero hits",
		},
		icon: "👊",
		version: 1,
		en:
			"A condition that occurs when a visible pixel of the sprite zero overlaps a visible background pixel. When this happens, the PPU sets the sprite-zero hit flag in PPUStatus. <br /><br />Games often use it to time mid-frame effects like status bars or split screens.",
		es:
			"Una condición que ocurre cuando un píxel visible del sprite cero se superpone con un píxel visible del fondo. Cuando eso pasa, la PPU enciende la bandera de sprite-zero hit en PPUStatus. <br /><br />Los juegos suelen usarla para sincronizar efectos a mitad de frame como barras de estado o pantallas divididas.",
	},
	"Sprite|_Sprites": {
		icon: "🛸",
		version: 1,
		en:
			"A game object on top (or behind!) of the background that can be moved or flipped, stored in OAM. It can use one tile (`8x8` sprite) or two (`8x16` sprite).",
		es:
			"Un objeto del juego encima (¡o detrás!) del fondo que puede ser movido o volteado, almacenado en OAM. Puede usar un tile (sprite de `8x8`) o dos (sprite de `8x16`).",
	},
	"Square wave|_Square waves": {
		also: {
			es: "Onda cuadrada|_Ondas cuadradas",
		},
		icon: "⏹️",
		version: 1,
		en: "A pulse wave with a duty cycle of `50%`.",
		es: "Una onda de pulso con un ciclo de trabajo de `50%`.",
	},
	Stack: {
		also: {
			es: "Pila",
		},
		icon: "🧱",
		version: 1,
		en:
			"A LIFO _(Last In, First Out)_ structure which programs can use to store values. The current depth is measured by [SP]. <br /><br />In the NEEES, the stack lives in WRAM between addresses `$0100` and `$01FF`.",
		es:
			"Una estructura LIFO _(Last In, First Out)_ que los programas usan para almacenar valores. La longitud actual es medida por el [SP]. <br /><br />En la NEEES, la pila vive en WRAM entre las direcciones `$0100` y `$01FF`.",
	},
	"Tile id": {
		also: {
			es:
				"Id de tile|_Id del tile|_Índice de tile|_Índice del tile|_Índices de tiles",
		},
		icon: "🕊️",
		version: 1,
		en:
			"The index of a tile inside a pattern table. It ranges from `0` to `255`.",
		es: "El índice de un tile dentro de una pattern table. Va de `0` a `255`.",
	},
	"Tile|_Tiles": {
		icon: "🕊️",
		version: 1,
		en:
			"An `8x8` grayscale pixel grid that represents a pattern. Tiles are stored in pattern tables.",
		es:
			"Una cuadrícula de `8x8` píxeles en escala de grises que representa un patrón. Los tiles se almacenan en pattern tables.",
	},
	"Timer|_Timers": {
		icon: "📡",
		version: 1,
		en:
			"A value that sets an APU channel's oscillation rate by determining how many master-clock ticks occur between waveform steps. <br /><br />It determines the frequency, thus the pitch of the note.",
		es:
			"Un valor que establece la tasa de oscilación de un canal APU determinando cuántos ciclos de reloj maestro pasan entre pasos de la forma de onda. <br /><br />Determina la frecuencia, y en consecuencia el tono de una nota.",
	},
	"Triangle Channel": {
		also: {
			es: "Canal Triangular",
		},
		icon: "🔺",
		version: 1,
		en:
			"One of the APU's audio channels. It plays a triangle wave with fixed volume and shape, often used for bass or melodic lines.",
		es:
			"Uno de los canales de audio de la APU. Reproduce una onda triangular con volumen y forma fijos, comúnmente usado para graves o melodías.",
	},
	"Triangle wave|_Triangle waves": {
		also: {
			es: "Onda triangular|_Ondas triangulares",
		},
		icon: "🔺",
		version: 1,
		en:
			"A waveform shaped like a triangle, with a softer, more mellow sound. Used by the APU's Triangle Channel. <br /><br />It looks like this:<br />`/\\/\\/\\/\\`",
		es:
			"Una forma de onda con forma de triángulo, que produce un sonido más suave y apagado. Usada por el Canal Triangular de la APU. <br /><br />Se ve así:<br />`/\\/\\/\\/\\`",
	},
	TriangleLengthControl: {
		icon: "📏",
		version: 1,
		en:
			"An audio register that sets the Triangle Channel's linear length counter reload value and controls its length counter halt. <br /><br />It is available at CPU address `$4008`.",
		es:
			"Un registro de audio que establece el valor de recarga del contador lineal de longitud del Canal Triangular y controla la detención del contador de longitud. <br /><br />Está disponible en la dirección de CPU `$4008`.",
	},
	TriangleTimerHighLCL: {
		icon: "🕛",
		version: 1,
		en:
			"An audio register holding the high byte of the Triangle Channel's timer and loading its length counter. <br /><br />It is available at CPU address `$400B`.",
		es:
			"Un registro de audio que contiene el byte alto del timer del Canal Triangular y carga su contador de longitud. <br /><br />Está disponible en la dirección de CPU `$400B`.",
	},
	TriangleTimerLow: {
		icon: "🕡",
		version: 1,
		en:
			"An audio register holding the low byte of the Triangle Channel's timer, which sets its frequency. <br /><br />It is available at CPU address `$400A`.",
		es:
			"Un registro de audio que contiene el byte bajo del timer del Canal Triangular, que define su frecuencia. <br /><br />Está disponible en la dirección de CPU `$400A`.",
	},
	"VBlank|Vertical Blank": {
		icon: "🏝️",
		version: 1,
		en:
			"Longer period after the last scanline of a frame, where the PPU is idle before starting a new frame. It's the best time to update graphics safely.",
		es:
			"Período más largo después de la última scanline de un frame, donde la PPU queda inactiva antes de comenzar uno nuevo. Es el mejor momento para actualizar gráficos sin problemas.",
	},
	VDraw: {
		icon: "🖍️",
		version: 1,
		en:
			"The period when the PPU is actively drawing the frame, scanline by scanline. It starts after the pre-line and ends before VBlank.",
		es:
			"El período en el que la PPU está dibujando activamente el frame, scanline por scanline. Comienza después de la pre-line y termina antes del VBlank.",
	},
	"Video register|_Video registers": {
		also: {
			es: "Registro de video|_Registros de video",
		},
		icon: "📺",
		version: 1,
		en:
			"A memory-mapped register that the PPU uses to control rendering and expose its internal state.",
		es:
			"Un registro mapeado en memoria que la PPU usa para controlar el renderizado y exponer su estado interno.",
	},
	"Volume envelope|_Volume envelopes|Envelope|_Envelopes": {
		also: {
			es:
				"Envolvente de volumen|_Envolventes de volumen|Envolvente|_Envolventes",
		},
		icon: "📉",
		version: 1,
		en:
			"A mechanism that automatically adjusts a channel's output volume over time according to its rate and loop settings. <br /><br />It's used to produce _fade out_ effects.",
		es:
			"Un mecanismo que ajusta automáticamente el volumen de salida de un canal a lo largo del tiempo según sus opciones de tasa y bucle. <br /><br />Se usa para producir efectos de _desvanecimiento_.",
	},
	VRAM: {
		icon: "🐏",
		version: 1,
		en:
			"_(Video RAM)_ A RAM chip of `2` KiB that lives in the PPU. It holds name tables.",
		es:
			"_(Video RAM)_ Un chip de RAM de `2` KiB que vive en la PPU. Almacena name tables.",
	},
	Waveform: {
		also: {
			es: "Forma de onda|_Formas de onda",
		},
		icon: "♒",
		version: 1,
		en:
			"The general shape of a wave over time. Common waveforms include sine, square, triangle, and sawtooth.",
		es:
			"La forma general de una onda a lo largo del tiempo. Las formas comunes incluyen seno, cuadrada, triangular y diente de sierra.",
	},
	WRAM: {
		icon: "🐏",
		version: 1,
		en:
			"_(Work RAM)_ A RAM chip of `2` KiB that lives in the CPU. General purpose.",
		es:
			"_(Work RAM)_ Un chip de RAM de `2` KiB que vive en la CPU. Propósito general.",
	},
	"Zero Flag": {
		also: {
			es: "Bandera Zero",
		},
		icon: "🏁",
		version: 1,
		en: "A CPU flag that indicates when the result of an operation is `0`.",
		es:
			"Una bandera de CPU que indica cuando el resultado de una operación es `0`.",
	},
	"Zero Page|First page": {
		also: {
			es: "Página Cero|Primera página",
		},
		icon: "🐏",
		version: 1,
		en:
			"The first `256` bytes of WRAM, located in addresses `$0000` - `$00FF`.",
		es:
			"Los primeros `256` bytes de WRAM, ubicados en las direcciones `$0000` - `$00FF`.",
	},
};
