export default {
	"[A]|Accumulator": {
		also: {
			es: "[A]|Acumulador",
			fr: "[A]|Accumulateur",
			ru: "Аккумулятор|[A]|_аккумулятора|_аккумуляторе|_Accumulator",
		},
		icon: "🔢",
		en:
			"_(Accumulator Register)_ A CPU register used to store the result of arithmetic and logic operations.",
		es:
			"_(Registro Acumulador)_ Un registro de CPU usado para almacenar el resultado de operaciones aritméticas y lógicas.",
		fr:
			"_(Registre Accumulateur)_ Un registre CPU utilisé pour stocker le résultat d'opérations arithmétiques et logiques.",
		ru:
			"_(Регистр-аккумулятор)_ Регистр CPU, в котором хранится результат арифметических и логических операций.",
	},
	"[PC]": {
		icon: "🔢",
		en:
			"_(Program Counter)_ A CPU register used to store the address of the next instruction to execute.",
		es:
			"_(Contador de Programa)_ Un registro de CPU usado para almacenar la dirección de la próxima instrucción a ejecutar.",
		fr:
			"_(Compteur de Programme)_ Un registre CPU utilisé pour stocker l'adresse de la prochaine instruction à exécuter.",
		ru:
			"_(Счётчик команд)_ Регистр CPU, в котором хранится адрес следующей инструкции для выполнения.",
	},
	"[SP]": {
		icon: "🔢",
		en: "_(Stack Pointer)_ A CPU register used to track the top of the stack.",
		es:
			"_(Puntero de Pila)_ Un registro de CPU usado para localizar la cima de la pila.",
		fr:
			"_(Pointeur de Pile)_ Un registre CPU utilisé pour suivre le sommet de la pile.",
		ru: "_(Указатель стека)_ Регистр CPU, который отслеживает вершину стека.",
	},
	"[X]": {
		icon: "🔢",
		en: "_(X Register)_ A CPU register used to index memory and control loops.",
		es:
			"_(Registro X)_ Un registro de CPU usado para indexar memoria y controlar ciclos.",
		fr:
			"_(Registre X)_ Un registre CPU utilisé pour indexer la mémoire et contrôler les boucles.",
		ru: "_(Регистр X)_ Регистр CPU для индексации памяти и управления циклами.",
	},
	"[Y]": {
		icon: "🔢",
		en: "_(Y Register)_ A CPU register used for indexing and comparisons.",
		es:
			"_(Registro Y)_ Un registro de CPU usado para indexar memoria y hacer comparaciones.",
		fr:
			"_(Registre Y)_ Un registre CPU utilisé pour l'indexation et les comparaisons.",
		ru: "_(Регистр Y)_ Регистр CPU для индексации и сравнений.",
	},
	"Address space": {
		also: {
			es: "Espacio de direcciones",
			fr: "Espace d'adressage",
			ru:
				"Адресное пространство|_адресного пространства|_адресном пространстве|_Address space",
		},
		icon: "🐏",
		en:
			"The full range of memory addresses a component is able to access directly. <br /><br />In the NEEES, the CPU and the PPU each have their own address space. <br /><br />We differentiate these two spaces by saying `CPU address $xxxx` or `PPU address $xxxx`, or simply $CPU `$xxxx` and $PPU `$xxxx`.",
		es:
			"El rango completo de direcciones de memoria que un componente puede acceder directamente. <br /><br />En la NEEES, tanto la CPU como la PPU tienen su propio espacio de direcciones. <br /><br />Distinguimos estos espacios diciendo `dirección CPU $xxxx` o `dirección PPU $xxxx`, o simplemente $CPU `$xxxx` y $PPU `$xxxx`.",
		fr:
			"La plage complète d'adresses mémoire qu'un composant peut accéder directement. <br /><br />Dans la NEEES, le CPU et la PPU ont chacun leur propre espace d'adressage. <br /><br />On distingue ces deux espaces en disant `adresse CPU $xxxx` ou `adresse PPU $xxxx`, ou simplement $CPU `$xxxx` et $PPU `$xxxx`.",
		ru:
			"Полный диапазон адресов памяти, к которым компонент может обращаться напрямую. <br /><br />В NEEES у CPU и PPU свои адресные пространства. <br /><br />Чтобы различать их, мы говорим `адрес CPU $xxxx` или `адрес PPU $xxxx`, либо просто $CPU `$xxxx` и $PPU `$xxxx`.",
	},
	"Addressing mode|_Addressing modes": {
		also: {
			es: "Modo de direccionamiento|_Modos de direccionamiento",
			fr: "Mode d'adressage|_Modes d'adressage",
			ru:
				"Режим адресации|_режимы адресации|_режима адресации|_режимов адресации|_режиме адресации|_Addressing mode|_Addressing modes",
		},
		icon: "📍",
		en: "A way for an instruction to specify where its data is located.",
		es:
			"Una forma que tiene una instrucción de especificar dónde está el dato que necesita.",
		fr:
			"Une façon pour une instruction de spécifier où se trouvent ses données.",
		ru: "Способ, которым инструкция указывает, где находятся нужные ей данные.",
	},
	Amplitude: {
		also: {
			es: "Amplitud",
			fr: "Amplitude",
			ru: "Амплитуда|_амплитуды|_амплитуду|_амплитуде|_Amplitude",
		},
		icon: "📶",
		en:
			"The height of the wave peaks. It defines the volume or loudness of the sound.",
		es:
			"La altura de los picos de la onda. Define el volumen o la intensidad del sonido.",
		fr:
			"La hauteur des crêtes de l'onde. Elle définit le volume ou l'intensité du son.",
		ru: "Высота пиков волны. Определяет громкость звука.",
	},
	APU: {
		icon: "🔊",
		en: "The _Audio Processing Unit_. It handles sound, producing audio waves.",
		es:
			"La _Unidad de Procesamiento de Audio_. Maneja el sonido, produciendo ondas de audio.",
		fr:
			"L'_Unité de Traitement Audio_. Elle gère le son, en produisant des ondes audio.",
		ru:
			"_Audio Processing Unit_ — блок обработки звука. Создаёт звуковые волны.",
	},
	"APU cycle|_APU cycles": {
		also: {
			es: "Ciclo de APU|_Ciclos de APU",
			fr: "Cycle APU|_Cycles APU",
			ru: "Такт APU|_такты APU|_такта APU|_тактов APU|_APU cycle|_APU cycles",
		},
		icon: "🐢",
		en:
			"The basic timing unit of the APU; each cycle corresponds to one APU clock tick and advances its internal state. <br /><br />The APU runs at `half` the CPU clock rate. For every APU cycle, the CPU runs `2` cycles.",
		es:
			"La unidad de tiempo básica de la APU; cada ciclo corresponde a un tick de reloj de la APU y avanza su estado interno. <br /><br />La APU funciona a la `mitad` de la velocidad de la CPU. Por cada ciclo de APU, la CPU ejecuta `2` ciclos.",
		fr:
			"L'unité de temps de base de l'APU ; chaque cycle correspond à un top d'horloge de l'APU et fait avancer son état interne. <br /><br />L'APU tourne à la `moitié` de la vitesse d'horloge du CPU. Pour chaque cycle APU, le CPU exécute `2` cycles.",
		ru:
			"Основная единица времени APU: каждый такт соответствует одному импульсу его тактового сигнала и продвигает внутреннее состояние. <br /><br />APU работает на частоте, равной `половине` частоты CPU. На каждый такт APU приходится `2` такта CPU.",
	},
	"APU register|_APU registers|Audio register|_Audio registers": {
		also: {
			es:
				"Registro de APU|_Registros de APU|_Registro APU|_Registros APU|Registro de Audio|_Registros de Audio",
			fr: "Registre APU|_Registres APU|Registre Audio|_Registres Audio",
			ru:
				"Регистр APU|Аудиорегистр|_регистры APU|_регистров APU|_аудиорегистры|_аудиорегистров|_APU register|_APU registers|_Audio register|_Audio registers",
		},
		icon: "🔢",
		en:
			"A memory-mapped register used to control sound channels or volume. <br /><br />In the NEEES, they are mapped to addresses `$4000` - `$4013`, `$4015` (APUControl / APUStatus), and `$4017` (APUFrameCounter).",
		es:
			"Un registro mapeado en memoria usado para controlar los canales de sonido o el volumen. <br /><br />En la NEEES, están mapeados en las direcciones `$4000` - `$4013`, `$4015` (APUControl / APUStatus), y `$4017` (APUFrameCounter).",
		fr:
			"Un registre mappé en mémoire utilisé pour contrôler les canaux sonores ou le volume. <br /><br />Dans la NEEES, ils sont mappés aux adresses `$4000` - `$4013`, `$4015` (APUControl / APUStatus), et `$4017` (APUFrameCounter).",
		ru:
			"Регистр, отображённый в память, который управляет звуковыми каналами или громкостью. <br /><br />В NEEES такие регистры находятся по адресам `$4000` - `$4013`, `$4015` (APUControl / APUStatus) и `$4017` (APUFrameCounter).",
	},
	APUControl: {
		icon: "🎛️",
		en:
			"An audio register that enables or disables each APU channel (pulse, triangle, noise, DMC). <br /><br />It is available for writing at CPU address `$4015`.",
		es:
			"Un registro de control de audio que habilita o deshabilita cada canal de la APU (pulso, triangular, ruido, DMC). <br /><br />Está disponible para escritura en la dirección de CPU `$4015`.",
		fr:
			"Un registre audio qui active ou désactive chaque canal de l'APU (pulse, triangulaire, bruit, DMC). <br /><br />Il est disponible en écriture à l'adresse CPU `$4015`.",
		ru:
			"Аудиорегистр, который включает или отключает каждый канал APU (импульсный, треугольный, шумовой, DMC). <br /><br />Доступен для записи по адресу CPU `$4015`.",
	},
	APUFrameCounter: {
		icon: "🧮",
		en:
			"An audio register that controls the APU's sequencer (`4`- or `5`-step). <br /><br />It is available at CPU address `$4017`.",
		es:
			"Un registro de audio que controla el secuenciador de la APU (`4` o `5` pasos). <br /><br />Está disponible en la dirección de CPU `$4017`.",
		fr:
			"Un registre audio qui contrôle le séquenceur de l'APU (`4` ou `5` étapes). <br /><br />Il est disponible à l'adresse CPU `$4017`.",
		ru:
			"Аудиорегистр, который управляет секвенсором APU (режим на `4` или `5` шагов). <br /><br />Доступен по адресу CPU `$4017`.",
	},
	APUStatus: {
		icon: "📊",
		en:
			"An audio status register that reports which channels are active and if DPCM is active. <br /><br />It is available for reading at CPU address `$4015`.",
		es:
			"Un registro de estado de audio que indica qué canales están activos y si el DPCM está activo. <br /><br />Está disponible para lectura en la dirección de CPU `$4015`.",
		fr:
			"Un registre d'état audio qui indique quels canaux sont actifs et si le DPCM est actif. <br /><br />Il est disponible en lecture à l'adresse CPU `$4015`.",
		ru:
			"Аудиорегистр состояния, который показывает, какие каналы активны и активен ли DPCM. <br /><br />Доступен для чтения по адресу CPU `$4015`.",
	},
	Assembly: {
		also: {
			es: "Ensamblador",
			fr: "Assembleur",
			ru: "Ассемблер|_ассемблера|_ассемблере|_Assembly",
		},
		icon: "🔨",
		en:
			"A low-level programming language that maps very closely to the machine code understood by the CPU.",
		es:
			"Un lenguaje de programación de bajo nivel que se asemeja mucho al código máquina que la CPU entiende.",
		fr:
			"Un langage de programmation bas niveau qui correspond étroitement au code machine compris par le CPU.",
		ru:
			"Низкоуровневый язык программирования, тесно связанный с машинным кодом, который понимает CPU.",
	},
	"Assembly code": {
		also: {
			es: "Código ensamblador",
			fr: "Code assembleur",
			ru:
				"Код на ассемблере|Ассемблерный код|_ассемблерного кода|_Assembly code",
		},
		icon: "🔨",
		en: "Code written in assembly language.",
		es: "Código escrito en lenguaje ensamblador.",
		fr: "Du code écrit en langage assembleur.",
		ru: "Код, написанный на языке ассемблера.",
	},
	"Attribute table|Attribute tables": {
		icon: "🖍️📖",
		en:
			"A map of palette indexes for backgrounds, stored at the end of each name table.",
		es:
			"Un mapa de índices de paleta para fondos, almacenado al final de cada name table.",
		fr:
			"Une carte d'index de palettes pour les fonds, stockée à la fin de chaque name table.",
		ru:
			"Карта индексов палитр для фона, которая хранится в конце каждой таблицы имён.",
		also: {
			fr: "Table d'attributs|_Tables d'attributs",
			ru:
				"Таблица атрибутов|_таблицы атрибутов|_таблиц атрибутов|_таблице атрибутов|_таблицу атрибутов|_Attribute table|_Attribute tables",
		},
	},
	"Audio channel|APU channel|Channel|_Audio channels|_APU channels|_Channels": {
		also: {
			es:
				"Canal de audio|Canal APU|Canal|_Canales de audio|_Canales APU|_Canales",
			fr: "Canal audio|Canal APU|Canal|_Canaux audio|_Canaux APU|_Canaux",
			ru:
				"Звуковой канал|Канал APU|Канал|_звуковые каналы|_каналы APU|_каналы|_канала|_каналов|_Audio channel|_APU channel|_Channel|_Audio channels|_APU channels|_Channels",
		},
		icon: "🎛️",
		en:
			"A component of the APU responsible for generating a specific type of sound. Each channel has its own parameters and behavior. <br /><br />The NEEES has `2` Pulse Channels, `1` Triangle Channel, `1` Noise Channel, and `1` DMC Channel.",
		es:
			"Un componente de la APU encargado de generar un tipo específico de sonido. Cada canal tiene sus propios parámetros y comportamiento. <br /><br />La NEEES tiene `2` Canales Pulso, `1` Canal Triangular, `1` Canal Ruido, y `1` Canal DMC.",
		fr:
			"Un composant de l'APU chargé de générer un type de son spécifique. Chaque canal a ses propres paramètres et comportement. <br /><br />La NEEES a `2` Canaux Pulse, `1` Canal Triangulaire, `1` Canal Bruit, et `1` Canal DMC.",
		ru:
			"Компонент APU, который создаёт определённый тип звука. У каждого канала свои параметры и поведение. <br /><br />В NEEES есть `2` импульсных канала, `1` треугольный, `1` шумовой и `1` DMC-канал.",
	},
	"Audio sample|_Audio samples|Sample|_Samples": {
		also: {
			es: "Sample de audio|_Samples de audio|Sample|_Samples",
			fr: "Sample audio|_Samples audio|Sample|_Samples",
			ru:
				"Аудиоотсчёт|Отсчёт|Аудиосэмпл|Сэмпл|_аудиоотсчёты|_отсчёты|_отсчёта|_отсчётов|_сэмплы|_сэмпла|_сэмплов|_Audio sample|_Audio samples|_Sample|_Samples",
		},
		icon: "📈",
		en:
			"A number that represents the height of a wave at a specific point in time. Waves are stored as a stream of these values. <br /><br/>In the NEEES, these are numbers in the `0-15` range. When emulating the APU, we use a `44100` Hz sample rate. <br /><br />The word `sample` can also refer to a recorded `sound clip` (multiple samples), so its interpretation depends on the context.",
		es:
			"Un número que representa la altura de una onda en un punto específico en el tiempo. Las ondas se almacenan como una secuencia de estos valores. <br /><br/>En la NEEES, estos números están en el rango `0-15`. Al emular la APU, usamos una frecuencia de muestreo de `44100` Hz. <br /><br/>La palabra `sample` también puede referirse a un `clip de sonido` grabado (múltiples samples), por lo que su interpretación depende del contexto.",
		fr:
			"Un nombre qui représente la hauteur d'une onde à un moment précis. Les ondes sont stockées comme un flux de ces valeurs. <br /><br/>Dans la NEEES, ce sont des nombres dans la plage `0-15`. Lors de l'émulation de l'APU, on utilise une fréquence d'échantillonnage de `44100` Hz. <br /><br />Le mot `sample` peut aussi désigner un `clip sonore` enregistré (plusieurs samples), donc son interprétation dépend du contexte.",
		ru:
			"Число, представляющее высоту волны в определённый момент времени. Волна хранится как поток этих значений — отсчётов. <br /><br/>В NEEES это числа в диапазоне `0-15`. При эмуляции APU мы используем частоту дискретизации `44100` Гц. <br /><br />Английское слово `sample` также может означать записанный `звуковой фрагмент` (множество отсчётов), то есть сэмпл. Значение зависит от контекста.",
	},
	"Audio wave|_Audio waves|Wave|_Waves": {
		also: {
			es: "Onda de audio|_Ondas de audio|Onda|_Ondas",
			fr: "Onde audio|_Ondes audio|Onde|_Ondes",
			ru:
				"Звуковая волна|Волна|_звуковые волны|_волны|_волну|_волне|_волн|_Audio wave|_Audio waves|_Wave|_Waves",
		},
		icon: "🌊",
		en:
			"A representation of how sound varies over time, stored as a stream of samples that describe the wave's height at each moment. <br /><br />A wave has a form, frequency and amplitude.",
		es:
			"Una representación de cómo varía el sonido a lo largo del tiempo, almacenada como una secuencia de samples que describen la altura de la onda en cada instante. <br /><br />Una onda tiene forma, frecuencia y amplitud.",
		fr:
			"Une représentation de la variation du son dans le temps, stockée comme un flux de samples décrivant la hauteur de l'onde à chaque instant. <br /><br />Une onde a une forme, une fréquence et une amplitude.",
		ru:
			"Представление того, как звук меняется со временем: поток сэмплов описывает высоту волны в каждый момент. <br /><br />У волны есть форма, частота и амплитуда.",
	},
	"Background|_Backgrounds": {
		also: {
			es: "Fondo|_Fondos",
			fr: "Fond|_Fonds",
			ru: "Фон|_фона|_фоне|_фоны|_Background|_Backgrounds",
		},
		icon: "🏞️",
		en: "A static image behind the sprites, stored in a name table.",
		es:
			"Una imagen estática detrás de los sprites, almacenada en una name table.",
		fr: "Une image statique derrière les sprites, stockée dans une name table.",
		ru:
			"Статичное изображение позади спрайтов, которое хранится в таблице имён.",
	},
	"Bank-switching|Bank switching": {
		icon: "🔄",
		en:
			"A technique that swaps which memory bank is mapped into the CPU or PPU address space, allowing access to more code or graphics than the fixed address range permits.",
		es:
			"Una técnica que intercambia qué banco de memoria está mapeado en el espacio de direcciones de CPU o PPU, permitiendo acceder a más código o gráficos de los que permite el rango de direcciones fijo.",
		fr:
			"Une technique qui change quelle banque mémoire est mappée dans l'espace d'adressage du CPU ou de la PPU, permettant d'accéder à plus de code ou de graphismes que ne le permet la plage d'adresses fixe.",
		ru:
			"Приём, который меняет банк памяти, отображённый в адресное пространство CPU или PPU. Это даёт доступ к большему объёму кода или графики, чем позволяет фиксированный диапазон адресов.",
		also: {
			fr: "Commutation de banques",
			ru:
				"Переключение банков|_переключения банков|_Bank-switching|_Bank switching",
		},
	},
	BrokenNEEES: {
		icon: "🕹️",
		en:
			"A NEEES emulator found online. It's buggy as hell, but has a modular design, so components like Cartridge, CPU, PPU and APU can be replaced.",
		es:
			"Un emulador de NEEES encontrado en línea. Está lleno de bugs, pero tiene un diseño modular, por lo que se le pueden reemplazar componentes como el Cartucho, la CPU, PPU y APU.",
		fr:
			"Un émulateur de NEEES trouvé en ligne. Il est plein de bugs, mais son design est modulaire, donc des composants comme le Cartridge, le CPU, la PPU et l'APU peuvent être remplacés.",
		ru:
			"Эмулятор NEEES, найденный в интернете. Багов в нём хоть отбавляй, зато конструкция модульная: можно заменить картридж, CPU, PPU и APU.",
	},
	"Carry Flag": {
		also: {
			es: "Bandera Carry",
			fr: "Flag Carry",
			ru: "Флаг переноса|_флага переноса|_флаге переноса|_Carry Flag",
		},
		icon: "🏁",
		en:
			"A CPU flag that indicates when an arithmetic operation has produced a _carry_. <br /><br />In the NEEES, that happens when the result exceeds the `8`-bit capacity (`255` for unsigned numbers).",
		es:
			"Una bandera de CPU que indica cuando una operación aritmética produjo un _carry_. <br /><br />En la NEEES, esto ocurre cuando el resultado sobrepasa el límite de `8` bits (`255` para números sin signo).",
		fr:
			"Un flag CPU qui indique quand une opération arithmétique a produit une _retenue_. <br /><br />Dans la NEEES, ça arrive quand le résultat dépasse la capacité de `8` bits (`255` pour les nombres non signés).",
		ru:
			"Флаг CPU, который показывает, что арифметическая операция вызвала _перенос_. <br /><br />В NEEES это происходит, когда результат превышает вместимость `8` бит (`255` для беззнаковых чисел).",
	},
	"Cartridge|_Cartridges": {
		also: {
			es: "Cartucho|_Cartuchos",
			fr: "Cartouche|_Cartouches",
			ru:
				"Картридж|_картриджа|_картридже|_картриджи|_картриджей|_Cartridge|_Cartridges",
		},
		icon: "💾",
		en:
			"A removable piece of hardware that contains all the game chips, such as PRG-ROM, CHR-ROM, PRG-RAM, and the Mapper.",
		es:
			"Una pieza de hardware removible que contiene todos los chips del juego, como PRG-ROM, CHR-ROM, PRG-RAM, y el Mapper.",
		fr:
			"Une pièce matérielle amovible qui contient toutes les puces du jeu, comme la PRG-ROM, la CHR-ROM, la PRG-RAM et le Mapper.",
		ru:
			"Съёмное устройство со всеми микросхемами игры: PRG-ROM, CHR-ROM, PRG-RAM и маппером.",
	},
	"CHR-RAM": {
		icon: "👾",
		en:
			"_(Character RAM)_ A RAM chip where some games write their graphics through code. Some cartridges use this type of memory instead of CHR-ROM.",
		es:
			"_(Character RAM)_ Un chip de RAM donde algunos juegos escriben sus gráficos vía código. Algunos cartuchos usan este tipo de memoria en lugar de CHR-ROM.",
		fr:
			"_(Character RAM)_ Une puce RAM dans laquelle certains jeux écrivent leurs graphismes via le code. Certaines cartouches utilisent ce type de mémoire au lieu de la CHR-ROM.",
		ru:
			"_(Character RAM)_ Микросхема RAM, в которую некоторые игры записывают свою графику из кода. В некоторых картриджах она используется вместо CHR-ROM.",
	},
	"CHR-ROM": {
		icon: "👾",
		en:
			"_(Character ROM)_ A ROM chip that contains the game graphics, inside the cartridge.",
		es:
			"_(Character ROM)_ Un chip de ROM que contiene los gráficos del juego, dentro del cartucho.",
		fr:
			"_(Character ROM)_ Une puce ROM qui contient les graphismes du jeu, à l'intérieur de la cartouche.",
		ru:
			"_(Character ROM)_ Микросхема ROM внутри картриджа, в которой хранится графика игры.",
	},
	"Color index|_Color indexes": {
		also: {
			es: "Índice de color|_Índices de color",
			fr: "Index de couleur|_Index de couleurs",
			ru:
				"Индекс цвета|_индекса цвета|_индексы цветов|_индексов цветов|_Color index|_Color indexes",
		},
		icon: "🎨",
		en:
			"A number inside a tile pixel that selects a color from the palette. It ranges from `0` to `3`. <br /><br />In the background, index `0` is the `backdrop color`. <br />In sprites, index `0` is always transparent.",
		es:
			"Un número dentro de un píxel de tile que selecciona un color de la paleta. Va de `0` a `3`. <br /><br />En el fondo, el índice `0` es el `backdrop color`. <br />En los sprites, el índice `0` siempre es transparente.",
		fr:
			"Un nombre dans un pixel de tile qui sélectionne une couleur de la palette. Il va de `0` à `3`. <br /><br />Dans le fond, l'index `0` est la `couleur de fond`. <br />Dans les sprites, l'index `0` est toujours transparent.",
		ru:
			"Число в пикселе тайла, которое выбирает цвет из палитры. Диапазон — от `0` до `3`. <br /><br />На фоне индекс `0` означает `цвет подложки`. <br />У спрайтов индекс `0` всегда прозрачный.",
	},
	"Controller|_Controllers": {
		also: {
			es: "Mando|_Mandos",
			fr: "Manette|_Manettes",
			ru:
				"Контроллер|_контроллера|_контроллеры|_контроллеров|_Controller|_Controllers",
		},
		icon: "🎮",
		en:
			"An `8`-button gamepad (_D-pad + A,B + START,SELECT_). <br /><br />The NEEES accepts _(without extra hardware)_ up to two controllers.",
		es:
			"Un joystick de `8` botones (_D-pad + A,B + START,SELECT_). <br /><br />La NEEES acepta _(sin hardware extra)_ hasta dos mandos.",
		fr:
			"Un gamepad à `8` boutons (_D-pad + A,B + START,SELECT_). <br /><br />La NEEES accepte _(sans matériel supplémentaire)_ jusqu'à deux manettes.",
		ru:
			"Геймпад с `8` кнопками (_крестовина + A,B + START,SELECT_). <br /><br />NEEES поддерживает до двух контроллеров _(без дополнительного оборудования)_.",
	},
	CPU: {
		icon: "🧠",
		en:
			"The _Central Processing Unit_. It reads games' code and executes their instructions.",
		es:
			"La _Unidad Central de Procesamiento_. Lee el código de los juegos y ejecuta sus instrucciones.",
		fr:
			"Le _Processeur Central_. Il lit le code des jeux et exécute leurs instructions.",
		ru:
			"_Central Processing Unit_ — центральный процессор. Читает код игр и выполняет их инструкции.",
	},
	"CPU address|_CPU addresses|$CPU|CPU memory": {
		also: {
			es:
				"Dirección CPU|_Direcciones CPU|_Dirección de CPU|_Direcciones de CPU|$CPU|Memoria CPU",
			fr: "Adresse CPU|_Adresses CPU|$CPU|Mémoire CPU",
			ru:
				"Адрес CPU|Память CPU|$CPU|_адреса CPU|_адресов CPU|_памяти CPU|_CPU address|_CPU addresses|_CPU memory",
		},
		icon: "🐏",
		en:
			"A memory address seen from the CPU's address space. <br /><br />In the NEEES, the CPU can access addresses from `$0000` to `$FFFF` (`64` KiB).",
		es:
			"Una dirección de memoria vista desde el espacio de direcciones de la CPU. <br /><br />En la NEEES, la CPU puede acceder a direcciones entre `$0000` y `$FFFF` (`64` KiB).",
		fr:
			"Une adresse mémoire vue depuis l'espace d'adressage du CPU. <br /><br />Dans la NEEES, le CPU peut accéder aux adresses de `$0000` à `$FFFF` (`64` Kio).",
		ru:
			"Адрес памяти в адресном пространстве CPU. <br /><br />В NEEES CPU может обращаться к адресам от `$0000` до `$FFFF` (`64` КиБ).",
	},
	"CPU cycle|_CPU cycles": {
		also: {
			es: "Ciclo de CPU|_Ciclos de CPU",
			fr: "Cycle CPU|_Cycles CPU",
			ru: "Такт CPU|_такты CPU|_такта CPU|_тактов CPU|_CPU cycle|_CPU cycles",
		},
		icon: "🐎",
		en:
			"The basic timing unit of the CPU; each cycle corresponds to one CPU clock tick and advances its internal state.",
		es:
			"La unidad de tiempo básica de la CPU; cada ciclo corresponde a un tick de reloj de la CPU y avanza su estado interno.",
		fr:
			"L'unité de temps de base du CPU ; chaque cycle correspond à un top d'horloge du CPU et fait avancer son état interne.",
		ru:
			"Основная единица времени CPU: каждый такт соответствует одному импульсу его тактового сигнала и продвигает внутреннее состояние.",
	},
	"CPU flag|_CPU flags": {
		also: {
			es: "Bandera de CPU|_Banderas de CPU",
			fr: "Flag CPU|_Flags CPU",
			ru: "Флаг CPU|_флаги CPU|_флага CPU|_флагов CPU|_CPU flag|_CPU flags",
		},
		icon: "🏁",
		en: "A flag stored using one bit inside the Flags Register.",
		es: "Una bandera almacenada usando un bit dentro del Registro de Banderas.",
		fr: "Un flag stocké sur un bit dans le Registre de Flags.",
		ru: "Флаг, который занимает один бит в регистре флагов.",
	},
	"CPU interrupt|_CPU interrupts|Interrupt|_Interrupts": {
		also: {
			es:
				"Interrupción de CPU|_Interrupciones de CPU|Interrupción|_Interrupciones",
			fr: "Interruption CPU|_Interruptions CPU|Interruption|_Interruptions",
			ru:
				"Прерывание CPU|Прерывание|_прерывания CPU|_прерывания|_прерываний|_CPU interrupt|_CPU interrupts|_Interrupt|_Interrupts",
		},
		icon: "✋",
		en:
			"A signal that pauses the current program in order to handle a specific events. <br /><br />When such an event happens, the CPU saves its state ([PC] and flags register) in the stack and jumps to the vector associated with that event. <br /><br />After handling the event, the execution usually returns to where it was left off.",
		es:
			"Una señal que pausa el programa actual para manejar un evento específico. <br /><br />Cuando tal evento ocurre, la CPU guarda su estado ([PC] y registro de banderas) en la pila y salta al vector asociado con ese evento. <br /><br />Luego de manejar el evento, la ejecución suele continuar desde donde se interrumpió.",
		fr:
			"Un signal qui met en pause le programme actuel pour gérer un événement spécifique. <br /><br />Quand un tel événement se produit, le CPU sauvegarde son état ([PC] et registre de flags) dans la pile et saute vers le vecteur associé à cet événement. <br /><br />Après avoir géré l'événement, l'exécution reprend généralement là où elle s'était arrêtée.",
		ru:
			"Сигнал, который приостанавливает текущую программу ради обработки определённого события. <br /><br />CPU сохраняет своё состояние ([PC] и регистр флагов) в стеке и переходит по вектору, связанному с этим событием. <br /><br />После обработки выполнение обычно возвращается туда, где остановилось.",
	},
	"CPU register|_CPU registers": {
		also: {
			es: "Registro de CPU|_Registros de CPU",
			fr: "Registre CPU|_Registres CPU",
			ru:
				"Регистр CPU|_регистры CPU|_регистра CPU|_регистров CPU|_CPU register|_CPU registers",
		},
		icon: "🔢",
		en:
			"A small, fast storage location inside the CPU used to hold data temporarily (like numbers, memory addresses, or results of operations) while it's working. <br /><br />In the NEEES, each register can hold a single byte (`8` bits) of data, with the exception of [PC] which is `2` bytes wide.",
		es:
			"Una ubicación pequeña y de rápido acceso dentro de la CPU usada para almacenar datos temporalmente (como números, direcciones de memoria, o resultados de operaciones) mientras está operando. <br /><br />En la NEEES, cada registro puede almacenar un solo byte (`8` bits) de datos, con la excepción de [PC] que ocupa `2` bytes.",
		fr:
			"Un emplacement de stockage petit et rapide à l'intérieur du CPU, utilisé pour stocker temporairement des données (comme des nombres, des adresses mémoire ou des résultats d'opérations) pendant son fonctionnement. <br /><br />Dans la NEEES, chaque registre peut stocker un seul octet (`8` bits) de données, à l'exception de [PC] qui fait `2` octets.",
		ru:
			"Небольшая быстрая ячейка внутри CPU для временного хранения данных во время работы: чисел, адресов памяти или результатов операций. <br /><br />В NEEES каждый регистр вмещает один байт (`8` бит), кроме [PC], который занимает `2` байта.",
	},
	"Cycle|_Cycles": {
		also: {
			es: "Ciclo|_Ciclos",
			fr: "Cycle|_Cycles",
			ru: "Такт|_такты|_такта|_тактов|_Cycle|_Cycles",
		},
		icon: "🚲",
		en:
			"A unit used to measure time in the system. The CPU, PPU, and APU all do work cycle by cycle. <br /><br />The duration of a cycle depends on the speed of each unit.",
		es:
			"Una unidad usada para medir el tiempo en el sistema. La CPU, la PPU y la APU hacen su trabajo ciclo a ciclo. <br /><br />La duración de un ciclo depende de la velocidad de cada unidad.",
		fr:
			"Une unité utilisée pour mesurer le temps dans le système. Le CPU, la PPU et l'APU travaillent cycle par cycle. <br /><br />La durée d'un cycle dépend de la vitesse de chaque unité.",
		ru:
			"Единица измерения времени в системе. CPU, PPU и APU выполняют работу такт за тактом. <br /><br />Длительность такта зависит от скорости каждого блока.",
	},
	"Divider period": {
		also: {
			es: "Período de divisor",
			fr: "Période du diviseur",
			ru: "Период делителя|_периода делителя|_Divider period",
		},
		icon: "⏰",
		en:
			"The number of cycles a divider waits before triggering its next output. <br /><br />For example, with a divider period of `15`, the divider will generate a timing pulse every `15` cycles.",
		es:
			"La cantidad de ciclos que un divisor espera antes de generar su siguiente salida. <br /><br />Por ejemplo, con un período de divisor de `15`, este generará un pulso de temporización cada `15` ciclos.",
		fr:
			"Le nombre de cycles qu'un diviseur attend avant de déclencher sa prochaine sortie. <br /><br />Par exemple, avec une période de diviseur de `15`, le diviseur génère une impulsion de synchronisation toutes les `15` cycles.",
		ru:
			"Число тактов, которое делитель ждёт до следующего выходного импульса. <br /><br />Например, при периоде `15` делитель создаёт импульс каждые `15` тактов.",
	},
	"Divider|_Dividers": {
		also: {
			es: "Divisor|_Divisores",
			fr: "Diviseur|_Diviseurs",
			ru: "Делитель|_делителя|_делители|_делителей|_Divider|_Dividers",
		},
		icon: "⏰",
		en:
			"A counter that reduces the system's master clock to a slower periodic signal by counting cycles and triggering an event at a fixed interval. <br /><br />It is used to clock other units at a slower rate. <br /><br />See also: Divider period.",
		es:
			"Un contador que reduce el reloj maestro del sistema a una señal periódica más lenta contando ciclos y activando un evento a intervalos fijos. <br /><br />Se usa para sincronizar otras unidades a una velocidad más baja. <br /><br />Ver también: Período de divisor.",
		fr:
			"Un compteur qui réduit l'horloge maître du système à un signal périodique plus lent en comptant les cycles et en déclenchant un événement à intervalle fixe. <br /><br />Il est utilisé pour cadencer d'autres unités à une vitesse plus basse. <br /><br />Voir aussi : Période du diviseur.",
		ru:
			"Счётчик, который превращает основной тактовый сигнал системы в более медленный периодический сигнал: считает такты и вызывает событие через фиксированные интервалы. <br /><br />Он задаёт более медленный ритм работы других блоков. <br /><br />См. также: период делителя.",
	},
	"DMA|DMA transfer": {
		also: {
			es: "DMA|Transferencia DMA",
			fr: "DMA|Transfert DMA",
			ru: "DMA|Передача DMA|_передачи DMA|_DMA transfer",
		},
		icon: "⚡",
		en:
			"_(Direct Memory Access)_ A mechanism that copies data from one memory area to another without using the CPU to move each byte manually. <br /><br />In the NEEES, DMA is only available to transfer OAM data through the OAMDMA register.",
		es:
			"_(Direct Memory Access)_ Un mecanismo que copia datos de una zona de memoria a otra sin que la CPU tenga que mover cada byte manualmente. <br /><br />En la NEEES, el DMA solo está disponible para transferir datos de OAM usando el registro OAMDMA.",
		fr:
			"_(Accès Direct à la Mémoire)_ Un mécanisme qui copie des données d'une zone mémoire à une autre sans que le CPU ait à déplacer chaque octet manuellement. <br /><br />Dans la NEEES, le DMA n'est disponible que pour transférer des données OAM via le registre OAMDMA.",
		ru:
			"_(Direct Memory Access, прямой доступ к памяти)_ Механизм копирования данных из одной области памяти в другую без участия CPU в переносе каждого байта. <br /><br />В NEEES DMA используется только для передачи данных OAM через регистр OAMDMA.",
	},
	"DMC Channel|DMC": {
		also: {
			es: "Canal DMC|DMC",
			fr: "Canal DMC|DMC",
			ru: "DMC-канал|DMC|_DMC-канала|_DMC Channel",
		},
		icon: "📦",
		en:
			"One of the APU's audio channels. It plays back digital samples from memory using the Delta Modulation technique, but it also can load samples directly.",
		es:
			"Uno de los canales de audio de la APU. Reproduce samples digitales desde la memoria usando la técnica de Modulación Delta, pero también puede cargar samples directamente.",
		fr:
			"L'un des canaux audio de l'APU. Il lit des samples numériques depuis la mémoire en utilisant la technique de Modulation Delta, mais peut aussi charger des samples directement.",
		ru:
			"Один из звуковых каналов APU. Воспроизводит цифровые сэмплы из памяти с помощью дельта-модуляции, а также позволяет загружать сэмплы напрямую.",
	},
	DMCControl: {
		icon: "📦",
		en:
			"An audio register that controls DMC Channel's sample playback, and sets its playback rate index. <br /><br />It is available at CPU address `$4010`.",
		es:
			"Un registro de audio que controla la reproducción de sample del Canal DMC, y ajusta su índice de tasa de reproducción. <br /><br />Está disponible en la dirección de CPU `$4010`.",
		fr:
			"Un registre audio qui contrôle la lecture de sample du Canal DMC et définit son index de vitesse de lecture. <br /><br />Il est disponible à l'adresse CPU `$4010`.",
		ru:
			"Аудиорегистр, который управляет воспроизведением сэмплов DMC-канала и задаёт индекс скорости воспроизведения. <br /><br />Доступен по адресу CPU `$4010`.",
	},
	DMCLoad: {
		icon: "📥",
		en:
			"An audio register that holds the direct `7`-bit sample level for the DMC Channel. <br /><br />It is available at CPU address `$4011`.",
		es:
			"Un registro de audio que contiene el nivel de sample directo de `7` bits para el Canal DMC. <br /><br />Está disponible en la dirección de CPU `$4011`.",
		fr:
			"Un registre audio qui contient le niveau de sample direct sur `7` bits pour le Canal DMC. <br /><br />Il est disponible à l'adresse CPU `$4011`.",
		ru:
			"Аудиорегистр, который хранит напрямую загруженный `7`-битный уровень сэмпла DMC-канала. <br /><br />Доступен по адресу CPU `$4011`.",
	},
	DMCSampleAddress: {
		icon: "🐏",
		en:
			"An audio register that sets the high byte of the DMC sample's start address in memory. <br /><br />It is available at CPU address `$4012`.",
		es:
			"Un registro de audio que establece el byte alto de la dirección de inicio del sample DMC en memoria. <br /><br />Está disponible en la dirección de CPU `$4012`.",
		fr:
			"Un registre audio qui définit l'octet de poids fort de l'adresse de début du sample DMC en mémoire. <br /><br />Il est disponible à l'adresse CPU `$4012`.",
		ru:
			"Аудиорегистр, который задаёт старший байт начального адреса DMC-сэмпла в памяти. <br /><br />Доступен по адресу CPU `$4012`.",
	},
	DMCSampleLength: {
		icon: "📐",
		en:
			"An audio register that sets the length (in bytes) of the DMC sample to play. <br /><br />It is available at CPU address `$4013`.",
		es:
			"Un registro de audio que establece la longitud (en bytes) del sample DMC a reproducir. <br /><br />Está disponible en la dirección de CPU `$4013`.",
		fr:
			"Un registre audio qui définit la longueur (en octets) du sample DMC à lire. <br /><br />Il est disponible à l'adresse CPU `$4013`.",
		ru:
			"Аудиорегистр, который задаёт длину воспроизводимого DMC-сэмпла в байтах. <br /><br />Доступен по адресу CPU `$4013`.",
	},
	"DPCM|Delta Modulation": {
		also: {
			es: "DPCM|Modulación Delta",
			fr: "DPCM|Modulation Delta",
			ru: "DPCM|Дельта-модуляция|_дельта-модуляции|_Delta Modulation",
		},
		icon: "🤏",
		en:
			"_Delta Pulse-Code Modulation_, the audio compression format used by the DMC Channel when not using the _direct load_ mode. <br /><br />Samples are stored as the difference (delta) from the previous sample.",
		es:
			"_Delta Pulse-Code Modulation_, el formato de compresión de audio usado por el Canal DMC cuando no se usa el modo de _carga directa_. <br /><br />Los samples se almacenan como la diferencia (delta) respecto al sample anterior.",
		fr:
			"_Delta Pulse-Code Modulation_, le format de compression audio utilisé par le Canal DMC quand il n'utilise pas le mode de _chargement direct_. <br /><br />Les samples sont stockés comme la différence (delta) par rapport au sample précédent.",
		ru:
			"_Delta Pulse-Code Modulation_ — формат сжатия звука, который DMC-канал использует вне режима _прямой загрузки_. <br /><br />Сэмплы хранятся как разница (дельта) относительно предыдущего сэмпла.",
	},
	"Duty cycle|_Duty cycles": {
		also: {
			es: "Ciclo de trabajo|_Ciclos de trabajo",
			fr: "Rapport cyclique|_Rapports cycliques",
			ru:
				"Коэффициент заполнения|_коэффициента заполнения|_коэффициенты заполнения|_Duty cycle|_Duty cycles",
		},
		icon: "📊",
		en:
			"The percentage of time a pulse wave stays high during one period. Affects the tone and timbre of the sound. <br /><br />In the NEEES, Pulse Channels supports `4` duty cycles: `0` (`12.5%`), `1` (`25%`), `2` (`50%`) and `3` (`75%`).",
		es:
			"El porcentaje de tiempo que una onda de pulso se mantiene alta durante un período. Afecta el tono y el timbre del sonido. <br /><br />En la NEEES, los Canales Pulso soportan `4` ciclos de trabajo: `0` (`12.5%`), `1` (`25%`), `2` (`50%`) y `3` (`75%`).",
		fr:
			"Le pourcentage du temps qu'une onde pulse reste haute pendant une période. Affecte le timbre du son. <br /><br />Dans la NEEES, les Canaux Pulse supportent `4` rapports cycliques : `0` (`12.5%`), `1` (`25%`), `2` (`50%`) et `3` (`75%`).",
		ru:
			"Доля периода в процентах, в течение которой импульсная волна остаётся на высоком уровне. Влияет на тон и тембр звука. <br /><br />Импульсные каналы NEEES поддерживают `4` коэффициента заполнения: `0` (`12.5%`), `1` (`25%`), `2` (`50%`) и `3` (`75%`).",
	},
	"Emulator core": {
		also: {
			es: "Núcleo de emulador",
			fr: "Noyau d'émulateur",
			ru: "Ядро эмулятора|_ядра эмулятора|_Emulator core",
		},
		icon: "🌀",
		en:
			"The component of an emulator responsible for simulating the target system's hardware components (CPU, PPU, APU, and memory buses) in software.",
		es:
			"La parte de un emulador encargada de simular por software los componentes de hardware del sistema objetivo (CPU, PPU, APU y buses de memoria).",
		fr:
			"Le composant d'un émulateur chargé de simuler les composants matériels du système cible (CPU, PPU, APU et bus mémoire) en logiciel.",
		ru:
			"Компонент эмулятора, который программно воспроизводит работу оборудования целевой системы: CPU, PPU, APU и шин памяти.",
	},
	"Emulator frontend": {
		also: {
			es: "Frontend del emulador",
			fr: "Interface de l'émulateur",
			ru:
				"Интерфейс эмулятора|Фронтенд эмулятора|_интерфейса эмулятора|_Emulator frontend",
		},
		icon: "🌸",
		en:
			"The component of an emulator that provides the user interface, input handling, and configuration surrounding the core simulation.",
		es:
			"La parte de un emulador que proporciona la interfaz de usuario, gestiona las entradas y la configuración alrededor de la simulación del núcleo.",
		fr:
			"Le composant d'un émulateur qui fournit l'interface utilisateur, la gestion des entrées et la configuration autour de la simulation du noyau.",
		ru:
			"Компонент эмулятора, который обеспечивает пользовательский интерфейс, обработку ввода и настройки вокруг ядра эмуляции.",
	},
	"Five-step sequence|Five-step": {
		also: {
			es: "Secuencia de cinco pasos|Cinco pasos",
			fr: "Séquence en cinq étapes|Cinq étapes",
			ru:
				"Пятишаговая последовательность|Пять шагов|_пятишаговой последовательности|_Five-step sequence|_Five-step",
		},
		icon: "🔀",
		en: "A mode of the frame sequencer that runs a five-step pattern.",
		es:
			"Un modo del secuenciador de frames que ejecuta un patrón de cinco pasos.",
		fr:
			"Un mode du séquenceur de frames qui exécute un pattern en cinq étapes.",
		ru:
			"Режим секвенсора кадров, в котором выполняется последовательность из пяти шагов.",
	},
	"Flag|_Flags": {
		also: {
			es: "Bandera|_Banderas",
			fr: "Flag|_Flags",
			ru: "Флаг|_флаги|_флага|_флагов|_Flag|_Flags",
		},
		icon: "🏁",
		en:
			"A field that stores a value that can be either `true` or `false`. <br /><br />See also: CPU Flag.",
		es:
			"Un campo que almacena un valor que puede ser `true` o `false`. <br /><br />Ver también: Bandera de CPU.",
		fr:
			"Un champ qui stocke une valeur qui peut être `true` ou `false`. <br /><br />Voir aussi : Flag CPU.",
		ru:
			"Поле, в котором хранится одно из двух значений: `true` или `false`. <br /><br />См. также: флаг CPU.",
	},
	"Flags Register|P register": {
		also: {
			es: "Registro de Banderas|Registro P",
			fr: "Registre de Flags|Registre P",
			ru:
				"Регистр флагов|Регистр P|_регистра флагов|_Flags Register|_P register",
		},
		icon: "🔢",
		en: "A CPU register used to store multiple CPU flags.",
		es: "Un registro de CPU usado para almacenar múltiples banderas de CPU.",
		fr: "Un registre CPU utilisé pour stocker plusieurs flags CPU.",
		ru: "Регистр CPU, в котором хранится несколько флагов CPU.",
	},
	"Four-step sequence|Four-step": {
		also: {
			es: "Secuencia de cuatro pasos|Cuatro pasos",
			fr: "Séquence en quatre étapes|Quatre étapes",
			ru:
				"Четырёхшаговая последовательность|Четыре шага|_четырёхшаговой последовательности|_Four-step sequence|_Four-step",
		},
		icon: "🔀",
		en: "A mode of the frame sequencer that runs a four-step pattern.",
		es:
			"Un modo del secuenciador de frames que ejecuta un patrón de cuatro pasos.",
		fr:
			"Un mode du séquenceur de frames qui exécute un pattern en quatre étapes.",
		ru:
			"Режим секвенсора кадров, в котором выполняется последовательность из четырёх шагов.",
	},
	"Frame buffer": {
		icon: "🔢",
		en:
			"A block of memory that stores the color of each pixel on the screen. It's where the frame image is built before being displayed.",
		es:
			"Un bloque de memoria que almacena el color de cada píxel en pantalla. Es donde se construye la imagen del frame antes de mostrarse.",
		fr:
			"Un bloc de mémoire qui stocke la couleur de chaque pixel à l'écran. C'est là que l'image du frame est construite avant d'être affichée.",
		ru:
			"Область памяти, в которой хранится цвет каждого пикселя экрана. Здесь собирается изображение кадра перед выводом.",
		also: {
			fr: "Buffer de frame",
			ru: "Буфер кадра|_буфера кадра|_буфере кадра|_Frame buffer",
		},
	},
	"Frame|_Frames": {
		icon: "🖼️",
		en:
			"A full image drawn on the screen, made of multiple scanlines. <br /><br />In the NEEES, it's `256x240` pixels, and the PPU renders `60` of them per second.",
		es:
			"Una imagen completa dibujada en la pantalla, compuesta por múltiples scanlines. <br /><br />En la NEEES, mide `256x240` píxeles, y la PPU renderiza `60` por segundo.",
		fr:
			"Une image complète affichée à l'écran, composée de plusieurs scanlines. <br /><br />Dans la NEEES, elle fait `256x240` pixels, et la PPU en affiche `60` par seconde.",
		ru:
			"Полное изображение на экране, состоящее из строк развёртки. <br /><br />В NEEES его размер — `256x240` пикселей, и PPU рисует `60` кадров в секунду.",
		also: {
			fr: "Frame|_Frames",
			ru: "Кадр|_кадры|_кадра|_кадров|_кадре|_Frame|_Frames",
		},
	},
	Frequency: {
		also: {
			es: "Frecuencia",
			fr: "Fréquence",
			ru: "Частота|_частоты|_частоту|_частоте|_Frequency",
		},
		icon: "🎚️",
		en:
			"The number of times a wave repeats in one second. It determines the pitch of a sound. Measured in hertz (`Hz`). <br /><br />It is the inverse of the period.",
		es:
			"El número de veces que una onda se repite en un segundo. Determina el tono de un sonido. Se mide en hertz (`Hz`). <br /><br />Es la inversa del período.",
		fr:
			"Le nombre de fois qu'une onde se répète en une seconde. Détermine la hauteur d'un son. Mesurée en hertz (`Hz`). <br /><br />C'est l'inverse de la période.",
		ru:
			"Количество повторений волны за секунду. Определяет высоту звука и измеряется в герцах (`Гц`). <br /><br />Обратная величина периода.",
	},
	"Frequency sweep|_Frequency sweeps|Sweep|_Sweeps": {
		also: {
			es: "Barrido de frecuencia|_Barridos de frecuencia|Barrido|_Barridos",
			fr: "Balayage de fréquence|_Balayages de fréquence|Sweep|_Sweeps",
			ru:
				"Свип частоты|Свип|_свипа частоты|_свипа|_Frequency sweep|_Frequency sweeps|_Sweep|_Sweeps",
		},
		icon: "🧹",
		en:
			"A feature of Pulse Channels that periodically shifts their timer period up or down to create pitch-slide effects.",
		es:
			"Una característica de los Canales Pulso que desplaza periódicamente su periodo de timer hacia arriba o abajo para crear efectos de deslizamiento de tono.",
		fr:
			"Une fonction des Canaux Pulse qui déplace périodiquement leur période de timer vers le haut ou le bas pour créer des effets de glissement de hauteur.",
		ru:
			"Возможность импульсных каналов периодически увеличивать или уменьшать период таймера, создавая эффект скольжения высоты звука.",
	},
	"Half frame|Half-frame|_Half frames|_Half-frames": {
		icon: "🕧",
		en:
			"An event in the frame sequencer that occurs at every half sequence (second and fourth quarters), triggering length counter and sweep updates.",
		es:
			"Un evento de temporización en el secuenciador de frames que ocurre en el segundo y cuarto quarter-frame de su secuencia, activando las actualizaciones de contadores de longitud y barrido.",
		fr:
			"Un événement dans le séquenceur de frames qui se produit à chaque demi-séquence (deuxième et quatrième quarts), déclenchant les mises à jour des compteurs de longueur et des sweeps.",
		ru:
			"Событие секвенсора кадров, которое происходит в середине и в конце последовательности (на второй и четвёртой четвертях) и запускает обновление счётчиков длины и свипа.",
		also: {
			fr: "Demi-frame|_Demi-frames",
			ru:
				"Половина кадра|_половины кадра|_Half frame|_Half-frame|_Half frames|_Half-frames",
		},
	},
	"HBlank|Horizontal Blank": {
		icon: "🏝️",
		en:
			"Short period after each scanline is drawn, where the PPU is idle before starting the next one.",
		es:
			"Período corto después de dibujar cada scanline, donde la PPU queda inactiva antes de comenzar la siguiente.",
		fr:
			"Courte période après chaque scanline dessinée, où la PPU est inactive avant de commencer la suivante.",
		ru:
			"Короткий интервал после отрисовки строки развёртки, когда PPU простаивает перед началом следующей строки.",
		also: {
			fr: "HBlank|Balayage horizontal",
			ru: "HBlank|Горизонтальное гашение|_Horizontal Blank",
		},
	},
	iNEEES: {
		icon: "📝",
		en:
			"A format that describes a NEEES cartridge. It contains its code (PRG-ROM), graphics (CHR-ROM), and a metadata header.",
		es:
			"Un formato que describe un cartucho de NEEES. Contiene su código (PRG-ROM), gráficos (CHR-ROM), y un header con metadatos.",
		fr:
			"Un format qui décrit une cartouche NEEES. Il contient son code (PRG-ROM), ses graphismes (CHR-ROM) et un header de métadonnées.",
		ru:
			"Формат описания картриджа NEEES. Содержит код (PRG-ROM), графику (CHR-ROM) и заголовок с метаданными.",
	},
	"Instruction|_Instructions|CPU instruction|_CPU instructions": {
		also: {
			es: "Instrucción|_Instrucciones|Instrucción de CPU|_Instrucciones de CPU",
			fr: "Instruction|_Instructions|Instruction CPU|_Instructions CPU",
			ru:
				"Инструкция|Инструкция CPU|_инструкции|_инструкцию|_инструкций|_инструкции CPU|_Instruction|_Instructions|_CPU instruction|_CPU instructions",
		},
		icon: "📖",
		en:
			"A command that tells the CPU to do something, like adding numbers or jumping to another part of the program.",
		es:
			"Una orden que le dice a la CPU qué hacer, como sumar números o saltar a otra parte del programa.",
		fr:
			"Une commande qui dit au CPU quoi faire, comme additionner des nombres ou sauter vers une autre partie du programme.",
		ru:
			"Команда, которая указывает CPU выполнить действие: например, сложить числа или перейти к другой части программы.",
	},
	"Interrupt Disable Flag": {
		also: {
			es: "Bandera Interrupt Disable",
			fr: "Flag Interrupt Disable",
			ru:
				"Флаг запрета прерываний|_флага запрета прерываний|_Interrupt Disable Flag",
		},
		icon: "🏁",
		en: "A CPU flag that, when set, disables maskable CPU interrupts.",
		es:
			"Una bandera de CPU que, cuando está activa, desactiva las interrupciones enmascarables de la CPU.",
		fr:
			"Un flag CPU qui, quand il est activé, désactive les interruptions CPU masquables.",
		ru: "Флаг CPU, который при установке запрещает маскируемые прерывания CPU.",
	},
	"Interrupt vector|_Interrupt vectors|Vector|_Vectors": {
		also: {
			es: "Vector de interrupción|_Vectores de interrupción|Vector|_Vectores",
			fr: "Vecteur d'interruption|_Vecteurs d'interruption|Vecteur|_Vecteurs",
			ru:
				"Вектор прерывания|Вектор|_векторы прерываний|_вектора прерывания|_векторы|_вектора|_векторов|_Interrupt vector|_Interrupt vectors|_Vector|_Vectors",
		},
		icon: "🔢",
		en:
			"A well-known memory address associated with an event that triggers an interrupt.",
		es:
			"Una dirección de memoria conocida asociada a un evento que dispara una interrupción.",
		fr:
			"Une adresse mémoire connue associée à un événement qui déclenche une interruption.",
		ru:
			"Заранее известный адрес памяти, связанный с событием, которое вызывает прерывание.",
	},
	JavaScript: {
		icon: "🗣️",
		en:
			'A programming language created so that websites can proudly announce _"Welcome!"_ via an unstoppable alert box, but some people create emulators with it.',
		es:
			'Un lenguaje de programación creado para que los sitios web puedan anunciar orgullosamente _"¡Bienvenido!"_ mediante una caja de alerta imposible de cerrar, pero algunas personas hacen emuladores con él.',
		fr:
			'Un langage de programmation créé pour que les sites web puissent fièrement annoncer _"Bienvenue !"_ via une boîte d\'alerte impossible à fermer, mais certaines personnes créent des émulateurs avec.',
		ru:
			"Язык программирования, придуманный, чтобы сайты могли гордо объявлять _«Добро пожаловать!»_ через неудержимое окно alert. Но кое-кто пишет на нём эмуляторы.",
	},
	"Least significant byte|LSB|Low byte": {
		also: {
			es: "Byte menos significativo|LSB|Low byte|Byte bajo",
			fr: "Octet de poids faible|LSB|Low byte|Octet bas",
			ru: "Младший байт|LSB|_младшего байта|_Least significant byte|_Low byte",
		},
		icon: "🔢",
		en:
			"The byte with the lowest positional value in a multi-byte number. <br /><br />For example, the LSB of `$AB15` is `$15`.",
		es:
			"El byte con el valor posicional más bajo en un número multibyte. <br /><br />Por ejemplo, el LSB de `$AB15` es `$15`.",
		fr:
			"L'octet avec la valeur positionnelle la plus basse dans un nombre multi-octets. <br /><br />Par exemple, le LSB de `$AB15` est `$15`.",
		ru:
			"Байт с наименьшим разрядным весом в многобайтном числе. <br /><br />Например, LSB числа `$AB15` — это `$15`.",
	},
	"Length counter|_Length counters": {
		also: {
			es: "Contador de longitud|_Contadores de longitud",
			fr: "Compteur de longueur|_Compteurs de longueur",
			ru:
				"Счётчик длины|_счётчика длины|_счётчики длины|_счётчиков длины|_Length counter|_Length counters",
		},
		icon: "📏",
		en:
			"A counter that determines the length of the notes. When it reaches zero, the channel silences.",
		es:
			"Un contador que determina la longitud de las notas. Al llegar a cero, silencia el canal.",
		fr:
			"Un compteur qui détermine la durée des notes. Quand il atteint zéro, le canal se tait.",
		ru:
			"Счётчик, который определяет длительность нот. Когда он достигает нуля, канал замолкает.",
	},
	"Linear length counter|_Linear length counters": {
		also: {
			es: "Contador lineal de longitud|_Contadores lineales de longitud",
			fr: "Compteur linéaire de longueur|_Compteurs linéaires de longueur",
			ru:
				"Линейный счётчик длины|_линейного счётчика длины|_линейные счётчики длины|_Linear length counter|_Linear length counters",
		},
		icon: "📏",
		en:
			"A special length counter present in the Triangle Channel whose register value maps directly (linearly) to the number of ticks before silencing. Regular length counters use an index into a predefined table of durations instead.",
		es:
			"Un contador especial del Canal Triangular cuyo valor de registro se asigna de forma directa (lineal) al número de ciclos antes de silenciar. Los contadores de longitud normales usan un índice en una tabla predefinida de duraciones.",
		fr:
			"Un compteur de longueur spécial du Canal Triangulaire dont la valeur du registre correspond directement (linéairement) au nombre de tops avant le silence. Les compteurs de longueur normaux utilisent un index dans une table prédéfinie de durées.",
		ru:
			"Особый счётчик длины в треугольном канале: значение регистра напрямую (линейно) задаёт число тактов до отключения звука. Обычные счётчики длины вместо этого используют индекс в заранее заданной таблице длительностей.",
	},
	"Little Endian": {
		icon: "🔢",
		en:
			"A convention where the least significant byte is stored first in memory.",
		es:
			"Una convención donde el byte menos significativo se almacena primero en memoria.",
		fr:
			"Une convention où l'octet de poids faible est stocké en premier en mémoire.",
		ru:
			"Порядок хранения, при котором младший байт числа записывается в память первым.",
		also: {
			fr: "Little Endian",
			ru: "Little Endian|Младший байт первым",
		},
	},
	"Machine code|Game code|_Game's code|_Games' code": {
		also: {
			es:
				"Código máquina|Código de juego|_Código del juego|_Código de los juegos",
			fr: "Code machine|Code de jeu",
			ru:
				"Машинный код|Код игры|_машинного кода|_кода игры|_Machine code|_Game code|_Game's code|_Games' code",
		},
		icon: "🔢",
		en:
			"The bytes that the CPU interprets as code. It's often the product of translating assembly code, written by humans.",
		es:
			"Los bytes que la CPU interpreta como código. A menudo es el producto de traducir lenguaje ensamblador escrito por humanos.",
		fr:
			"Les octets que le CPU interprète comme du code. C'est souvent le résultat de la traduction du code assembleur écrit par des humains.",
		ru:
			"Байты, которые CPU интерпретирует как код. Часто они получаются при переводе написанного людьми кода на ассемблере.",
	},
	"Mapper|_Mappers": {
		icon: "🗜️",
		en:
			"A chip in the cartridge that extends what the console can do, like adding more PRG-ROM or CHR-ROM banks or providing features such as switching mirroring types.",
		es:
			"Un chip en el cartucho que extiende lo que la consola puede hacer, como agregar más bancos de PRG-ROM o CHR-ROM, o proporcionar funciones como cambiar el tipo de mirroring.",
		fr:
			"Une puce dans la cartouche qui étend les capacités de la console, comme ajouter plus de banques PRG-ROM ou CHR-ROM, ou fournir des fonctionnalités comme le changement de type de mirroring.",
		ru:
			"Микросхема картриджа, которая расширяет возможности консоли: добавляет банки PRG-ROM или CHR-ROM либо даёт новые функции, например переключение типа зеркалирования.",
		also: {
			fr: "Mapper|_Mappers",
			ru: "Маппер|_маппера|_мапперы|_мапперов|_Mapper|_Mappers",
		},
	},
	"Master palette": {
		also: {
			es: "Paleta maestra",
			fr: "Palette maîtresse",
			ru:
				"Основная палитра|_основной палитры|_основную палитру|_Master palette",
		},
		icon: "👑🎨",
		en:
			"A list of `64` colors, hardcoded. Palettes reference these colors with indexes from `$00` to `$3F`.",
		es:
			"Una lista de `64` colores, hardcodeada. Las paletas referencian estos colores con índices de `$00` a `$3F`.",
		fr:
			"Une liste de `64` couleurs, codées en dur. Les palettes référencent ces couleurs avec des index de `$00` à `$3F`.",
		ru:
			"Заранее заданный список из `64` цветов. Палитры ссылаются на них по индексам от `$00` до `$3F`.",
	},
	"Memory address|_Memory addresses|Address|_Addresses": {
		also: {
			es: "Dirección de memoria|_Direcciones de memoria|Dirección|_Direcciones",
			fr: "Adresse mémoire|_Adresses mémoire|Adresse|_Adresses",
			ru:
				"Адрес памяти|Адрес|_адреса памяти|_адресов памяти|_адреса|_адресов|_Memory address|_Memory addresses|_Address|_Addresses",
		},
		icon: "🐏",
		en:
			"A number that represents a location in memory. <br /><br />In the NEEES, they take up `2` bytes, so they can go from `0` (`$0000`) to `65535` (`$FFFF`).",
		es:
			"Un número que representa una ubicación dentro de la memoria. <br /><br />En la NEEES, ocupan `2` bytes, por lo que pueden ir de `0` (`$0000`) a `65535` (`$FFFF`).",
		fr:
			"Un nombre qui représente un emplacement en mémoire. <br /><br />Dans la NEEES, ils occupent `2` octets, donc ils peuvent aller de `0` (`$0000`) à `65535` (`$FFFF`).",
		ru:
			"Число, которое обозначает расположение данных в памяти. <br /><br />В NEEES адрес занимает `2` байта, поэтому диапазон — от `0` (`$0000`) до `65535` (`$FFFF`).",
	},
	"Memory bus|_Memory buses": {
		also: {
			es: "Bus de memoria|_Buses de memoria",
			fr: "Bus mémoire|_Bus mémoires",
			ru:
				"Шина памяти|_шины памяти|_шину памяти|_шин памяти|_Memory bus|_Memory buses",
		},
		icon: "🚌",
		en:
			"The set of connections that link components to memory, enabling them to read or write data.",
		es:
			"El conjunto de conexiones que enlaza los componentes con la memoria, permitiéndoles leer o escribir datos.",
		fr:
			"L'ensemble des connexions qui relient les composants à la mémoire, leur permettant de lire ou d'écrire des données.",
		ru:
			"Соединения между компонентами и памятью, которые позволяют читать и записывать данные.",
	},
	"Memory mirror|_Memory mirrors|Mirror|_Mirrors": {
		also: {
			es: "Espejo de memoria|_Espejos de memoria|Espejo|_Espejos",
			fr: "Miroir mémoire|_Miroirs mémoire|Miroir|_Miroirs",
			ru:
				"Зеркало памяти|Зеркало|_зеркала памяти|_зеркала|_зеркал|_Memory mirror|_Memory mirrors|_Mirror|_Mirrors",
		},
		icon: "🚽",
		en:
			"A copy of a memory region that appears at another address. They are used to fill unused address space or to provide alternative access points. <br /><br />In the NEEES, many CPU and PPU regions are mirrored across the address space. <br /><br />See also: Mirroring.",
		es:
			"Una copia de una región de memoria que aparece en otra dirección. Se usan para llenar espacio sin usar o para ofrecer accesos alternativos. <br /><br />En la NEEES, muchas regiones de la CPU y la PPU están espejadas a lo largo del espacio de direcciones. <br /><br />Ver también: Mirroring.",
		fr:
			"Une copie d'une région mémoire qui apparaît à une autre adresse. Ils sont utilisés pour remplir l'espace d'adressage inutilisé ou pour fournir des points d'accès alternatifs. <br /><br />Dans la NEEES, de nombreuses régions CPU et PPU sont dupliquées dans l'espace d'adressage. <br /><br />Voir aussi : Mirroring.",
		ru:
			"Копия области памяти, доступная по другому адресу. Зеркала заполняют неиспользуемое адресное пространство или дают альтернативные точки доступа. <br /><br />В NEEES многие области CPU и PPU имеют зеркала в адресном пространстве. <br /><br />См. также: зеркалирование.",
	},
	"Memory-mapped register|_Memory-mapped registers": {
		also: {
			es: "Registro mapeado en memoria|_Registros mapeados en memoria",
			fr: "Registre mappé en mémoire|_Registres mappés en mémoire",
			ru:
				"Регистр, отображённый в память|Регистры, отображённые в память|_регистра, отображённого в память|_Memory-mapped register|_Memory-mapped registers",
		},
		icon: "🐏",
		en:
			"A special memory address used to interact with hardware. Unlike CPU registers, reading or writing to them may trigger hardware behavior rather than just storing a value. <br /><br />In the NEEES, the PPU, APU, Controller, and Mappers expose these addresses so the game code can interact with the units through them.",
		es:
			"Una dirección de memoria especial usada para interactuar con el hardware. A diferencia de los registros de CPU, leer o escribir en ellos puede activar comportamientos del hardware en lugar de simplemente almacenar un valor. <br /><br />En la NEEES, la PPU, la APU, el Mando y los Mappers exponen estas direcciones para que el código del juego pueda comunicarse con ellos.",
		fr:
			"Une adresse mémoire spéciale utilisée pour interagir avec le matériel. Contrairement aux registres CPU, lire ou écrire dessus peut déclencher un comportement matériel plutôt que de simplement stocker une valeur. <br /><br />Dans la NEEES, la PPU, l'APU, les manettes et les Mappers exposent ces adresses pour que le code du jeu puisse communiquer avec eux.",
		ru:
			"Особый адрес памяти для взаимодействия с оборудованием. В отличие от регистров CPU, чтение или запись могут запускать действия устройства, а не просто сохранять значение. <br /><br />В NEEES PPU, APU, контроллеры и мапперы предоставляют такие адреса, чтобы код игры мог обращаться к ним.",
	},
	Mirroring: {
		icon: "🚽",
		en:
			"The mirroring type affects the screen arrangement and how the game will handle scrolling. <br /><br />See also: Memory mirror.",
		es:
			"El tipo de mirroring afecta la disposición de la pantalla y cómo el juego maneja el scrolling. <br /><br />Ver también: Espejo de memoria",
		fr:
			"Le type de mirroring affecte l'arrangement des écrans et la façon dont le jeu gère le scrolling. <br /><br />Voir aussi : Miroir mémoire.",
		ru:
			"Тип зеркалирования влияет на расположение экранов и на то, как игра выполняет прокрутку. <br /><br />См. также: зеркало памяти.",
		also: {
			fr: "Mirroring",
			ru: "Зеркалирование|_зеркалирования|_зеркалированием|_Mirroring",
		},
	},
	"Most significant byte|MSB|High byte": {
		also: {
			es: "Byte más significativo|MSB|High byte|Byte alto",
			fr: "Octet de poids fort|MSB|High byte|Octet haut",
			ru: "Старший байт|MSB|_старшего байта|_Most significant byte|_High byte",
		},
		icon: "🔢",
		en:
			"The byte with the highest positional value in a multi-byte number. <br /><br />For example, the MSB of `$AB15` is `$AB`.",
		es:
			"El byte con el valor posicional más alto en un número multibyte. <br /><br />Por ejemplo, el MSB de `$AB15` es `$AB`.",
		fr:
			"L'octet avec la valeur positionnelle la plus haute dans un nombre multi-octets. <br /><br />Par exemple, le MSB de `$AB15` est `$AB`.",
		ru:
			"Байт с наибольшим разрядным весом в многобайтном числе. <br /><br />Например, MSB числа `$AB15` — это `$AB`.",
	},
	"Name table|_Name tables|_Nametable|_Nametables": {
		icon: "🏞️📖",
		en: "A map of tile indexes for backgrounds, stored in VRAM.",
		es: "Un mapa de índices de tiles para fondos, almacenado en VRAM.",
		fr: "Une carte d'index de tiles pour les fonds, stockée en VRAM.",
		ru: "Карта индексов тайлов для фона, которая хранится в VRAM.",
		also: {
			fr: "Name table|_Name tables",
			ru:
				"Таблица имён|_таблицы имён|_таблиц имён|_таблице имён|_таблицу имён|_Name table|_Name tables|_Nametable|_Nametables",
		},
	},
	NEEES: {
		icon: "🕹️",
		en:
			"The piece of hardware we're trying to emulate. People think it means _'No Entiendo' Enigmatic Enjoyment Solution_.",
		es:
			"La pieza de hardware que estamos tratando de emular. La gente piensa que significa _'No Entiendo' El Entretenimiento Saludable_.",
		fr:
			"La pièce matérielle qu'on essaie d'émuler. Les gens pensent que ça signifie _'No Entiendo' Énigmatique Évasion Survoltée_.",
		ru:
			"Устройство, которое мы пытаемся эмулировать. Считается, что название расшифровывается как _'No Entiendo' Enigmatic Enjoyment Solution_.",
	},
	"Negative Flag": {
		also: {
			es: "Bandera Negative",
			fr: "Flag Negative",
			ru:
				"Флаг отрицательного результата|Флаг знака|_флага отрицательного результата|_Negative Flag",
		},
		icon: "🏁",
		en:
			"A CPU flag that indicates when the result of an operation is a negative number.",
		es:
			"Una bandera de CPU que indica cuando el resultado de una operación es un número negativo.",
		fr:
			"Un flag CPU qui indique quand le résultat d'une opération est un nombre négatif.",
		ru:
			"Флаг CPU, который показывает, что результат операции — отрицательное число.",
	},
	NMI: {
		icon: "📹",
		en:
			"_(Non-maskable interrupt)_ A CPU interrupt triggered at the start of VBlank, when the PPU finishes drawing a frame.",
		es:
			"_(Non-maskable interrupt)_ Una interrupción de CPU disparada al principio del VBlank, cuando la PPU termina de dibujar un frame.",
		fr:
			"_(Interruption non masquable)_ Une interruption CPU déclenchée au début du VBlank, quand la PPU finit de dessiner un frame.",
		ru:
			"_(Non-maskable interrupt, немаскируемое прерывание)_ Прерывание CPU, которое возникает в начале VBlank, когда PPU заканчивает рисовать кадр.",
	},
	"Noise Channel": {
		also: {
			es: "Canal Ruido",
			fr: "Canal Bruit",
			ru: "Шумовой канал|_шумового канала|_шумовом канале|_Noise Channel",
		},
		icon: "💥",
		en:
			"One of the APU's audio channels. It generates a random-sounding signal, useful for percussion or sound effects like explosions.",
		es:
			"Uno de los canales de audio de la APU. Genera una señal con sonido aleatorio, útil para percusión o efectos como explosiones.",
		fr:
			"L'un des canaux audio de l'APU. Il génère un signal au son aléatoire, utile pour la percussion ou les effets sonores comme les explosions.",
		ru:
			"Один из звуковых каналов APU. Создаёт сигнал, похожий на случайный шум, удобный для ударных и звуковых эффектов вроде взрывов.",
	},
	NoiseControl: {
		icon: "💥",
		en:
			"An audio register that configures the Noise Channel's envelope and length counter behavior. <br /><br />It is available at CPU address `$400C`.",
		es:
			"Un registro de audio que configura la envolvente y el comportamiento del contador de longitud del Canal Ruido. <br /><br />Está disponible en la dirección de CPU `$400C`.",
		fr:
			"Un registre audio qui configure l'enveloppe et le comportement du compteur de longueur du Canal Bruit. <br /><br />Il est disponible à l'adresse CPU `$400C`.",
		ru:
			"Аудиорегистр, который настраивает огибающую и поведение счётчика длины шумового канала. <br /><br />Доступен по адресу CPU `$400C`.",
	},
	NoiseForm: {
		icon: "🌪️",
		en:
			"An audio register that selects the Noise Channel's mode (periodic or white noise) and its period. <br /><br />It is available at CPU address `$400E`.",
		es:
			"Un registro de audio que selecciona el modo del Canal Ruido (ruido periódico o blanco) y su periodo. <br /><br />Está disponible en la dirección de CPU `$400E`.",
		fr:
			"Un registre audio qui sélectionne le mode du Canal Bruit (bruit périodique ou bruit blanc) et sa période. <br /><br />Il est disponible à l'adresse CPU `$400E`.",
		ru:
			"Аудиорегистр, который выбирает режим шумового канала (периодический или белый шум) и его период. <br /><br />Доступен по адресу CPU `$400E`.",
	},
	NoiseLCL: {
		icon: "📏",
		en:
			"An audio register that loads the Noise Channel's length counter and restarts its envelope. <br /><br />It is available at CPU address `$400F`.",
		es:
			"Un registro de audio que carga el contador de longitud del Canal Ruido y reinicia su envolvente. <br /><br />Está disponible en la dirección de CPU `$400F`.",
		fr:
			"Un registre audio qui charge le compteur de longueur du Canal Bruit et redémarre son enveloppe. <br /><br />Il est disponible à l'adresse CPU `$400F`.",
		ru:
			"Аудиорегистр, который загружает счётчик длины шумового канала и перезапускает его огибающую. <br /><br />Доступен по адресу CPU `$400F`.",
	},
	"OAM entry|_OAM entries": {
		also: {
			es: "Entrada OAM|_Entradas OAM",
			fr: "Entrée OAM|_Entrées OAM",
			ru: "Запись OAM|_записи OAM|_записей OAM|_OAM entry|_OAM entries",
		},
		icon: "🛸📖",
		en: "An entry inside the OAM table.",
		es: "Una entrada dentro de la tabla OAM.",
		fr: "Une entrée dans la table OAM.",
		ru: "Запись в таблице OAM.",
	},
	"OAM RAM": {
		icon: "🐏",
		en:
			"A dedicated RAM area used to store the contents of OAM. <br /><br />In the NEEES, it's `256` bytes and holds all the sprite data.",
		es:
			"Una RAM dedicada usada para almacenar el contenido de OAM. <br /><br />En la NEEES, son `256` bytes que contienen todos los datos de los sprites.",
		fr:
			"Une zone RAM dédiée pour stocker le contenu de l'OAM. <br /><br />Dans la NEEES, elle fait `256` octets et contient toutes les données des sprites.",
		ru:
			"Отдельная область RAM для хранения содержимого OAM. <br /><br />В NEEES она занимает `256` байт и содержит все данные спрайтов.",
	},
	"OAM|OAM table": {
		also: {
			es: "OAM|Tabla OAM",
			fr: "OAM|Table OAM",
			ru: "OAM|Таблица OAM|_таблицы OAM|_таблице OAM|_OAM table",
		},
		icon: "🛸📖",
		en: "_(Object Attribute Memory)_ A list of sprites, stored in OAM RAM.",
		es:
			"_(Object Attribute Memory)_ Una lista de sprites, almacenada en OAM RAM.",
		fr:
			"_(Object Attribute Memory)_ Une liste de sprites, stockée dans l'OAM RAM.",
		ru:
			"_(Object Attribute Memory, память атрибутов объектов)_ Список спрайтов, который хранится в OAM RAM.",
	},
	OAMAddr: {
		icon: "🏠",
		en:
			"A video register that sets the address inside OAM where the next sprite data will be read or written. <br /><br />It is available at CPU address `$2003`.",
		es:
			"Un registro de video que establece la dirección dentro de OAM donde se leerán o escribirán los datos del próximo sprite. <br /><br />Está disponible en la dirección de CPU `$2003`.",
		fr:
			"Un registre vidéo qui définit l'adresse à l'intérieur de l'OAM où les prochaines données de sprite seront lues ou écrites. <br /><br />Il est disponible à l'adresse CPU `$2003`.",
		ru:
			"Видеорегистр, который задаёт адрес внутри OAM для следующего чтения или записи данных спрайта. <br /><br />Доступен по адресу CPU `$2003`.",
	},
	OAMData: {
		icon: "📝",
		en:
			"A video register that reads or writes OAM data at the address pointed by OAMAddr. After each read/write, OAMAddr is auto-incremented. <br /><br />It is available at CPU address `$2004`.",
		es:
			"Un registro de video que lee o escribe datos OAM en la dirección apuntada por OAMAddr. Luego de cada lectura/escritura, OAMAddr es autoincrementada. <br /><br />Está disponible en la dirección de CPU `$2004`.",
		fr:
			"Un registre vidéo qui lit ou écrit des données OAM à l'adresse pointée par OAMAddr. Après chaque lecture/écriture, OAMAddr est auto-incrémentée. <br /><br />Il est disponible à l'adresse CPU `$2004`.",
		ru:
			"Видеорегистр, который читает или записывает данные OAM по адресу из OAMAddr. После каждого чтения или записи OAMAddr автоматически увеличивается. <br /><br />Доступен по адресу CPU `$2004`.",
	},
	OAMDMA: {
		icon: "⚡",
		en:
			"A video register that triggers a DMA transfer, copying `256` bytes from CPU memory into OAM to update all sprite data quickly. <br /><br />It is available at CPU address `$4014`.",
		es:
			"Un registro de video que dispara una transferencia DMA, copiando `256` bytes desde la memoria de CPU hacia OAM para actualizar todos los datos de sprites rápidamente. <br /><br />Está disponible en la dirección de CPU `$4014`.",
		fr:
			"Un registre vidéo qui déclenche un transfert DMA, copiant `256` octets de la mémoire CPU vers l'OAM pour mettre à jour rapidement toutes les données des sprites. <br /><br />Il est disponible à l'adresse CPU `$4014`.",
		ru:
			"Видеорегистр, который запускает передачу DMA: копирует `256` байт из памяти CPU в OAM, быстро обновляя все данные спрайтов. <br /><br />Доступен по адресу CPU `$4014`.",
	},
	"Opcode|_Opcodes": {
		icon: "🔢",
		en:
			"_(Operation code)_ A number that, inside the machine code, represents an instruction code. <br /><br />In the NEEES, it defines both the instruction and the addressing mode.",
		es:
			"_(Operation code)_ Un número que, dentro del código máquina, define un código de instrucción. <br /><br />En la NEEES, define tanto la instrucción como el modo de direccionamiento.",
		fr:
			"_(Code d'opération)_ Un nombre qui, dans le code machine, représente un code d'instruction. <br /><br />Dans la NEEES, il définit à la fois l'instruction et le mode d'adressage.",
		ru:
			"_(Operation code)_ Число в машинном коде, которое представляет код инструкции. <br /><br />В NEEES оно определяет и инструкцию, и режим адресации.",
		also: {
			fr: "Opcode|_Opcodes",
			ru: "Опкод|Код операции|_опкоды|_опкода|_опкодов|_Opcode|_Opcodes",
		},
	},
	"Overflow Flag": {
		also: {
			es: "Bandera Overflow",
			fr: "Flag Overflow",
			ru: "Флаг переполнения|_флага переполнения|_Overflow Flag",
		},
		icon: "🏁",
		en:
			"A CPU flag that indicates when an arithmetic operation results in a value too large to be represented in the available number of bits.",
		es:
			"Una bandera de CPU que indica cuando una operación aritmética produce un valor demasiado grande para representarse con el número de bits disponibles.",
		fr:
			"Un flag CPU qui indique quand une opération arithmétique produit une valeur trop grande pour être représentée avec le nombre de bits disponibles.",
		ru:
			"Флаг CPU, который показывает, что результат арифметической операции слишком велик для представления в доступном количестве бит.",
	},
	"Palette id|Palette index|_Palette indexes": {
		also: {
			es:
				"Índice de paleta|_Índices de paleta|_Índice de la paleta|_Índices de la paleta|Id de paleta|_Id de la paleta",
			fr: "Index de palette|_Index de palettes|Id de palette",
			ru:
				"Индекс палитры|Идентификатор палитры|_индекса палитры|_индексы палитр|_индексов палитр|_Palette id|_Palette index|_Palette indexes",
		},
		icon: "🎨",
		en:
			"The index of a palette inside Palette RAM. Background and sprites use different sets. Ranges from `0` to `7`.",
		es:
			"El índice de una paleta dentro de Palette RAM. El fondo y los sprites usan conjuntos distintos. Va de `0` a `7`.",
		fr:
			"L'index d'une palette dans la Palette RAM. L'arrière-plan et les sprites utilisent des ensembles différents. Va de `0` à `7`.",
		ru:
			"Индекс палитры в RAM палитр. Для фона и спрайтов используются разные наборы. Диапазон — от `0` до `7`.",
	},
	"Palette RAM": {
		icon: "🐏",
		en:
			"A small RAM area used to store palettes. <br /><br />In the NEEES, it holds `32` bytes for background and sprite color indexes.",
		es:
			"Una pequeña área de RAM usada para almacenar paletas. <br /><br />En la NEEES, contiene `32` bytes para los índices de color de fondo y sprites.",
		fr:
			"Une petite zone RAM utilisée pour stocker les palettes. <br /><br />Dans la NEEES, elle contient `32` octets pour les index de couleur de l'arrière-plan et des sprites.",
		ru:
			"Небольшая область RAM, в которой хранятся палитры. <br /><br />В NEEES она занимает `32` байта для индексов цветов фона и спрайтов.",
		also: {
			fr: "Palette RAM",
			ru: "RAM палитр|Память палитр|_памяти палитр|_Palette RAM",
		},
	},
	"Palette|_Palettes": {
		also: {
			es: "Paleta|_Paletas",
			fr: "Palette|_Palettes",
			ru: "Палитра|_палитры|_палитр|_палитру|_палитре|_Palette|_Palettes",
		},
		icon: "🎨",
		en:
			"A list of `4` colors, stored in Palette RAM, where each color is a pointer to the master palette. <br /><br />There are `8` palettes: `4` for the background and `4` for sprites.",
		es:
			"Una lista de `4` colores, almacenada en Palette RAM, donde cada color es un puntero a la paleta maestra. <br /><br />Hay `8` paletas: `4` para el fondo y `4` para sprites.",
		fr:
			"Une liste de `4` couleurs, stockée dans la Palette RAM, où chaque couleur est un pointeur vers la palette maîtresse. <br /><br />Il y a `8` palettes : `4` pour l'arrière-plan et `4` pour les sprites.",
		ru:
			"Список из `4` цветов, который хранится в RAM палитр. Каждый цвет — ссылка на основную палитру. <br /><br />Всего палитр `8`: `4` для фона и `4` для спрайтов.",
	},
	"Pattern table id": {
		also: {
			es: "Id de pattern table|_Id de la pattern table",
			fr: "Id de pattern table",
			ru:
				"Индекс таблицы паттернов|_индекса таблицы паттернов|_Pattern table id",
		},
		icon: "👾",
		en:
			"The index of a pattern table. There are `2`: `$PPU $0000` (`0`) and `$PPU $1000` (`1`).",
		es:
			"El índice de una pattern table. Hay `2`: `$PPU $0000` (`0`) y `$PPU $1000` (`1`).",
		fr:
			"L'index d'une pattern table. Il y en a `2` : `$PPU $0000` (`0`) et `$PPU $1000` (`1`).",
		ru:
			"Индекс таблицы паттернов. Их `2`: `$PPU $0000` (`0`) и `$PPU $1000` (`1`).",
	},
	"Pattern table|_Pattern tables": {
		icon: "🕊️📖",
		en: "A list of tiles stored in CHR-ROM or CHR-RAM.",
		es: "Una lista de tiles almacenada en CHR-ROM o CHR-RAM.",
		fr: "Une liste de tiles stockée en CHR-ROM ou CHR-RAM.",
		ru: "Список тайлов, который хранится в CHR-ROM или CHR-RAM.",
		also: {
			fr: "Pattern table|_Pattern tables",
			ru:
				"Таблица паттернов|_таблицы паттернов|_таблиц паттернов|_таблице паттернов|_таблицу паттернов|_Pattern table|_Pattern tables",
		},
	},
	Period: {
		also: {
			es: "Período",
			fr: "Période",
			ru: "Период|_периода|_периодом|_Period",
		},
		icon: "⏱️",
		en:
			"The time it takes for a wave to complete one full repetition, measured in seconds. <br /><br />It is the inverse of the frequency.",
		es:
			"El tiempo que tarda una onda en completar una repetición completa, medido en segundos. <br /><br />Es el inverso de la frecuencia.",
		fr:
			"Le temps qu'il faut à une onde pour compléter une répétition complète, mesuré en secondes. <br /><br />C'est l'inverse de la fréquence.",
		ru:
			"Время одного полного повторения волны, измеряемое в секундах. <br /><br />Обратная величина частоты.",
	},
	"Pixel|_Pixels": {
		also: {
			es: "Píxel|_Píxeles",
			fr: "Pixel|_Pixels",
			ru: "Пиксель|_пиксели|_пикселя|_пикселей|_Pixel|_Pixels",
		},
		icon: "🔲",
		en: "The smallest dot on the screen that can display a single color.",
		es: "El punto más pequeño en la pantalla que puede mostrar un solo color.",
		fr: "Le plus petit point de l'écran qui peut afficher une seule couleur.",
		ru: "Самая маленькая точка экрана, которая может отображать один цвет.",
	},
	PPU: {
		icon: "🖥️",
		en:
			"The _Picture Processing Unit_. It draws graphics by putting pixels on the screen.",
		es:
			"La _Unidad de Procesamiento de Imagen_. Dibuja gráficos poniendo píxeles en la pantalla.",
		fr:
			"L'_Unité de Traitement d'Image_. Elle dessine des graphismes en plaçant des pixels à l'écran.",
		ru:
			"_Picture Processing Unit_ — блок обработки изображения. Рисует графику, выводя пиксели на экран.",
	},
	"PPU address|_PPU addresses|$PPU|PPU memory": {
		also: {
			es:
				"Dirección PPU|_Direcciones PPU|_Dirección de PPU|_Direcciones de PPU|$PPU|Memoria PPU",
			fr: "Adresse PPU|_Adresses PPU|$PPU|Mémoire PPU",
			ru:
				"Адрес PPU|Память PPU|$PPU|_адреса PPU|_адресов PPU|_памяти PPU|_PPU address|_PPU addresses|_PPU memory",
		},
		icon: "🐏",
		en:
			"A memory address seen from the PPU's address space. <br /><br />In the NEEES, valid addresses go from `$0000` to `$3FFF`, with many regions being mirrored.",
		es:
			"Una dirección de memoria vista desde el espacio de direcciones de la PPU. <br /><br />En la NEEES, las direcciones válidas van de `$0000` a `$3FFF`, con muchas regiones espejadas.",
		fr:
			"Une adresse mémoire vue depuis l'espace d'adressage de la PPU. <br /><br />Dans la NEEES, les adresses valides vont de `$0000` à `$3FFF`, avec de nombreuses régions dupliquées.",
		ru:
			"Адрес памяти в адресном пространстве PPU. <br /><br />В NEEES допустимые адреса лежат в диапазоне от `$0000` до `$3FFF`, причём у многих областей есть зеркала.",
	},
	"PPU cycle|_PPU cycles": {
		also: {
			es: "Ciclo de PPU|_Ciclos de PPU",
			fr: "Cycle PPU|_Cycles PPU",
			ru: "Такт PPU|_такты PPU|_такта PPU|_тактов PPU|_PPU cycle|_PPU cycles",
		},
		icon: "🦅",
		en:
			"The basic timing unit of the PPU; each cycle corresponds to one PPU clock tick and advances its internal state. <br /><br />The PPU runs at `3` times the CPU clock rate. For every CPU cycle, the PPU runs `3` cycles.",
		es:
			"La unidad de tiempo básica de la PPU; cada ciclo corresponde a un tick de reloj de la PPU y avanza su estado interno. <br /><br />La PPU funciona a `3` veces la velocidad de la CPU. Por cada ciclo de CPU, la PPU ejecuta `3` ciclos.",
		fr:
			"L'unité de temps de base de la PPU ; chaque cycle correspond à un top d'horloge de la PPU et fait avancer son état interne. <br /><br />La PPU tourne à `3` fois la vitesse d'horloge du CPU. Pour chaque cycle CPU, la PPU exécute `3` cycles.",
		ru:
			"Основная единица времени PPU: каждый такт соответствует одному импульсу его тактового сигнала и продвигает внутреннее состояние. <br /><br />PPU работает в `3` раза быстрее CPU. На каждый такт CPU приходится `3` такта PPU.",
	},
	"PPU register|_PPU registers|Video register|_Video registers": {
		also: {
			es:
				"Registro de PPU|_Registros de PPU|_Registro PPU|_Registros PPU|Registro de Video|_Registros de Video",
			fr: "Registre PPU|_Registres PPU|Registre Vidéo|_Registres Vidéo",
			ru:
				"Регистр PPU|Видеорегистр|_регистры PPU|_регистров PPU|_видеорегистры|_видеорегистров|_PPU register|_PPU registers|_Video register|_Video registers",
		},
		icon: "🔢",
		en:
			"A memory-mapped register used to control the PPU or read its state. <br /><br />In the NEEES, they are mapped to addresses `$2000` - `$2007`, and `$4014` (OAMDMA).",
		es:
			"Un registro mapeado en memoria usado para controlar la PPU o leer su estado. <br /><br />En la NEEES, están mapeados en las direcciones `$2000` - `$2007`, y `$4014` (OAMDMA).",
		fr:
			"Un registre mappé en mémoire utilisé pour contrôler la PPU ou lire son état. <br /><br />Dans la NEEES, ils sont mappés aux adresses `$2000` - `$2007`, et `$4014` (OAMDMA).",
		ru:
			"Регистр, отображённый в память, для управления PPU или чтения его состояния. <br /><br />В NEEES такие регистры находятся по адресам `$2000` - `$2007` и `$4014` (OAMDMA).",
	},
	PPUAddr: {
		icon: "📍",
		en:
			"A video register that sets the PPU address for future reads or writes. <br /><br />Must be written twice: high byte first, then low byte. <br /><br />It is available at CPU address `$2006`.",
		es:
			"Un registro de video que establece la dirección PPU para futuras lecturas o escrituras. <br /><br />Debe escribirse dos veces: primero el byte alto, luego el byte bajo. <br /><br />Está disponible en la dirección de CPU `$2006`.",
		fr:
			"Un registre vidéo qui définit l'adresse PPU pour les prochaines lectures ou écritures. <br /><br />Doit être écrit deux fois : l'octet de poids fort d'abord, puis l'octet de poids faible. <br /><br />Il est disponible à l'adresse CPU `$2006`.",
		ru:
			"Видеорегистр, который задаёт адрес PPU для следующих операций чтения или записи. <br /><br />В него нужно записать дважды: сначала старший байт, затем младший. <br /><br />Доступен по адресу CPU `$2006`.",
	},
	PPUCtrl: {
		icon: "🎛️",
		en:
			"A video register that sets basic PPU settings like NMI enable, sprite size, pattern table selection, and nametable base. <br /><br />It is available at CPU address `$2000`.",
		es:
			"Un registro de video que configura ajustes básicos de la PPU como la habilitación de NMI, el tamaño de los sprites, la selección de pattern tables y la base del name table. <br /><br />Está disponible en la dirección de CPU `$2000`.",
		fr:
			"Un registre vidéo qui définit les paramètres de base de la PPU comme l'activation du NMI, la taille des sprites, la sélection de la pattern table et la base de la name table. <br /><br />Il est disponible à l'adresse CPU `$2000`.",
		ru:
			"Видеорегистр с основными настройками PPU: включение NMI, размер спрайтов, выбор таблицы паттернов и базовой таблицы имён. <br /><br />Доступен по адресу CPU `$2000`.",
	},
	PPUData: {
		icon: "📦",
		en:
			"A video register that reads or writes a byte of data from/to the PPU address pointed by PPUAddr. After each read/write, PPUAddr is auto-incremented. <br /><br />It is available at CPU address `$2007`.",
		es:
			"Un registro de video que lee o escribe un byte de datos desde/hacia la dirección PPU apuntada por PPUAddr. Luego de cada lectura/escritura, PPUAddr es autoincrementada. <br /><br />Está disponible en la dirección de CPU `$2007`.",
		fr:
			"Un registre vidéo qui lit ou écrit un octet de données depuis/vers l'adresse PPU pointée par PPUAddr. Après chaque lecture/écriture, PPUAddr est auto-incrémentée. <br /><br />Il est disponible à l'adresse CPU `$2007`.",
		ru:
			"Видеорегистр, который читает или записывает байт по адресу PPU из PPUAddr. После каждого чтения или записи PPUAddr автоматически увеличивается. <br /><br />Доступен по адресу CPU `$2007`.",
	},
	PPUMask: {
		icon: "🎭",
		en:
			"A video register used to enable or disable parts of the background and sprites, as well as apply color effects like grayscale or emphasis. <br /><br />It is available at CPU address `$2001`.",
		es:
			"Un registro de video usado para habilitar o deshabilitar partes del fondo y los sprites, además de aplicar efectos de color como escala de grises o énfasis. <br /><br />Está disponible en la dirección de CPU `$2001`.",
		fr:
			"Un registre vidéo utilisé pour activer ou désactiver des parties de l'arrière-plan et des sprites, ainsi qu'appliquer des effets de couleur comme les niveaux de gris ou l'emphase. <br /><br />Il est disponible à l'adresse CPU `$2001`.",
		ru:
			"Видеорегистр, который включает или отключает части фона и спрайтов, а также задаёт цветовые эффекты: оттенки серого или усиление цветов. <br /><br />Доступен по адресу CPU `$2001`.",
	},
	PPUScroll: {
		icon: "📜",
		en:
			"A video register that sets the background scroll position. <br /><br />Written twice per frame: once for X scroll, once for Y. <br /><br />It is available at CPU address `$2005`.",
		es:
			"Un registro de video que establece la posición de scroll del fondo. <br /><br />Se escribe dos veces por frame: una para el scroll horizontal, otra para el vertical. <br /><br />Está disponible en la dirección de CPU `$2005`.",
		fr:
			"Un registre vidéo qui définit la position de défilement de l'arrière-plan. <br /><br />Écrit deux fois par frame : une fois pour le défilement X, une fois pour Y. <br /><br />Il est disponible à l'adresse CPU `$2005`.",
		ru:
			"Видеорегистр, который задаёт положение прокрутки фона. <br /><br />В него записывают дважды за кадр: один раз для X, один для Y. <br /><br />Доступен по адресу CPU `$2005`.",
	},
	PPUStatus: {
		icon: "📊",
		en:
			"A video register that shows whether the PPU is in VBlank, if sprite zero hit occurred, or if there's sprite overflow. Reading it also resets internal latches. <br /><br />It is available at CPU address `$2002`.",
		es:
			"Un registro de video que muestra si la PPU está en VBlank, si ocurrió un sprite zero hit, o si hay desbordamiento de sprites. Leerlo también reinicia latches internos. <br /><br />Está disponible en la dirección de CPU `$2002`.",
		fr:
			"Un registre vidéo qui indique si la PPU est en VBlank, si un sprite zero hit s'est produit, ou s'il y a un sprite overflow. Le lire réinitialise aussi les latches internes. <br /><br />Il est disponible à l'adresse CPU `$2002`.",
		ru:
			"Видеорегистр, который показывает, находится ли PPU в VBlank, было ли попадание нулевого спрайта и есть ли переполнение спрайтов. Чтение также сбрасывает внутренние защёлки. <br /><br />Доступен по адресу CPU `$2002`.",
	},
	"Pre-line": {
		icon: "🌠",
		en:
			'A non-visible scanline where the PPU gets things ready for the upcoming frame. Also called "_scanline -1_".',
		es:
			'Una scanline no visible en la que la PPU prepara todo para el próximo frame. También se la llama "_scanline -1_".',
		fr:
			'Une scanline non visible où la PPU prépare tout pour le prochain frame. Aussi appelée "_scanline -1_".',
		ru:
			"Невидимая подготовительная строка развёртки, на которой PPU готовится к следующему кадру. Её также называют «_строка -1_».",
		also: {
			fr: "Pré-ligne",
			ru:
				"Подготовительная строка|Предварительная строка|_подготовительной строки|_подготовительной строке|_подготовительную строку|_предварительной строки|_предварительную строку|_Pre-line",
		},
	},
	"PRG-RAM": {
		icon: "🔋",
		en:
			"_(Program RAM)_ A battery-backed RAM chip that contains the save file, inside the cartridge.",
		es:
			"_(Program RAM)_ Un chip de RAM (alimentado a batería) que contiene la partida, dentro del cartucho.",
		fr:
			"_(Program RAM)_ Une puce RAM à alimentation par batterie qui contient la sauvegarde, à l'intérieur de la cartouche.",
		ru:
			"_(Program RAM)_ Микросхема RAM с батарейным питанием внутри картриджа, в которой хранится сохранение игры.",
	},
	"PRG-ROM": {
		icon: "🤖",
		en:
			"_(Program ROM)_ A ROM chip that contains the game code, inside the cartridge.",
		es:
			"_(Program ROM)_ Un chip de ROM que contiene el código del juego, dentro del cartucho.",
		fr:
			"_(Program ROM)_ Une puce ROM qui contient le code du jeu, à l'intérieur de la cartouche.",
		ru:
			"_(Program ROM)_ Микросхема ROM внутри картриджа, в которой хранится код игры.",
	},
	"Pulse Channel|_Pulse Channels": {
		also: {
			es: "Canal Pulso|_Canales Pulso",
			fr: "Canal Pulse|_Canaux Pulse",
			ru:
				"Импульсный канал|_импульсные каналы|_импульсного канала|_импульсных каналов|_Pulse Channel|_Pulse Channels",
		},
		icon: "🟦",
		en:
			"One of the APU's audio channels. It plays pulse waves with adjustable duty cycles and pitch. <br /><br />The NEEES has two of these.",
		es:
			"Uno de los canales de audio de la APU. Reproduce ondas de pulso con ciclos de trabajo y tono ajustables. <br /><br />La NEEES tiene dos de estos.",
		fr:
			"L'un des canaux audio de l'APU. Il joue des ondes pulse avec des rapports cycliques et des hauteurs réglables. <br /><br />La NEEES en a deux.",
		ru:
			"Один из звуковых каналов APU. Воспроизводит импульсные волны с регулируемыми коэффициентом заполнения и высотой звука. <br /><br />В NEEES таких каналов два.",
	},
	"Pulse wave|_Pulse waves": {
		also: {
			es: "Onda de pulso|_Ondas de pulso",
			fr: "Onde pulse|_Ondes pulse",
			ru:
				"Импульсная волна|_импульсные волны|_импульсной волны|_импульсных волн|_Pulse wave|_Pulse waves",
		},
		icon: "🟦",
		en:
			"A waveform that alternates between two levels, creating a sharp, blocky sound. Used by the APU's Pulse Channels. <br /><br />It looks like this:<br />`_——__—_——_`",
		es:
			"Una forma de onda que alterna entre dos niveles, generando un sonido fuerte y entrecortado. Usada por los Canales Pulso de la APU. <br /><br />Se ve así:<br />`_——__—_——_`",
		fr:
			"Une forme d'onde qui alterne entre deux niveaux, créant un son net et saccadé. Utilisée par les Canaux Pulse de l'APU. <br /><br />Elle ressemble à ça :<br />`_——__—_——_`",
		ru:
			"Волна, которая переключается между двумя уровнями и даёт резкий, рубленый звук. Используется импульсными каналами APU. <br /><br />Выглядит так:<br />`_——__—_——_`",
	},
	"Pulse1Control|PulseControl": {
		icon: "🟦",
		en:
			"An audio register that configures the first Pulse Channel's duty cycle, envelope, and volume. <br /><br />It is available at CPU address `$4000`.",
		es:
			"Un registro de audio que configura el ciclo de trabajo, la envolvente y el volumen del primer Canal Pulso. <br /><br />Está disponible en la dirección de CPU `$4000`.",
		fr:
			"Un registre audio qui configure le rapport cyclique, l'enveloppe et le volume du premier Canal Pulse. <br /><br />Il est disponible à l'adresse CPU `$4000`.",
		ru:
			"Аудиорегистр, который настраивает коэффициент заполнения, огибающую и громкость первого импульсного канала. <br /><br />Доступен по адресу CPU `$4000`.",
	},
	"Pulse1Sweep|PulseSweep": {
		icon: "🧹",
		en:
			"An audio register that sets up the first pulse channel's frequency sweep (rate, direction, and shift count). <br /><br />It is available at CPU address `$4001`.",
		es:
			"Un registro de audio que ajusta el barrido de frecuencia (velocidad, dirección y desplazamiento) del primer Canal Pulso. <br /><br />Está disponible en la dirección de CPU `$4001`.",
		fr:
			"Un registre audio qui configure le balayage de fréquence (vitesse, direction et décalage) du premier Canal Pulse. <br /><br />Il est disponible à l'adresse CPU `$4001`.",
		ru:
			"Аудиорегистр, который настраивает свип частоты первого импульсного канала: скорость, направление и величину сдвига. <br /><br />Доступен по адресу CPU `$4001`.",
	},
	"Pulse1TimerHighLCL|PulseTimerHighLCL": {
		icon: "🕛",
		en:
			"An audio register holding the high byte of the first Pulse Channel's timer and loading its length counter (which also starts the envelope). <br /><br />It is available at CPU address `$4003`.",
		es:
			"Un registro de audio que contiene el byte alto del timer del primer Canal Pulso y carga su contador de longitud (que además inicia la envolvente). <br /><br />Está disponible en la dirección de CPU `$4003`.",
		fr:
			"Un registre audio contenant l'octet de poids fort du timer du premier Canal Pulse et chargeant son compteur de longueur (ce qui lance aussi l'enveloppe). <br /><br />Il est disponible à l'adresse CPU `$4003`.",
		ru:
			"Аудиорегистр, который хранит старший байт таймера первого импульсного канала и загружает его счётчик длины (заодно запускается огибающая). <br /><br />Доступен по адресу CPU `$4003`.",
	},
	"Pulse1TimerLow|PulseTimerLow": {
		icon: "🕡",
		en:
			"An audio register holding the low byte of the first Pulse Channel's timer, which determines its pitch. <br /><br />It is available at CPU address `$4002`.",
		es:
			"Un registro de audio que contiene el byte bajo del timer del primer Canal Pulso, que determina su tono. <br /><br />Está disponible en la dirección de CPU `$4002`.",
		fr:
			"Un registre audio contenant l'octet de poids faible du timer du premier Canal Pulse, qui détermine sa hauteur. <br /><br />Il est disponible à l'adresse CPU `$4002`.",
		ru:
			"Аудиорегистр, который хранит младший байт таймера первого импульсного канала, определяющего высоту звука. <br /><br />Доступен по адресу CPU `$4002`.",
	},
	Pulse2Control: {
		icon: "🟦",
		en:
			"An audio register that configures the second Pulse Channel's duty cycle, envelope, and volume. <br /><br />It is available at CPU address `$4004`.",
		es:
			"Un registro de audio que configura el ciclo de trabajo, la envolvente y el volumen del segundo Canal Pulso. <br /><br />Está disponible en la dirección de CPU `$4004`.",
		fr:
			"Un registre audio qui configure le rapport cyclique, l'enveloppe et le volume du deuxième Canal Pulse. <br /><br />Il est disponible à l'adresse CPU `$4004`.",
		ru:
			"Аудиорегистр, который настраивает коэффициент заполнения, огибающую и громкость второго импульсного канала. <br /><br />Доступен по адресу CPU `$4004`.",
	},
	Pulse2Sweep: {
		icon: "🧹",
		en:
			"An audio register that sets up the second Pulse Channel's frequency sweep (rate, direction, and shift count). <br /><br />It is available at CPU address `$4005`.",
		es:
			"Un registro de audio que ajusta el barrido de frecuencia (velocidad, dirección y desplazamiento) del segundo Canal Pulso. <br /><br />Está disponible en la dirección de CPU `$4005`.",
		fr:
			"Un registre audio qui configure le balayage de fréquence (vitesse, direction et décalage) du deuxième Canal Pulse. <br /><br />Il est disponible à l'adresse CPU `$4005`.",
		ru:
			"Аудиорегистр, который настраивает свип частоты второго импульсного канала: скорость, направление и величину сдвига. <br /><br />Доступен по адресу CPU `$4005`.",
	},
	Pulse2TimerHighLCL: {
		icon: "🕛",
		en:
			"An audio register holding the high byte of the second Pulse Channel's timer and loading its length counter (which also starts the envelope). <br /><br />It is available at CPU address `$4007`.",
		es:
			"Un registro de audio que contiene el byte alto del timer del segundo Canal Pulso y carga su contador de longitud (que además inicia la envolvente). <br /><br />Está disponible en la dirección de CPU `$4007`.",
		fr:
			"Un registre audio contenant l'octet de poids fort du timer du deuxième Canal Pulse et chargeant son compteur de longueur (ce qui lance aussi l'enveloppe). <br /><br />Il est disponible à l'adresse CPU `$4007`.",
		ru:
			"Аудиорегистр, который хранит старший байт таймера второго импульсного канала и загружает его счётчик длины (заодно запускается огибающая). <br /><br />Доступен по адресу CPU `$4007`.",
	},
	Pulse2TimerLow: {
		icon: "🕡",
		en:
			"An audio register holding the low byte of the second Pulse Channel's timer, which determines its pitch. <br /><br />It is available at CPU address `$4006`.",
		es:
			"Un registro de audio que contiene el byte bajo del timer del segundo Canal Pulso, que determina su tono. <br /><br />Está disponible en la dirección de CPU `$4006`.",
		fr:
			"Un registre audio contenant l'octet de poids faible du timer du deuxième Canal Pulse, qui détermine sa hauteur. <br /><br />Il est disponible à l'adresse CPU `$4006`.",
		ru:
			"Аудиорегистр, который хранит младший байт таймера второго импульсного канала, определяющего высоту звука. <br /><br />Доступен по адресу CPU `$4006`.",
	},
	"Quarter frame|Quarter-frame|Quarter|_Quarter frames|_Quarter-frames|_Quarters": {
		icon: "🕒",
		en:
			"An event in the frame sequencer that occurs at each quarter of its sequence, triggering envelope and linear length counter updates.",
		es:
			"Un evento de temporización en el secuenciador de frames que ocurre en cada cuarto de su secuencia, activando las actualizaciones de envolvente y contador de longitud lineal.",
		fr:
			"Un événement dans le séquenceur de frames qui se produit à chaque quart de sa séquence, déclenchant les mises à jour des enveloppes et du compteur de longueur linéaire.",
		ru:
			"Событие секвенсора кадров, которое происходит на каждой четверти последовательности и запускает обновление огибающих и линейного счётчика длины.",
		also: {
			fr: "Quart de frame|Quart|_Quarts de frame|_Quarts",
			ru:
				"Четверть кадра|Четверть|_четверти кадра|_четверти|_Quarter frame|_Quarter-frame|_Quarter|_Quarter frames|_Quarter-frames|_Quarters",
		},
	},
	"Register|_Registers": {
		also: {
			es: "Registro|_Registros",
			fr: "Registre|_Registres",
			ru: "Регистр|_регистры|_регистра|_регистров|_Register|_Registers",
		},
		icon: "🔣",
		en:
			"A storage location used during program execution. <br /><br />See also: CPU register, Memory-mapped register.",
		es:
			"Una ubicación de almacenamiento usada durante la ejecución de un programa. <br /><br />Ver también: Registro de CPU, Registro mapeado en memoria.",
		fr:
			"Un emplacement de stockage utilisé pendant l'exécution du programme. <br /><br />Voir aussi : Registre CPU, Registre mappé en mémoire.",
		ru:
			"Ячейка хранения данных, используемая при выполнении программы. <br /><br />См. также: регистр CPU, регистр, отображённый в память.",
	},
	"Sample rate|_Sample rates": {
		also: {
			es: "Frecuencia de muestreo|_Frecuencias de muestreo",
			fr: "Fréquence d'échantillonnage|_Fréquences d'échantillonnage",
			ru:
				"Частота дискретизации|_частоты дискретизации|_Sample rate|_Sample rates",
		},
		icon: "💨",
		en:
			"The number of samples taken per second to represent a sound. Measured in hertz (`Hz`).",
		es:
			"La cantidad de samples tomados por segundo para representar un sonido. Se mide en hertz (`Hz`).",
		fr:
			"Le nombre de samples pris par seconde pour représenter un son. Mesuré en hertz (`Hz`).",
		ru:
			"Количество сэмплов в секунду, используемое для представления звука. Измеряется в герцах (`Гц`).",
	},
	"Scanline|_Scanlines": {
		icon: "🌠",
		en:
			"A single horizontal line of pixels drawn on the screen. The PPU draws one scanline at a time, from top to bottom, until the whole frame is complete.",
		es:
			"Una línea horizontal de píxeles dibujada en la pantalla. La PPU dibuja una scanline a la vez, de arriba hacia abajo, hasta completar todo el frame.",
		fr:
			"Une seule ligne horizontale de pixels dessinée à l'écran. La PPU dessine une scanline à la fois, de haut en bas, jusqu'à ce que tout le frame soit complet.",
		ru:
			"Одна горизонтальная строка пикселей на экране. PPU рисует строки по очереди сверху вниз, пока не будет готов весь кадр.",
		also: {
			fr: "Scanline|_Scanlines",
			ru:
				"Строка развёртки|_строки развёртки|_строк развёртки|_строке развёртки|_строку развёртки|_Scanline|_Scanlines",
		},
	},
	Scrolling: {
		icon: "📜",
		en:
			"A PPU feature that allows developers to move the background by adjusting the visible portion of the name table.",
		es:
			"Una función de la PPU que permite a los desarrolladores mover el fondo ajustando la porción visible de la name table.",
		fr:
			"Une fonction de la PPU qui permet de déplacer l'arrière-plan en ajustant la partie visible de la name table.",
		ru: "Возможность PPU перемещать фон, меняя видимую часть таблицы имён.",
		also: {
			fr: "Scrolling",
			ru: "Прокрутка|_прокрутки|_прокрутку|_прокрутке|_Scrolling",
		},
	},
	"Sequencer|Frame sequencer|Frame counter": {
		also: {
			es: "Secuenciador|Secuenciador de Frames|Contador de Frames",
			fr: "Séquenceur|Séquenceur de frames|Compteur de frames",
			ru:
				"Секвенсор кадров|Секвенсор|Счётчик кадров|_секвенсора кадров|_секвенсора|_Sequencer|_Frame sequencer|_Frame counter",
		},
		icon: "🔀",
		en:
			"An internal APU unit that cycles through four- or five-step patterns to generate timing signals for envelopes, sweeps, and length counters.",
		es:
			"Una unidad interna de la APU que cicla por patrones de cuatro o cinco pasos para generar señales de tiempo para envolventes, barridos y contadores de longitud.",
		fr:
			"Une unité interne de l'APU qui parcourt des séquences en quatre ou cinq étapes pour générer des signaux de timing pour les enveloppes, les balayages et les compteurs de longueur.",
		ru:
			"Внутренний блок APU, который повторяет последовательности из четырёх или пяти шагов и создаёт временные сигналы для огибающих, свипа и счётчиков длины.",
	},
	"Sprite evaluation": {
		also: {
			es: "Evaluación de sprites",
			fr: "Évaluation des sprites",
			ru: "Отбор спрайтов|_отбора спрайтов|_Sprite evaluation",
		},
		icon: "🕵️",
		en:
			"A step performed on each scanline where the PPU checks which sprites should be rendered. It scans all entries in OAM and selects up to `8` sprites whose vertical position matches the current scanline. <br /><br />If more than `8` sprites are found, the sprite overflow flag is set.",
		es:
			"Un paso que se realiza en cada scanline donde la PPU determina qué sprites deben renderizarse. Escanea todas las entradas en OAM y selecciona hasta `8` sprites cuya posición vertical coincida con la scanline actual. <br /><br />Si se encuentran más de `8` sprites, se enciende la bandera de sprite overflow.",
		fr:
			"Une étape effectuée à chaque scanline où la PPU vérifie quels sprites doivent être rendus. Elle parcourt toutes les entrées dans l'OAM et sélectionne jusqu'à `8` sprites dont la position verticale correspond à la scanline actuelle. <br /><br />Si plus de `8` sprites sont trouvés, le flag de sprite overflow est activé.",
		ru:
			"Этап на каждой строке развёртки, когда PPU проверяет, какие спрайты нужно рисовать. Он просматривает все записи OAM и выбирает до `8` спрайтов, чьё вертикальное положение совпадает с текущей строкой. <br /><br />Если найдено больше `8` спрайтов, устанавливается флаг переполнения спрайтов.",
	},
	"Sprite id|OAM id|OAM index|_OAM indexes": {
		also: {
			es:
				"OAM id|Índice OAM|_Índices OAM|Id de OAM|Id de sprite|_Id del sprite",
			fr: "OAM id|Indice OAM|_Indices OAM|Id de OAM|Id de sprite|_Id du sprite",
			ru:
				"Индекс спрайта|Индекс OAM|_индекса спрайта|_индексы OAM|_Sprite id|_OAM id|_OAM index|_OAM indexes",
		},
		icon: "🛸",
		en: "The index of a sprite inside OAM. It ranges from `0` to `63`.",
		es: "El índice de un sprite dentro de OAM. Va de `0` a `63`.",
		fr: "L'index d'un sprite dans l'OAM. Il va de `0` à `63`.",
		ru: "Индекс спрайта в OAM. Диапазон — от `0` до `63`.",
	},
	"Sprite overflow": {
		icon: "🏁",
		en:
			"A condition that occurs when more than `8` sprites appear on the same scanline. Only the first `8` are rendered. <br /><br />Games can retrieve this flag by reading bit `5` of PPUStatus.",
		es:
			"Una condición que ocurre cuando más de `8` sprites aparecen en la misma scanline. Solo se renderizan los primeros `8`. <br /><br />Los juegos pueden leer esta bandera desde el bit `5` de PPUStatus.",
		fr:
			"Une condition qui se produit quand plus de `8` sprites apparaissent sur la même scanline. Seuls les 8 premiers sont rendus. <br /><br />Les jeux peuvent récupérer ce flag en lisant le bit `5` de PPUStatus.",
		ru:
			"Ситуация, когда на одной строке развёртки находится больше `8` спрайтов. Рисуются только первые `8`. <br /><br />Игра может проверить этот флаг, прочитав бит `5` регистра PPUStatus.",
		also: {
			fr: "Sprite overflow|Débordement de sprites",
			ru: "Переполнение спрайтов|_переполнения спрайтов|_Sprite overflow",
		},
	},
	"Sprite zero|_Sprite-zero": {
		also: {
			es: "Sprite cero|_Sprite-cero",
			fr: "Sprite zéro|_Sprite-zéro",
			ru: "Нулевой спрайт|_нулевого спрайта|_Sprite zero|_Sprite-zero",
		},
		icon: "🛸",
		en:
			"The sprite with OAM index `0`. It has special behavior in the PPU, such as triggering the sprite-zero hit when it overlaps the background.",
		es:
			"El sprite con índice OAM `0`. Tiene un comportamiento especial en la PPU, como activar el sprite-zero hit cuando se superpone con el fondo.",
		fr:
			"Le sprite avec l'index OAM `0`. Il a un comportement spécial dans la PPU, comme déclencher le sprite-zero hit quand il chevauche l'arrière-plan.",
		ru:
			"Спрайт с индексом OAM `0`. У него особое поведение в PPU: например, при пересечении с фоном он может вызвать попадание нулевого спрайта.",
	},
	"Sprite-zero hit|_Sprite zero hit|_Sprite-zero hits": {
		also: {
			es: "Sprite zero hit|_Sprite-zero hit|_Sprite-zero hits",
			fr: "Sprite-zero hit|_Sprite zero hit|_Sprite-zero hits",
			ru:
				"Попадание нулевого спрайта|_попадания нулевого спрайта|_Sprite-zero hit|_Sprite zero hit|_Sprite-zero hits",
		},
		icon: "👊",
		en:
			"A condition that occurs when a visible pixel of the sprite zero overlaps a visible background pixel. When this happens, the PPU sets the sprite-zero hit flag in PPUStatus. <br /><br />Games often use it to time mid-frame effects like status bars or split screens.",
		es:
			"Una condición que ocurre cuando un píxel visible del sprite cero se superpone con un píxel visible del fondo. Cuando eso pasa, la PPU enciende la bandera de sprite-zero hit en PPUStatus. <br /><br />Los juegos suelen usarla para sincronizar efectos a mitad de frame como barras de estado o pantallas divididas.",
		fr:
			"Une condition qui se produit quand un pixel visible du sprite zéro chevauche un pixel visible de l'arrière-plan. Quand ça arrive, la PPU active le flag sprite-zero hit dans PPUStatus. <br /><br />Les jeux l'utilisent souvent pour synchroniser des effets à mi-frame comme des barres de statut ou des écrans scindés.",
		ru:
			"Ситуация, когда видимый пиксель нулевого спрайта пересекается с видимым пикселем фона. PPU устанавливает флаг попадания нулевого спрайта в PPUStatus. <br /><br />Игры часто используют это для эффектов посреди кадра: строк состояния или разделения экрана.",
	},
	"Sprite|_Sprites": {
		icon: "🛸",
		en:
			"A game object on top (or behind!) of the background that can be moved or flipped, stored in OAM. It can use one tile (`8x8` sprite) or two (`8x16` sprite).",
		es:
			"Un objeto del juego encima (¡o detrás!) del fondo que puede ser movido o volteado, almacenado en OAM. Puede usar un tile (sprite de `8x8`) o dos (sprite de `8x16`).",
		fr:
			"Un objet du jeu au-dessus (ou derrière !) de l'arrière-plan qui peut être déplacé ou retourné, stocké dans l'OAM. Il peut utiliser un tile (sprite `8x8`) ou deux (sprite `8x16`).",
		ru:
			"Игровой объект поверх фона (или позади него!), который можно перемещать и отражать. Хранится в OAM и использует один тайл (спрайт `8x8`) или два (спрайт `8x16`).",
		also: {
			fr: "Sprite|_Sprites",
			ru: "Спрайт|_спрайты|_спрайта|_спрайтов|_спрайте|_Sprite|_Sprites",
		},
	},
	"Square wave|_Square waves": {
		also: {
			es: "Onda cuadrada|_Ondas cuadradas",
			fr: "Onde carrée|_Ondes carrées",
			ru:
				"Прямоугольная волна|Меандр|_прямоугольной волны|_прямоугольные волны|_Square wave|_Square waves",
		},
		icon: "⏹️",
		en: "A pulse wave with a duty cycle of `50%`.",
		es: "Una onda de pulso con un ciclo de trabajo de `50%`.",
		fr: "Une onde pulse avec un rapport cyclique de `50%`.",
		ru: "Импульсная волна с коэффициентом заполнения `50%`.",
	},
	Stack: {
		also: {
			es: "Pila",
			fr: "Pile",
			ru: "Стек|_стека|_стеке|_Stack",
		},
		icon: "🧱",
		en:
			"A LIFO _(Last In, First Out)_ structure which programs can use to store values. The current depth is measured by [SP]. <br /><br />In the NEEES, the stack lives in WRAM between addresses `$0100` and `$01FF`.",
		es:
			"Una estructura LIFO _(Last In, First Out)_ que los programas usan para almacenar valores. La longitud actual es medida por el [SP]. <br /><br />En la NEEES, la pila vive en WRAM entre las direcciones `$0100` y `$01FF`.",
		fr:
			"Une structure LIFO _(Last In, First Out)_ que les programmes peuvent utiliser pour stocker des valeurs. La profondeur actuelle est mesurée par le [SP]. <br /><br />Dans la NEEES, la pile se trouve dans la WRAM entre les adresses `$0100` et `$01FF`.",
		ru:
			"Структура LIFO _(Last In, First Out — последним пришёл, первым вышел)_, в которой программы могут хранить значения. Текущую глубину отслеживает [SP]. <br /><br />В NEEES стек находится в WRAM между адресами `$0100` и `$01FF`.",
	},
	"Tile id": {
		also: {
			es: "Id de tile|_Id del tile",
			fr: "Id de tile|_Id du tile",
			ru: "Индекс тайла|_индекса тайла|_Tile id",
		},
		icon: "🕊️",
		en:
			"The index of a tile inside a pattern table. It ranges from `0` to `255`.",
		es: "El índice de un tile dentro de una pattern table. Va de `0` a `255`.",
		fr: "L'index d'un tile dans une pattern table. Il va de `0` à `255`.",
		ru: "Индекс тайла в таблице паттернов. Диапазон — от `0` до `255`.",
	},
	"Tile|_Tiles": {
		icon: "🕊️",
		en:
			"An `8x8` grayscale pixel grid that represents a pattern. Tiles are stored in pattern tables.",
		es:
			"Una cuadrícula de `8x8` píxeles en escala de grises que representa un patrón. Los tiles se almacenan en pattern tables.",
		fr:
			"Une grille de pixels `8x8` en niveaux de gris qui représente un motif. Les tiles sont stockés dans les pattern tables.",
		ru:
			"Сетка пикселей `8x8` в оттенках серого, которая представляет рисунок. Тайлы хранятся в таблицах паттернов.",
		also: {
			fr: "Tile|_Tiles",
			ru: "Тайл|_тайлы|_тайла|_тайлов|_тайле|_Tile|_Tiles",
		},
	},
	"Timer|_Timers": {
		icon: "📡",
		en:
			"A value that sets an APU channel's oscillation rate by determining how many master-clock ticks occur between waveform steps. <br /><br />It determines the frequency, thus the pitch of the note.",
		es:
			"Un valor que establece la tasa de oscilación de un canal APU determinando cuántos ciclos de reloj maestro pasan entre pasos de la forma de onda. <br /><br />Determina la frecuencia, y en consecuencia el tono de una nota.",
		fr:
			"Une valeur qui définit le taux d'oscillation d'un canal APU en déterminant combien de tops d'horloge maître s'écoulent entre les étapes de la forme d'onde. <br /><br />Elle détermine la fréquence, et donc la hauteur de la note.",
		ru:
			"Значение, которое задаёт скорость колебаний канала APU: определяет число тактов основного тактового сигнала между шагами волны. <br /><br />Задаёт частоту, а значит, и высоту ноты.",
		also: {
			fr: "Timer|_Timers",
			ru: "Таймер|_таймеры|_таймера|_таймеров|_Timer|_Timers",
		},
	},
	"Triangle Channel": {
		also: {
			es: "Canal Triangular",
			fr: "Canal Triangle",
			ru:
				"Треугольный канал|_треугольного канала|_треугольном канале|_Triangle Channel",
		},
		icon: "🔺",
		en:
			"One of the APU's audio channels. It plays a triangle wave with fixed volume and shape, often used for bass or melodic lines.",
		es:
			"Uno de los canales de audio de la APU. Reproduce una onda triangular con volumen y forma fijos, comúnmente usado para graves o melodías.",
		fr:
			"L'un des canaux audio de l'APU. Il joue une onde triangle avec un volume et une forme fixes, souvent utilisé pour la basse ou les lignes mélodiques.",
		ru:
			"Один из звуковых каналов APU. Воспроизводит треугольную волну с фиксированными громкостью и формой. Часто используется для баса или мелодии.",
	},
	"Triangle wave|_Triangle waves": {
		also: {
			es: "Onda triangular|_Ondas triangulares",
			fr: "Onde triangle|_Ondes triangle",
			ru:
				"Треугольная волна|_треугольной волны|_треугольные волны|_Triangle wave|_Triangle waves",
		},
		icon: "🔺",
		en:
			"A waveform shaped like a triangle, with a softer, more mellow sound. Used by the APU's Triangle Channel. <br /><br />It looks like this:<br />`/\\/\\/\\/\\`",
		es:
			"Una forma de onda con forma de triángulo, que produce un sonido más suave y apagado. Usada por el Canal Triangular de la APU. <br /><br />Se ve así:<br />`/\\/\\/\\/\\`",
		fr:
			"Une forme d'onde en forme de triangle, avec un son plus doux et plus mellow. Utilisée par le Canal Triangle de l'APU. <br /><br />Elle ressemble à ça :<br />`/\\/\\/\\/\\`",
		ru:
			"Волна треугольной формы с более мягким, спокойным звуком. Используется треугольным каналом APU. <br /><br />Выглядит так:<br />`/\\/\\/\\/\\`",
	},
	TriangleLengthControl: {
		icon: "📏",
		en:
			"An audio register that sets the Triangle Channel's linear length counter reload value and controls its length counter halt. <br /><br />It is available at CPU address `$4008`.",
		es:
			"Un registro de audio que establece el valor de recarga del contador lineal de longitud del Canal Triangular y controla la detención del contador de longitud. <br /><br />Está disponible en la dirección de CPU `$4008`.",
		fr:
			"Un registre audio qui définit la valeur de rechargement du compteur de longueur linéaire du Canal Triangle et contrôle l'arrêt de son compteur de longueur. <br /><br />Il est disponible à l'adresse CPU `$4008`.",
		ru:
			"Аудиорегистр, который задаёт значение перезагрузки линейного счётчика длины треугольного канала и управляет остановкой его обычного счётчика длины. <br /><br />Доступен по адресу CPU `$4008`.",
	},
	TriangleTimerHighLCL: {
		icon: "🕛",
		en:
			"An audio register holding the high byte of the Triangle Channel's timer and loading its length counter. <br /><br />It is available at CPU address `$400B`.",
		es:
			"Un registro de audio que contiene el byte alto del timer del Canal Triangular y carga su contador de longitud. <br /><br />Está disponible en la dirección de CPU `$400B`.",
		fr:
			"Un registre audio contenant l'octet de poids fort du timer du Canal Triangle et chargeant son compteur de longueur. <br /><br />Il est disponible à l'adresse CPU `$400B`.",
		ru:
			"Аудиорегистр, который хранит старший байт таймера треугольного канала и загружает его счётчик длины. <br /><br />Доступен по адресу CPU `$400B`.",
	},
	TriangleTimerLow: {
		icon: "🕡",
		en:
			"An audio register holding the low byte of the Triangle Channel's timer, which sets its frequency. <br /><br />It is available at CPU address `$400A`.",
		es:
			"Un registro de audio que contiene el byte bajo del timer del Canal Triangular, que define su frecuencia. <br /><br />Está disponible en la dirección de CPU `$400A`.",
		fr:
			"Un registre audio contenant l'octet de poids faible du timer du Canal Triangle, qui définit sa fréquence. <br /><br />Il est disponible à l'adresse CPU `$400A`.",
		ru:
			"Аудиорегистр, который хранит младший байт таймера треугольного канала, задающего частоту. <br /><br />Доступен по адресу CPU `$400A`.",
	},
	"VBlank|Vertical Blank": {
		icon: "🏝️",
		en:
			"Longer period after the last scanline of a frame, where the PPU is idle before starting a new frame. It's the best time to update graphics safely.",
		es:
			"Período más largo después de la última scanline de un frame, donde la PPU queda inactiva antes de comenzar uno nuevo. Es el mejor momento para actualizar gráficos sin problemas.",
		fr:
			"Longue période après la dernière scanline d'un frame, où la PPU est inactive avant de commencer un nouveau frame. C'est le meilleur moment pour mettre à jour les graphismes en toute sécurité.",
		ru:
			"Более длинный интервал после последней строки кадра, когда PPU простаивает перед началом следующего кадра. Лучшее время для безопасного обновления графики.",
		also: {
			fr: "VBlank|Effacement vertical",
			ru: "VBlank|Вертикальное гашение|_Vertical Blank",
		},
	},
	VDraw: {
		icon: "🖍️",
		en:
			"The period when the PPU is actively drawing the frame, scanline by scanline. It starts after the pre-line and ends before VBlank.",
		es:
			"El período en el que la PPU está dibujando activamente el frame, scanline por scanline. Comienza después de la pre-line y termina antes del VBlank.",
		fr:
			"La période pendant laquelle la PPU dessine activement le frame, scanline par scanline. Elle commence après la pre-line et se termine avant le VBlank.",
		ru:
			"Период, когда PPU активно рисует кадр строка за строкой. Начинается после предварительной строки и заканчивается перед VBlank.",
	},
	"Video register|_Video registers": {
		also: {
			es: "Registro de video|_Registros de video",
			fr: "Registre vidéo|_Registres vidéo",
			ru:
				"Видеорегистр|_видеорегистры|_видеорегистра|_видеорегистров|_Video register|_Video registers",
		},
		icon: "📺",
		en:
			"A memory-mapped register that the PPU uses to control rendering and expose its internal state.",
		es:
			"Un registro mapeado en memoria que la PPU usa para controlar el renderizado y exponer su estado interno.",
		fr:
			"Un registre mappé en mémoire que la PPU utilise pour contrôler le rendu et exposer son état interne.",
		ru:
			"Регистр, отображённый в память, через который PPU управляет отрисовкой и предоставляет доступ к своему внутреннему состоянию.",
	},
	"Volume envelope|_Volume envelopes|Envelope|_Envelopes": {
		also: {
			es:
				"Envolvente de volumen|_Envolventes de volumen|Envolvente|_Envolventes",
			fr: "Enveloppe de volume|_Enveloppes de volume|Enveloppe|_Enveloppes",
			ru:
				"Огибающая громкости|Огибающая|_огибающей громкости|_огибающие|_огибающей|_Volume envelope|_Volume envelopes|_Envelope|_Envelopes",
		},
		icon: "📉",
		en:
			"A mechanism that automatically adjusts a channel's output volume over time according to its rate and loop settings. <br /><br />It's used to produce _fade out_ effects.",
		es:
			"Un mecanismo que ajusta automáticamente el volumen de salida de un canal a lo largo del tiempo según sus opciones de tasa y bucle. <br /><br />Se usa para producir efectos de _desvanecimiento_.",
		fr:
			"Un mécanisme qui ajuste automatiquement le volume de sortie d'un canal au fil du temps selon ses réglages de taux et de boucle. <br /><br />Il est utilisé pour produire des effets de _fondu sortant_.",
		ru:
			"Механизм, который автоматически меняет громкость канала со временем в соответствии с настройками скорости и зацикливания. <br /><br />Используется для эффектов _затухания_.",
	},
	VRAM: {
		icon: "🐏",
		en:
			"_(Video RAM)_ A RAM chip of `2` KiB that lives in the PPU. It holds name tables.",
		es:
			"_(Video RAM)_ Un chip de RAM de `2` KiB que vive en la PPU. Almacena name tables.",
		fr:
			"_(Video RAM)_ Une puce RAM de `2` Kio qui se trouve dans la PPU. Elle stocke les name tables.",
		ru:
			"_(Video RAM)_ Микросхема RAM объёмом `2` КиБ внутри PPU. Хранит таблицы имён.",
	},
	Waveform: {
		also: {
			es: "Forma de onda",
			fr: "Forme d'onde",
			ru: "Форма волны|_формы волны|_форму волны|_Waveform",
		},
		icon: "♒",
		en:
			"The general shape of a wave over time. Common waveforms include sine, square, triangle, and sawtooth.",
		es:
			"La forma general de una onda a lo largo del tiempo. Las formas comunes incluyen seno, cuadrada, triangular y diente de sierra.",
		fr:
			"La forme générale d'une onde dans le temps. Les formes d'onde courantes incluent sinusoïdale, carrée, triangulaire et en dents de scie.",
		ru:
			"Общий вид волны во времени. Распространённые формы: синусоидальная, прямоугольная, треугольная и пилообразная.",
	},
	WRAM: {
		icon: "🐏",
		en:
			"_(Work RAM)_ A RAM chip of `2` KiB that lives in the CPU. General purpose.",
		es:
			"_(Work RAM)_ Un chip de RAM de `2` KiB que vive en la CPU. Propósito general.",
		fr:
			"_(Work RAM)_ Une puce RAM de `2` Kio qui se trouve dans le CPU. Utilisation générale.",
		ru:
			"_(Work RAM)_ Микросхема RAM общего назначения объёмом `2` КиБ внутри CPU.",
	},
	"Zero Flag": {
		also: {
			es: "Bandera Zero",
			fr: "Flag Zero",
			ru: "Флаг нуля|_флага нуля|_Zero Flag",
		},
		icon: "🏁",
		en: "A CPU flag that indicates when the result of an operation is `0`.",
		es:
			"Una bandera de CPU que indica cuando el resultado de una operación es `0`.",
		fr: "Un flag CPU qui indique quand le résultat d'une opération est `0`.",
		ru: "Флаг CPU, который показывает, что результат операции равен `0`.",
	},
	"Zero Page|First page": {
		also: {
			es: "Página Cero|Primera página",
			fr: "Page zéro|Première page",
			ru:
				"Нулевая страница|Первая страница|_нулевой страницы|_нулевой странице|_нулевую страницу|_Zero Page|_First page",
		},
		icon: "🐏",
		en:
			"The first `256` bytes of WRAM, located in addresses `$0000` - `$00FF`.",
		es:
			"Los primeros `256` bytes de WRAM, ubicados en las direcciones `$0000` - `$00FF`.",
		fr:
			"Les premiers `256` octets de la WRAM, situés aux adresses `$0000` - `$00FF`.",
		ru: "Первые `256` байт WRAM по адресам `$0000` - `$00FF`.",
	},
};
