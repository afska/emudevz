import escapeStringRegexp from "escape-string-regexp";
import { marked } from "marked";
import _ from "lodash";
import locales from "../locales";
import { toast } from "../utils";

export default {
	APU: {
		icon: "🔊",
		en: "The _Audio Processing Unit_. It handles sound, producing audio waves.",
		es:
			"La _Unidad de Procesamiento de Audio_. Maneja el sonido, produciendo ondas de audio.",
	},
	CPU: {
		icon: "🧠",
		en:
			"The _Central Processing Unit_. It reads games' code and executes their instructions.",
		es:
			"La _Unidad Central de Procesamiento_. Lee el código de los juegos y ejecuta sus instrucciones.",
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
	"Register|Registers": {
		also: { es: "Registro|Registros" },
		icon: "🔢",
		en: "A CPU value holder",
		es: "Un contenedor de valor de la CPU",
	},
	VRAM: {
		icon: "🐏",
		en:
			"_(Video RAM)_ A RAM chip of _2 KiB_ that lives in the PPU. It holds name tables.",
		es:
			"_(Video RAM)_ Un chip de RAM de _2 KiB_ que vive en la PPU. Almacena name tables.",
	},
	WRAM: {
		icon: "🐏",
		en:
			"_(Work RAM)_ A RAM chip of _2 KiB_ that lives in the CPU. General purpose.",
		es:
			"_(Work RAM)_ Un chip de RAM de _2 KiB_ que vive en la CPU. Propósito general.",
	},

	showDefinition(word) {
		const { icon, name, text } = this.getDefinition(word);
		const markdown = `<h5 class="dictionary-entry">${icon} ${name}</h5>\n${text}`;
		const html = marked.parseInline(markdown, []);
		toast.normal(
			<span
				style={{ textAlign: "center" }}
				dangerouslySetInnerHTML={{
					__html: html,
				}}
			/>
		);
	},

	getEntries() {
		const keys = this._keys();
		const localizedKeys = _.flatMap(keys, (key) => this._getUsableKeysOf(key));
		return localizedKeys;
	},

	getRegexp() {
		const entries = this.getEntries();
		return new RegExp(
			// eslint-disable-next-line
			_.template("(${entries})")({
				entries: entries
					.map((it) => `(?<!\\.)\\b${escapeStringRegexp(it)}\\b`)
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
		const name = this._getUsableKeysOf(key)[0];

		return {
			icon: data.icon,
			name,
			text: this[key][locales.language],
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
				"getEntries",
				"getRegexp",
				"getDefinition",
				"_getUsableKeysOf",
				"_keys"
			)
			.value();
	},
};
