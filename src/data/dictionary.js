import escapeStringRegexp from "escape-string-regexp";
import { marked } from "marked";
import _ from "lodash";
import locales from "../locales";
import { toast } from "../utils";

const dictionary = {
	"[A]": {
		icon: "🔢",
		en:
			"_(Accummulator Register)_ A CPU register used to store the result of arithmetic and logic operations.",
		es:
			"_(Registro Acumulador)_ Un registro de CPU usado para almacenar el resultado de operaciones aritméticas y lógicas.",
	},
	"[X]": {
		icon: "🔢",
		en: "_(X Register)_ A CPU register used to index memory and control loops.",
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
		en: "_(Stack Pointer)_ A CPU register used to track the top of the stack.",
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
	"Memory address|Memory addresses|Address|Addresses": {
		also: {
			es: "Dirección de memoria|Direcciones de memoria|Dirección|Direcciones",
		},
		icon: "🐏",
		en:
			"A number that represents a location in memory. <br /><br />In the NEEES, they take up `2` bytes, so they can go from `0` (`$0000`) to `65535` (`$FFFF`).",
		es:
			"Un número que representa una ubicación dentro de la memoria. <br /><br />En la NEEES, ocupan `2` bytes, por lo que pueden ir de `0` (`$0000`) a `65535` (`$FFFF`).",
	},
	APU: {
		icon: "🔊",
		en: "The _Audio Processing Unit_. It handles sound, producing audio waves.",
		es:
			"La _Unidad de Procesamiento de Audio_. Maneja el sonido, produciendo ondas de audio.",
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
	"Cartridge|Cartridges": {
		also: { es: "Cartucho|Cartuchos" },
		icon: "💾",
		en:
			"A removable piece of hardware that contains the all the game chips, such as PRG-ROM, CHR-ROM, PRG-RAM, and the Mapper.",
		es:
			"Una pieza de hardware removible que contiene todos los chips del juego, como PRG-ROM, CHR-ROM, PRG-RAM, y el Mapper.",
	},
	"Controller|Controllers": {
		also: { es: "Mando|Mandos" },
		icon: "🎮",
		en:
			"An 8-bit gamepad (_D-pad + A,B + START,SELECT_). <br /><br />The NEEES accepts _(without extra hardware)_ up to two controllers.",
		es:
			"Un joystick de 8 botones (_D-pad + A,B + START,SELECT_). <br /><br />La NEEES acepta _(sin hardware extra)_ hasta dos mandos.",
	},
	"CHR-ROM": {
		icon: "👾",
		en:
			"_(Character ROM)_ A ROM chip that contains the game graphics, inside the cartridge.",
		es:
			"_(Character ROM)_ Un chip de ROM que contiene los gráficos del juego, dentro del cartucho.",
	},
	CPU: {
		icon: "🧠",
		en:
			"The _Central Processing Unit_. It reads games' code and executes their instructions.",
		es:
			"La _Unidad Central de Procesamiento_. Lee el código de los juegos y ejecuta sus instrucciones.",
	},
	"CPU register|CPU registers|Register|Registers": {
		also: { es: "Registro de CPU|Registros de CPU|Registro|Registros" },
		icon: "🔢",
		en:
			"A small, fast storage location inside the CPU used to hold data temporarily (like numbers, memory addresses, or results of operations) while it's working. <br /><br />In the NEEES, each register can hold a single byte (`8` bits) of data, with the exception of [PC] which is `2` bytes wide.",
		es:
			"Una ubicación pequeña y de rápido acceso dentro de la CPU usada para almacenar datos temporalmente (como números, direcciones de memoria, o resultados de operaciones) mientras está operando. <br /><br />En la NEEES, cada registro puede almacenar un solo byte (`8` bits) de datos, con la excepción de [PC] que ocupa `2` bytes.",
	},
	"Machine code": {
		also: { es: "Código máquina" },
		icon: "🔢",
		en:
			"The bytes that the CPU interpret as code. It's often the product of translating assembly code, written by humans.",
		es:
			"Los bytes que la CPU interpreta cómo código. A menudo es el producto de traducir lenguaje ensamblador escrito por humanos.",
	},
	"Name table|Name tables": {
		also: { es: "Tabla de nombres|Tablas de nombres" },
		icon: "🏞️📖",
		en: "THE NAME TABLE",
		es: "LA TABLA DE NOMBRES",
	},
	NEEES: {
		icon: "🕹️",
		en:
			"The piece of hardware we're trying to emulate. People think it means _'No Entiendo' Enigmatic Enjoyment Solution_.",
		es:
			"La pieza de hardware que estamos tratando de emular. La gente piensa que significa _'No Entiendo' El Entretenimiento Saludable_.",
	},
	PPU: {
		icon: "🖥️",
		en:
			"The _Picture Processing Unit_. It draws graphics by putting pixels on the screen.",
		es:
			"La _Unidad de Procesamiento de Imagen_. Dibuja gráficos poniendo píxeles en la pantalla.",
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

	showDefinition(word) {
		const { icon, name, text, usableKeys } = this.getDefinition(word);
		const html = this.parseLinks(marked.parseInline(text, []), usableKeys);
		toast.normal(
			<span
				style={{ textAlign: "center" }}
				dangerouslySetInnerHTML={{
					__html: `<h5 class="dictionary-entry">${icon} ${name}</h5>\n${html}`,
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
					.filter(
						(word) =>
							!exclude.some((it) => it.toLowerCase() === word.toLowerCase())
					)
					.map((it) => `(?<![^\\s(])${escapeStringRegexp(it)}(?=[\\s,.)?]|$)`)
					// before: string start, whitespace, parenthesis
					// after: whitespace, comma, dot, parenthesis, question mark, or end of string
					.join("|"),
			}),
			"iu"
		);
	},

	getDefinition(entry) {
		const keys = this._keys();
		const key = keys.find((key) => {
			const usableKeys = this._getUsableKeysOf(key);
			return usableKeys.some(
				(usableKey) => usableKey.toLowerCase() === entry.toLowerCase()
			);
		});
		if (key == null) return null;

		const data = this[key];
		const usableKeys = this._getUsableKeysOf(key);
		const name = usableKeys[0];

		return {
			icon: data.icon,
			name,
			text: this[key][locales.language],
			usableKeys,
		};
	},

	_getUsableKeysOf(key) {
		const localizedKey = this[key].also?.[locales.language];
		const usableKey = localizedKey != null ? localizedKey : key;
		return usableKey.split("|");
	},

	_keys() {
		return _(this)
			.keys()
			.without(
				"showDefinition",
				"parseLinks",
				"getEntries",
				"getRegexp",
				"getDefinition",
				"_getUsableKeysOf",
				"_keys"
			)
			.value();
	},
};

window._showDefinition_ = (word) => {
	dictionary.showDefinition(word);
};

export default dictionary;
