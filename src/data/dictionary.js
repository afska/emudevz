import _ from "lodash";
import locales from "../locales";

export default {
	NEEES: {
		icon: "🕹",
		en:
			"The piece of hardware we're trying to emulate. People think it means _'No Entiendo' Enigmatic Enjoyment Solution_",
		es:
			"La pieza de hardware que estamos tratando de emular. La gente piensa que significa _'No Entiendo' El Entretenimiento Saludable_",
	},

	Register: {
		also: { es: "registro" },
		icon: "🔢",
		en: "A CPU value holder",
		es: "Un contenedor de valor de la CPU",
	},

	"Name table|Name tables": {
		also: { es: "Tabla de nombres|Tablas de nombres" },
		icon: "🏞️📖",
		en: "THE NAME TABLE",
		es: "LA TABLA DE NOMBRES",
	},

	getEntries() {
		const keys = this._keys();
		const localizedKeys = _.flatMap(keys, (key) => this._getUsableKeysOf(key));
		return localizedKeys;
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
			.without("getEntries", "getDefinition", "_getUsableKeysOf", "_keys")
			.value();
	},
};
