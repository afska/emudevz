import escapeStringRegexp from "escape-string-regexp";
import { marked } from "marked";
import _ from "lodash";
import locales from "../locales";
import { toast } from "../utils";

const dictionary = {
	entries: {
		"[A]": {
			icon: "🔢",
			en:
				"_(Accummulator Register)_ A CPU register used to store the result of arithmetic and logic operations.",
			es:
				"_(Registro Acumulador)_ Un registro de CPU usado para almacenar el resultado de operaciones aritméticas y lógicas.",
		},
		"[X]": {
			icon: "🔢",
			en:
				"_(X Register)_ A CPU register used to index memory and control loops.",
			es:
				"_(Registro X)_ Un registro de CPU usado para indexar memoria y controlar ciclos.",
		},
		"[Y]": {
			icon: "🔢",
			en: "_(Y Register)_ A CPU register used for indexing and comparisons.",
			es:
				"_(Registro Y)_ Un registro de CPU usado para indexar memoria y hacer comparaciones.",
		},
		"[SP]": {
			icon: "🔢",
			en:
				"_(Stack Pointer)_ A CPU register used to track the top of the stack.",
			es:
				"_(Puntero de Pila)_ Un registro de CPU usado para localizar la cima de la pila.",
		},
		"[PC]": {
			icon: "🔢",
			en:
				"_(Program Counter)_ A CPU register used to store the address of the next instruction to execute.",
			es:
				"_(Contador de Programa)_ Un registro de CPU usado para almacenar la dirección de la próxima instrucción a ejecutar.",
		},
		"Address space": {
			also: { es: "Espacio de direcciones" },
			icon: "🐏",
			en:
				"The full range of memory addresses a component is able to access directly. <br /><br />In the NEEES, the CPU and the PPU each have their own address space. <br /><br />We differentiate these two spaces by saying `CPU address $xxxx` or `PPU address $xxxx`.",
			es:
				"El rango completo de direcciones de memoria que un componente puede acceder directamente. <br /><br />En la NEEES, tanto la CPU como la PPU tienen su propio espacio de direcciones. <br /><br />Distinguimos estos espacios diciendo `dirección CPU $xxxx` o `dirección PPU $xxxx`.",
		},
		"Addressing mode|_Addressing modes": {
			also: { es: "Modo de direccionamiento|_Modos de direccionamiento" },
			icon: "📍",
			en: "A way for an instruction to specify where its data is located.",
			es:
				"Una forma que tiene una instrucción de especificar dónde está el dato que necesita.",
		},
		APU: {
			icon: "🔊",
			en:
				"The _Audio Processing Unit_. It handles sound, producing audio waves.",
			es:
				"La _Unidad de Procesamiento de Audio_. Maneja el sonido, produciendo ondas de audio.",
		},
		"APU register|_APU registers": {
			also: { es: "Registro de APU|_Registros de APU" },
			icon: "🔢",
			en:
				"A memory-mapped register used to control sound channels or volume. <br /><br />In the NEEES, they are mapped to addresses `$4000` - `$4013`, and `$4015` (APUControl / APUStatus).",
			es:
				"Un registro mapeado en memoria usado para controlar los canales de sonido o el volumen. <br /><br />En la NEEES, están mapeados en las direcciones `$4000` - `$4013`, y `$4015` (APUControl / APUStatus).",
		},
		Assembly: {
			also: { es: "Ensamblador" },
			icon: "🔨",
			en:
				"A low-level programming language that maps very closely to the machine code understood by the CPU.",
			es:
				"Un lenguaje de programación de bajo nivel que se asemeja mucho al código máquina que la CPU entiende.",
		},
		"Assembly code": {
			also: { es: "Código ensamblador" },
			icon: "🔨",
			en: "Code written in assembly language.",
			es: "Código escrito en lenguaje ensamblador.",
		},
		"Attribute table|Attribute tables": {
			icon: "🖍️📖",
			en:
				"A map of palette indexes for backgrounds, stored at the end of each name table.",
			es:
				"Un mapa de índices de paleta para fondos, almacenado al final de cada name table.",
		},
		"Background|_Backgrounds": {
			also: { es: "Fondo|_Fondos" },
			icon: "🏞️",
			en: "A static image behind the sprites, stored in a name table.",
			es:
				"Una imagen estática detrás de los sprites, almacenada en una name table.",
		},
		BrokenNEEES: {
			icon: "🕹️",
			en:
				"A NEEES emulator found online. It's buggy as hell, but has a modular design, so components like Cartridge, CPU, PPU and APU can be replaced.",
			es:
				"Un emulador de NEEES encontrado en línea. Está lleno de bugs, pero tiene un diseño modular, por lo que se le pueden reemplazar componentes como el Cartucho, la CPU, PPU y APU.",
		},
		"Carry Flag": {
			also: { es: "Bandera Carry" },
			icon: "🏁",
			en:
				"A CPU flag that indicates when an arithmetic operation has produced a _carry_. <br /><br />In the NEEES, that happens when the result exceeds the 8-bit capacity (`255` for unsigned numbers).",
			es:
				"Una bandera de CPU que indica cuando una operación aritmética produjo un _carry_. <br /><br />En la NEEES, esto ocurre cuando el resultado sobrepasa el límite de 8 bits (`255` para números sin signo).",
		},
		"Cartridge|_Cartridges": {
			also: { es: "Cartucho|_Cartuchos" },
			icon: "💾",
			en:
				"A removable piece of hardware that contains the all the game chips, such as PRG-ROM, CHR-ROM, PRG-RAM, and the Mapper.",
			es:
				"Una pieza de hardware removible que contiene todos los chips del juego, como PRG-ROM, CHR-ROM, PRG-RAM, y el Mapper.",
		},
		"CHR-RAM": {
			icon: "👾",
			en:
				"_(Character RAM)_ A RAM chip where some games write their graphics through code. Some cartridges use this type of memory instead of CHR-ROM.",
			es:
				"_(Character RAM)_ Un chip de RAM donde algunos juegos escriben sus gráficos vía código. Algunos cartuchos usan este tipo de memoria en lugar de CHR-ROM.",
		},
		"CHR-ROM": {
			icon: "👾",
			en:
				"_(Character ROM)_ A ROM chip that contains the game graphics, inside the cartridge.",
			es:
				"_(Character ROM)_ Un chip de ROM que contiene los gráficos del juego, dentro del cartucho.",
		},
		"Color index|_Color indexes": {
			also: { es: "Índice de color|_Índices de color" },
			icon: "🎨",
			en:
				"A number inside a tile pixel that selects a color from the palette. It ranges from `0` to `3`. <br /><br />In sprites, index `0` is always transparent.",
			es:
				"Un número dentro de un píxel de tile que selecciona un color de la paleta. Va de `0` a `3`. <br /><br />En los sprites, el índice `0` siempre es transparente.",
		},
		"Controller|_Controllers": {
			also: { es: "Mando|_Mandos" },
			icon: "🎮",
			en:
				"An 8-button gamepad (_D-pad + A,B + START,SELECT_). <br /><br />The NEEES accepts _(without extra hardware)_ up to two controllers.",
			es:
				"Un joystick de 8 botones (_D-pad + A,B + START,SELECT_). <br /><br />La NEEES acepta _(sin hardware extra)_ hasta dos mandos.",
		},
		CPU: {
			icon: "🧠",
			en:
				"The _Central Processing Unit_. It reads games' code and executes their instructions.",
			es:
				"La _Unidad Central de Procesamiento_. Lee el código de los juegos y ejecuta sus instrucciones.",
		},
		"CPU address|_CPU addresses|CPU $": {
			also: { es: "Dirección CPU|_Direcciones CPU|CPU $" },
			icon: "🐏",
			en:
				"A memory address seen from the CPU's address space. <br /><br />In the NEEES, the CPU can access addresses from `$0000` to `$FFFF` (`64` KiB).",
			es:
				"Una dirección de memoria vista desde el espacio de direcciones de la CPU. <br /><br />En la NEEES, la CPU puede acceder a direcciones entre `$0000` y `$FFFF` (`64` KiB).",
		},
		"CPU flag|_CPU flags": {
			also: { es: "Bandera de CPU|_Banderas de CPU" },
			icon: "🏁",
			en: "A flag stored using one bit inside the Flags Register.",
			es:
				"Una bandera almacenada usando un bit dentro del Registro de Banderas.",
		},
		"CPU interrupt|_CPU interrupts|Interrupt|_Interrupts": {
			also: {
				es:
					"Interrupción de CPU|_Interrupciones de CPU|Interrupción|_Interrupciones",
			},
			icon: "✋",
			en:
				"A signal that pauses the current program in order to handle a specific events. <br /><br />When such an event happens, the CPU saves its state ([PC] and flags register) in the stack and jumps to the vector associated with that event. <br /><br />After handling the event, the execution usually returns to where it was left off.",
			es:
				"Una señal que pausa el programa actual para manejar un evento específico. <br /><br />Cuando tal evento ocurre, la CPU guarda su estado ([PC] y registro de banderas) en la pila y salta al vector asociado con ese evento. <br /><br />Luego de manejar el evento, la ejecución suele continuar desde donde se interrumpió.",
		},
		"CPU register|_CPU registers|Register|_Registers": {
			also: { es: "Registro de CPU|_Registros de CPU|Registro|_Registros" },
			icon: "🔢",
			en:
				"A small, fast storage location inside the CPU used to hold data temporarily (like numbers, memory addresses, or results of operations) while it's working. <br /><br />In the NEEES, each register can hold a single byte (`8` bits) of data, with the exception of [PC] which is `2` bytes wide.",
			es:
				"Una ubicación pequeña y de rápido acceso dentro de la CPU usada para almacenar datos temporalmente (como números, direcciones de memoria, o resultados de operaciones) mientras está operando. <br /><br />En la NEEES, cada registro puede almacenar un solo byte (`8` bits) de datos, con la excepción de [PC] que ocupa `2` bytes.",
		},
		"Cycle|_Cycles": {
			also: { es: "Ciclo|_Ciclos" },
			icon: "🚲",
			en:
				"A unit used to measure time in the system. The CPU, PPU, and APU all do work cycle by cycle. <br /><br />The duration of a cycle depends on the speed of each unit.",
			es:
				"Una unidad usada para medir el tiempo en el sistema. La CPU, la PPU y la APU hacen su trabajo ciclo a ciclo. <br /><br />La duración de un ciclo depende de la velocidad de cada unidad.",
		},
		"DMA|DMA transfer": {
			also: { es: "DMA|Transferencia DMA" },
			icon: "⚡",
			en:
				"_(Direct Memory Access)_ A mechanism that copies data from one memory area to another without using the CPU to move each byte manually. <br /><br />In the NEEES, DMA is only available to transfer OAM data through the OAMDMA register.",
			es:
				"_(Direct Memory Access)_ Un mecanismo que copia datos de una zona de memoria a otra sin que la CPU tenga que mover cada byte manualmente. <br /><br />En la NEEES, el DMA solo está disponible para transferir datos de OAM usando el registro OAMDMA.",
		},
		"Flag|_Flags": {
			also: { es: "Bandera|_Banderas" },
			icon: "🏁",
			en:
				"A field that stores a value that can be either `true` or `false`. <br /><br />See also: CPU Flag.",
			es:
				"Un campo que almacena un valor que puede ser `true` o `false`. <br /><br />Ver también: Bandera de CPU.",
		},
		"Flags Register": {
			also: { es: "Registro de Banderas" },
			icon: "🔢",
			en: "A CPU register used to store multiple CPU flags.",
			es: "Un registro de CPU usado para almacenar múltiples banderas de CPU.",
		},
		"Frame|_Frames": {
			icon: "🖼️",
			en:
				"A full image drawn on the screen, made of multiple scanlines. <br /><br />In the NEEES, it's 256×240 pixels, and the PPU renders 60 of them per second.",
			es:
				"Una imagen completa dibujada en la pantalla, compuesta por múltiples scanlines. <br /><br />En la NEEES, mide 256×240 píxeles, y la PPU renderiza 60 por segundo.",
		},
		"Frame buffer": {
			icon: "🔢",
			en:
				"A block of memory that stores the color of each pixel on the screen. It's where the frame image is built before being displayed.",
			es:
				"Un bloque de memoria que almacena el color de cada píxel en pantalla. Es donde se construye la imagen del frame antes de mostrarse.",
		},
		HBlank: {
			icon: "🏝️",
			en:
				"Short period after each scanline is drawn, where the PPU is idle before starting the next one.",
			es:
				"Período corto después de dibujar cada scanline, donde la PPU queda inactiva antes de comenzar la siguiente.",
		},
		iNEEES: {
			icon: "📝",
			en:
				"A format that describes a NEEES cartridge. It contains its code (PRG-ROM), graphics (CHR-ROM), and a metadata header.",
			es:
				"Un formato que describe un cartucho de NEEES. Contiene su código (PRG-ROM), gráficos (CHR-ROM), y un header con metadatos.",
		},
		"Interrupt vector|_Interrupt vectors|Vector|_Vectors": {
			also: {
				es: "Vector de interrupción|_Vectores de interrupción|Vector|_Vectores",
			},
			icon: "🔢",
			en:
				"A well-known memory address associated with an event that triggers an interrupt.",
			es:
				"Una dirección de memoria conocida asociada a un evento que dispara una interrupción.",
		},
		"Instruction|_Instructions|CPU instruction|_CPU instructions": {
			also: {
				es:
					"Instrucción|_Instrucciones|Instrucción de CPU|_Instrucciones de CPU",
			},
			icon: "📖",
			en:
				"A command that tells the CPU to do something, like adding numbers or jumping to another part of the program.",
			es:
				"Una orden que le dice a la CPU qué hacer, como sumar números o saltar a otra parte del programa.",
		},
		JavaScript: {
			icon: "🗣️",
			en:
				'A programming language created so that websites can proudly announce _"Welcome!"_ via an unstoppable alert box, but some people create emulators with it.',
			es:
				'Un lenguaje de programación creado para que los sitios web puedan anunciar orgullosamente _"¡Bienvenido!"_ mediante una caja de alerta imposible de cerrar, pero algunas personas hacen emuladores con él.',
		},
		"Least significant byte|LSB|Low byte": {
			also: {
				es: "Byte menos significativo|LSB|Low byte",
			},
			icon: "🔢",
			en:
				"The byte with the lowest positional value in a multi-byte number. <br /><br />For example, the LSB of `$AB15` is `$15`.",
			es:
				"El byte con el valor posicional más bajo en un número multibyte. <br /><br />Por ejemplo, el LSB de `$AB15` es `$15`.",
		},
		"Machine code": {
			also: { es: "Código máquina" },
			icon: "🔢",
			en:
				"The bytes that the CPU interpret as code. It's often the product of translating assembly code, written by humans.",
			es:
				"Los bytes que la CPU interpreta cómo código. A menudo es el producto de traducir lenguaje ensamblador escrito por humanos.",
		},
		"Mapper|_Mappers": {
			icon: "🗜️",
			en:
				"A chip in the cartridge that extends what the console can do, like adding more PRG-ROM or CHR-ROM banks or providing features such as switching mirroring types.",
			es:
				"Un chip en el cartucho que extiende lo que la consola puede hacer, como agregar más bancos de PRG-ROM o CHR-ROM, o proporcionar funciones como cambiar el tipo de mirroring.",
		},
		"Master palette": {
			also: { es: "Paleta maestra" },
			icon: "👑🎨",
			en: "A list of 64 colors, hardcoded.",
			es: "Una lista de 64 colores, hardcodeada.",
		},
		"Memory address|_Memory addresses|Address|_Addresses": {
			also: {
				es: "Dirección de memoria|Direcciones de memoria|Dirección|Direcciones",
			},
			icon: "🐏",
			en:
				"A number that represents a location in memory. <br /><br />In the NEEES, they take up `2` bytes, so they can go from `0` (`$0000`) to `65535` (`$FFFF`).",
			es:
				"Un número que representa una ubicación dentro de la memoria. <br /><br />En la NEEES, ocupan `2` bytes, por lo que pueden ir de `0` (`$0000`) a `65535` (`$FFFF`).",
		},
		"Memory bus|_Memory buses": {
			also: { es: "Bus de memoria|_Buses de memoria" },
			icon: "🚌",
			en:
				"The set of connections that link components to memory, enabling them to read or write data.",
			es:
				"El conjunto de conexiones que enlaza los componentes con la memoria, permitiéndoles leer o escribir datos.",
		},
		"Memory-mapped register|_Memory-mapped registers": {
			also: {
				es: "Registro mapeado en memoria|_Registros mapeados en memoria",
			},
			icon: "🐏",
			en:
				"A special memory address used to interact with hardware. Unlike CPU registers, reading or writing to them may trigger hardware behavior rather than just storing a value. <br /><br />In the NEEES, the PPU, APU, Controller, and Mappers expose these addresses so the game code can interact with the units through them.",
			es:
				"Una dirección de memoria especial usada para interactuar con el hardware. A diferencia de los registros de CPU, leer o escribir en ellos puede activar comportamientos del hardware en lugar de simplemente almacenar un valor. <br /><br />En la NEEES, la PPU, la APU, el Mando y los Mappers exponen estas direcciones para que el código del juego pueda comunicarse con ellos.",
		},
		"Memory mirror|_Memory mirrors|Mirror|_Mirrors": {
			also: { es: "Espejo de memoria|_Espejos de memoria|Espejo|_Espejos" },
			icon: "🚽",
			en:
				"A copy of a memory region that appears at another address. They are used to fill unused address space or to provide alternative access points. <br /><br />In the NEEES, many CPU and PPU regions are mirrored across the address space. <br /><br />See also: Mirroring.",
			es:
				"Una copia de una región de memoria que aparece en otra dirección. Se usan para llenar espacio sin usar o para ofrecer accesos alternativos. <br /><br />En la NEEES, muchas regiones de la CPU y la PPU están espejadas a lo largo del espacio de direcciones. <br /><br />Ver también: Mirroring.",
		},
		Mirroring: {
			icon: "🚽",
			en:
				"The mirroring type affects the screen arrangement and how the game will handle scrolling. <br /><br />See also: Memory mirror.",
			es:
				"El tipo de mirroring afecta la disposición de la pantalla y cómo el juego maneja el scrolling. <br /><br />Ver también: Espejo de memoria",
		},
		"Most significant byte|MSB|High byte": {
			also: {
				es: "Byte más significativo|MSB|High byte",
			},
			icon: "🔢",
			en:
				"The byte with the highest positional value in a multi-byte number. <br /><br />For example, the MSB of `$AB15` is `$AB`.",
			es:
				"El byte con el valor posicional más alto en un número multibyte. <br /><br />Por ejemplo, el MSB de `$AB15` es `$AB`.",
		},
		"Name table|_Name tables|_Nametable|_Nametables": {
			icon: "🏞️📖",
			en: "A map of tile indexes for backgrounds, stored in VRAM.",
			es: "Un mapa de índices de tiles para fondos, almacenado en VRAM.",
		},
		NEEES: {
			icon: "🕹️",
			en:
				"The piece of hardware we're trying to emulate. People think it means _'No Entiendo' Enigmatic Enjoyment Solution_.",
			es:
				"La pieza de hardware que estamos tratando de emular. La gente piensa que significa _'No Entiendo' El Entretenimiento Saludable_.",
		},
		NMI: {
			icon: "📹",
			en:
				"_(Non-maskable interrupt)_ A CPU interrupt triggered at the start of VBlank, when the PPU finishes drawing a frame.",
			es:
				"Una interrupción de CPU disparada al principio del VBlank, cuando la PPU termina de dibujar un frame.",
		},
		OAM: {
			icon: "🛸📖",
			en: "_(Object Attribute Memory)_ A list of sprites, stored in OAM RAM.",
			es:
				"_(Object Attribute Memory)_ Una lista de sprites, almacenada en OAM RAM.",
		},
		OAMAddr: {
			icon: "🏠",
			en:
				"A video register that sets the address inside OAM where the next sprite data will be read or written. <br /><br />It is available in CPU address `$2003`.",
			es:
				"Un registro de video que establece la dirección dentro de OAM donde se leerán o escribirán los datos del próximo sprite. <br /><br />Está disponible en la dirección de CPU `$2003`.",
		},
		OAMData: {
			icon: "📝",
			en:
				"A video register that reads or writes OAM data at the address pointed by OAMAddr. After each read/write, OAMAddr is auto-incremented. <br /><br />It is available in CPU address `$2004`.",
			es:
				"Un registro de video que lee o escribe datos OAM en la dirección apuntada por OAMAddr. Luego de cada lectura/escritura, OAMAddr es autoincrementada. <br /><br />Está disponible en la dirección de CPU `$2004`.",
		},
		OAMDMA: {
			icon: "⚡",
			en:
				"A video register that triggers a DMA transfer, copying 256 bytes from CPU memory into OAM to update all sprite data quickly. <br /><br />It is available in CPU address `$4014`.",
			es:
				"Un registro de video que dispara una transferencia DMA, copiando 256 bytes desde la memoria de CPU hacia OAM para actualizar todos los datos de sprites rápidamente. <br /><br />Está disponible en la dirección de CPU `$4014`.",
		},
		"OAM RAM": {
			icon: "🐏",
			en:
				"A dedicated RAM area used to store the contents of OAM. <br /><br />In the NEEES, it's `256` bytes and holds all the sprite data.",
			es:
				"Una RAM dedicada usada para almacenar el contenido de OAM. <br /><br />En la NEEES, son `256` bytes que contienen todos los datos de los sprites.",
		},
		"Opcode|_Opcodes": {
			icon: "🔢",
			en:
				"_(Operation code)_ A number that, inside the machine code, represents an instruction code. <br /><br />In the NEEES, it defines both the instruction and the addressing mode.",
			es:
				"_(Código de operación)_ Un número que, dentro del código máquina, define un código de instrucción. <br /><br />En la NEEES, define tanto la instrucción como el modo de direccionamiento.",
		},
		"Palette|_Palettes": {
			also: { es: "Paleta|_Paletas" },
			icon: "🎨",
			en: "A list of color indexes, stored in Palette RAM.",
			es: "Una lista de índices de colores, almacenada en Palette RAM.",
		},
		"Palette id|Palette index|_Palette indexes": {
			also: {
				es:
					"Índice de paleta|_Índices de paleta|_Índice de la paleta|_Índices de la paleta|Id de paleta|_Id de la paleta",
			},
			icon: "🎨",
			en:
				"The index of a palette inside Palette RAM. Backgrounds and sprites use different sets. Ranges from `0` to `7`.",
			es:
				"El índice de una paleta dentro de Palette RAM. Los fondos y sprites usan conjuntos distintos. Va de `0` a `7`.",
		},
		"Palette RAM": {
			icon: "🐏",
			en:
				"A small RAM area used to store palettes. <br /><br />In the NEEES, it holds `32` bytes for background and sprite color indexes.",
			es:
				"Una pequeña área de RAM usada para almacenar paletas. <br /><br />En la NEEES, contiene 32 bytes para los índices de color de fondo y sprites.",
		},
		"Pattern table|_Pattern tables": {
			icon: "🕊️📖",
			en: "A list of tiles stored in CHR-ROM or CHR-RAM.",
			es: "Una lista de tiles almacenada en CHR-ROM o CHR-RAM.",
		},
		"Pattern table id": {
			also: { es: "Id de pattern table|_Id de la pattern table" },
			icon: "👾",
			en:
				"The index of a pattern table. There are `2`: `PPU $0000` (`0`) and `PPU $1000` (`1`).",
			es:
				"El índice de una pattern table. Hay `2`: `PPU $0000` (`0`) y `PPU $1000` (`1`).",
		},
		PPU: {
			icon: "🖥️",
			en:
				"The _Picture Processing Unit_. It draws graphics by putting pixels on the screen.",
			es:
				"La _Unidad de Procesamiento de Imagen_. Dibuja gráficos poniendo píxeles en la pantalla.",
		},
		PPUAddr: {
			icon: "📍",
			en:
				"A video register that sets the PPU address for future reads or writes. <br /><br />Must be written twice: high byte first, then low byte. <br /><br />It is available in CPU address `$2006`.",
			es:
				"Un registro de video que establece la dirección PPU para futuras lecturas o escrituras. <br /><br />Debe escribirse dos veces: primero el byte alto, luego el byte bajo. <br /><br />Está disponible en la dirección de CPU `$2006`.",
		},
		PPUCtrl: {
			icon: "🎛️",
			en:
				"A video register that sets basic PPU settings like NMI enable, sprite size, pattern table selection, and nametable base. <br /><br />It is available in CPU address `$2000`.",
			es:
				"Un registro de video que configura ajustes básicos de la PPU como la habilitación de NMI, el tamaño de los sprites, la selección de pattern tables y la base del name table. <br /><br />Está disponible en la dirección de CPU `$2000`.",
		},
		PPUData: {
			icon: "📦",
			en:
				"A video register that reads or writes a byte of data from/to the PPU address pointed by PPUAddr. After each read/write, PPUAddr is auto-incremented. <br /><br />It is available in CPU address `$2007`.",
			es:
				"Un registro de video que lee o escribe un byte de datos desde/hacia la dirección PPU apuntada por PPUAddr. Luego de cada lectura/escritura, PPUAddr es autoincrementada. <br /><br />Está disponible en la dirección de CPU `$2007`.",
		},
		PPUMask: {
			icon: "🎭",
			en:
				"A video register used to enable or disable parts of the background and sprites, as well as apply color effects like greyscale or emphasis. <br /><br />It is available in CPU address `$2001`.",
			es:
				"Un registro de video usado para habilitar o deshabilitar partes del fondo y los sprites, además de aplicar efectos de color como escala de grises o énfasis. <br /><br />Está disponible en la dirección de CPU `$2001`.",
		},
		PPUScroll: {
			icon: "📜",
			en:
				"A video register that sets the background scroll position. <br /><br />Written twice per frame: once for X scroll, once for Y. <br /><br />It is available in CPU address `$2005`.",
			es:
				"Un registro de video que establece la posición de scroll del fondo. <br /><br />Se escribe dos veces por frame: una para el scroll horizontal, otra para el vertical. <br /><br />Está disponible en la dirección de CPU `$2005`.",
		},
		PPUStatus: {
			icon: "📊",
			en:
				"A video register that shows whether the PPU is in VBlank, if sprite 0 hit occurred, or if there's sprite overflow. Reading it also resets internal latches. <br /><br />It is available in CPU address `$2002`.",
			es:
				"Un registro de video que muestra si la PPU está en VBlank, si ocurrió un sprite 0 hit, o si hay desbordamiento de sprites. Leerlo también reinicia latches internos. <br /><br />Está disponible en la dirección de CPU `$2002`.",
		},
		"PPU address|_PPU addresses|PPU $": {
			also: { es: "Dirección PPU|_Direcciones PPU|PPU $" },
			icon: "🐏",
			en:
				"A memory address seen from the PPU's address space. <br /><br />In the NEEES, valid addresses go from `$0000` to `$3FFF`, with many regions being mirrored.",
			es:
				"Una dirección de memoria vista desde el espacio de direcciones de la PPU. <br /><br />En la NEEES, las direcciones válidas van de `$0000` a `$3FFF`, con muchas regiones espejadas.",
		},
		"PPU register|_PPU registers": {
			also: { es: "Registro de PPU|_Registros de PPU" },
			icon: "🔢",
			en:
				"A memory-mapped register used to control the PPU or read its state. <br /><br />In the NEEES, they are mapped to addresses `$2000` - `$2007`, and `$4014` (OAMDMA).",
			es:
				"Un registro mapeado en memoria usado para controlar la PPU o leer su estado. <br /><br />En la NEEES, están mapeados en las direcciones `$2000` - `$2007`, y `$4014` (OAMDMA).",
		},
		"Pre-line": {
			icon: "🌠",
			en:
				'A non-visible scanline where the PPU gets things ready for the upcoming frame. Also called "_scanline -1_".',
			es:
				'Una scanline no visible en la que la PPU prepara todo para el próximo frame. También se la llama "_scanline -1_".',
		},
		"PRG-ROM": {
			icon: "🤖",
			en:
				"_(Program ROM)_ A ROM chip that contains the game code, inside the cartridge.",
			es:
				"_(Program ROM)_ Un chip de ROM que contiene el código del juego, dentro del cartucho.",
		},
		"PRG-RAM": {
			icon: "🔋",
			en:
				"_(Program RAM)_ A battery-backed RAM chip that contains the save file, inside the cartridge.",
			es:
				"_(Program RAM)_ Un chip de RAM (alimentado a batería) que contiene la partida, dentro del cartucho.",
		},
		"Scanline|_Scanlines": {
			icon: "🌠",
			en:
				"A single horizontal line of pixels drawn on the screen. The PPU draws one scanline at a time, from top to bottom, until the whole frame is complete.",
			es:
				"Una línea horizontal de píxeles dibujada en la pantalla. La PPU dibuja una scanline a la vez, de arriba hacia abajo, hasta completar todo el frame.",
		},
		Scrolling: {
			icon: "📜",
			en:
				"A PPU feature that allows developers to move the background by adjusting the visible portion of the name table.",
			es:
				"Una función de la PPU que permite a los desarrolladores mover el fondo ajustando la porción visible de la name table.",
		},
		"Sprite|_Sprites": {
			icon: "🛸",
			en:
				"A game object on top (or behind!) of the background that can be moved or flipped, stored in OAM. It can use one tile (`8×8` sprite) or two (`8×16` sprite).",
			es:
				"Un objeto del juego encima (¡o detrás!) del fondo que puede ser movido o volteado, almacenado en OAM. Puede usar un tile (sprite de `8×8`) o dos (sprite de `8×16`).",
		},
		"Sprite zero|_Sprite-zero": {
			also: { es: "Sprite cero|_Sprite-cero" },
			icon: "🛸",
			en:
				"The sprite with OAM index `0`. It has special behavior in the PPU, such as triggering the sprite-0 hit when it overlaps the background.",
			es:
				"El sprite con índice OAM `0`. Tiene un comportamiento especial en la PPU, como activar el sprite-0 hit cuando se superpone con el fondo.",
		},
		"Sprite-zero hit|_Sprite zero hit": {
			also: { es: "Sprite zero hit|_Sprite-zero hit" },
			icon: "👊",
			en:
				"A condition that occurs when a visible pixel of the sprite zero overlaps a visible background pixel. When this happens, the PPU sets the sprite-0 hit flag in PPUStatus. <br /><br />Games often use it to time mid-frame effects like status bars or split screens.",
			es:
				"Una condición que ocurre cuando un píxel visible del sprite cero se superpone con un píxel visible del fondo. Cuando eso pasa, la PPU activa la bandera de sprite-0 hit en PPUStatus. <br /><br />Los juegos suelen usarla para sincronizar efectos a mitad de frame como barras de estado o pantallas divididas.",
		},
		"Sprite evaluation": {
			also: { es: "Evaluación de sprites" },
			icon: "🕵️",
			en:
				"A step performed on each scanline where the PPU checks which sprites should be rendered. It scans all entries in OAM and selects up to `8` sprites whose vertical position matches the current scanline. <br /><br />If more than `8` sprites are found, the sprite overflow flag is set.",
			es:
				"Un paso que se realiza en cada scanline donde la PPU determina qué sprites deben renderizarse. Escanea todas las entradas en OAM y selecciona hasta `8` sprites cuya posición vertical coincida con la scanline actual. <br /><br />Si se encuentran más de `8` sprites, se activa la bandera de sprite overflow.",
		},
		"Sprite id|OAM id|OAM index|_OAM indexes": {
			also: {
				es:
					"OAM id|Índice OAM|_Índices OAM|Id de OAM|Id de sprite|_Id del sprite",
			},
			icon: "🛸",
			en: "The index of a sprite inside OAM. It ranges from `0` to `63`.",
			es: "El índice de un sprite dentro de OAM. Va de `0` a `63`.",
		},
		"Sprite overflow": {
			icon: "🏁",
			en:
				"A condition that occurs when more than `8` sprites appear on the same scanline. Only the first `8` are rendered. <br /><br />Games can retrieve this flag by reading bit `5` of PPUStatus.",
			es:
				"Una condición que ocurre cuando más de `8` sprites aparecen en la misma scanline. Solo se renderizan los primeros `8`. <br /><br />Los juegos pueden leer esta bandera desde el bit `5` de PPUStatus.",
		},
		Stack: {
			also: { es: "Pila" },
			icon: "🧱",
			en:
				"A LIFO _(Last In, First Out)_ structure which programs can use to store values. The current depth is measured by [SP]. <br /><br />In the NEEES, the stack lives in WRAM between addresses `$0100` and `$01FF`.",
			es:
				"Una estructura LIFO _(Last In, First Out)_ que los programas usan para almacenar valores. La longitud actual es medida por el [SP]. <br /><br />En la NEEES, la pila vive en WRAM entre las direcciones `$0100` y `$01FF`.",
		},
		"Tile|_Tiles": {
			icon: "🕊️",
			en:
				"An 8×8 grayscale pixel grid that represents a pattern. Tiles are stored in pattern tables.",
			es:
				"Una cuadrícula de 8×8 píxeles en escala de grises que representa un patrón. Los tiles se almacenan en pattern tables.",
		},
		"Tile id": {
			also: { es: "Id de tile|_Id del tile" },
			icon: "🕊️",
			en:
				"The index of a tile inside a pattern table. It ranges from `0` to `255`.",
			es:
				"El índice de un tile dentro de una pattern table. Va de `0` a `255`.",
		},
		VBlank: {
			icon: "🏝️",
			en:
				"Longer period after the last scanline of a frame, where the PPU is idle before starting a new frame. It's the best time to update graphics safely.",
			es:
				"Período más largo después de la última scanline de un frame, donde la PPU queda inactiva antes de comenzar uno nuevo. Es el mejor momento para actualizar gráficos sin problemas.",
		},
		"Video register|_Video registers": {
			also: { es: "Registro de video|_Registros de video" },
			icon: "📺",
			en:
				"A memory-mapped register that the PPU uses to control rendering and expose its internal state.",
			es:
				"Un registro mapeado en memoria que la PPU usa para controlar el renderizado y exponer su estado interno.",
		},
		VRAM: {
			icon: "🐏",
			en:
				"_(Video RAM)_ A RAM chip of `2` KiB that lives in the PPU. It holds name tables.",
			es:
				"_(Video RAM)_ Un chip de RAM de `2` KiB que vive en la PPU. Almacena name tables.",
		},
		WRAM: {
			icon: "🐏",
			en:
				"_(Work RAM)_ A RAM chip of `2` KiB that lives in the CPU. General purpose.",
			es:
				"_(Work RAM)_ Un chip de RAM de `2` KiB que vive en la CPU. Propósito general.",
		},
		"Zero Flag": {
			also: { es: "Bandera Zero" },
			icon: "🏁",
			en: "A CPU flag that indicates when the result of an operation is `0`.",
			es:
				"Una bandera de CPU que indica cuando el resultado de una operación es `0`.",
		},
		"Zero Page|First page": {
			also: { es: "Página Cero|Primera página" },
			icon: "🐏",
			en:
				"The first `256` bytes of WRAM, located in addresses `$0000` - `$00FF`.",
			es:
				"Los primeros `256` bytes de WRAM, ubicados en las direcciones `$0000` - `$00FF`.",
		},
	},

	showDefinition(word) {
		const { icon, name, text, usableKeys, otherKeys } = this.getDefinition(
			word
		);
		const html = this.parseLinks(marked.parseInline(text, []), usableKeys);
		const also = locales.get("also");
		const subtitle =
			otherKeys.length > 0
				? `<br /><span class="dictionary-entry-alt-names">(${also}: ${otherKeys.join(
						", "
				  )})</span>`
				: "";

		toast.normal(
			<span
				style={{ textAlign: "center" }}
				dangerouslySetInnerHTML={{
					__html: `<h5 class="dictionary-entry-name">${icon} ${name}${subtitle}</h5>\n${html}`,
				}}
			/>
		);
	},

	parseLinks(html, exclude = []) {
		const regexp = dictionary.getRegexp(exclude);
		const globalRegexp = new RegExp(regexp.source, regexp.flags + "g");

		return html.replace(
			globalRegexp,
			(word) =>
				`<a class="dictionary-link" href="javascript:_showDefinition_('${word}')">${word}</a>`
		);
	},

	escapeLinks(text) {
		const regexp = dictionary.getRegexp();
		const globalRegexp = new RegExp(regexp.source, regexp.flags + "g");
		return text.replace(globalRegexp, (word) => `<${word}>`);
	},

	getEntries() {
		const keys = this._keys();
		const localizedKeys = _.flatMap(keys, (key) => this._getUsableKeysOf(key));
		return _.orderBy(localizedKeys, [(entry) => entry.length], ["desc"]);
	},

	getRegexp(exclude = []) {
		const entries = this.getEntries();
		return new RegExp(
			// eslint-disable-next-line
			_.template("(${entries})")({
				entries: entries
					.filter((word) => !exclude.some((it) => this._matchesKey(it, word)))
					.map((key) => {
						key = this._stripPrivateSymbol(key);
						return `(?<![^\\s(>])${escapeStringRegexp(
							key
						)}(?=[\\s0-9,.)?!:'<&]|$)`;
					})
					// before: string start, whitespace, parenthesis, major
					// after: whitespace, numbers, comma, dot, parenthesis, question mark, exclamation mark, colon, apostrophe, minor, ampersand, or end of string
					.join("|"),
			}),
			"iu"
		);
	},

	getDefinition(entry) {
		const keys = this._keys();
		const key = keys.find((key) => {
			const usableKeys = this._getUsableKeysOf(key);
			return usableKeys.some((usableKey) => this._matchesKey(usableKey, entry));
		});
		if (key == null) return null;

		const data = this.entries[key];
		const usableKeys = this._getUsableKeysOf(key);
		const otherKeys = usableKeys.filter((it, i) => {
			return i > 0 && !it.startsWith("_");
		});
		const name = usableKeys[0];

		return {
			icon: data.icon,
			name,
			text: this.entries[key][locales.language],
			usableKeys,
			otherKeys,
		};
	},

	_matchesKey(key, entry) {
		key = this._stripPrivateSymbol(key);
		return key.toLowerCase() === entry.toLowerCase();
	},

	_stripPrivateSymbol(key) {
		return key.startsWith("_") ? key.replace("_", "") : key;
	},

	_getUsableKeysOf(key) {
		const localizedKey = this.entries[key].also?.[locales.language];
		const usableKey = localizedKey != null ? localizedKey : key;
		return usableKey.split("|");
	},

	_keys() {
		return _(this.entries).keys().value();
	},
};

window._showDefinition_ = (word) => {
	dictionary.showDefinition(word);
};

export default dictionary;
