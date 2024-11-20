import _ from "lodash";
import locales from "../locales";

export default {
	NEEES: {
		en:
			"The piece of hardware we're trying to emulate. People thinks it means _'No Entiendo' Enigmatic Enjoyment Solution_",
		es:
			"La pieza de hardware que estamos tratando de emular. La gente piensa que significa _'No Entiendo' El Entretenimiento Saludable_",
	},

	register: {
		also: { es: "registro" },
		en: "A CPU value holder",
		es: "Un contenedor de valor de la CPU",
	},

	"name table": {
		en: "THE NAME TABLE",
		es: "LA TABLA DE NOMBRES",
	},

	getEntries() {
		const keys = this._keys();
		const localizedKeys = keys.map((key) => {
			const localizedKey = this[key].also?.[locales.language];
			return localizedKey != null ? localizedKey : key;
		});
		return localizedKeys;
	},

	getDefinition(entry) {
		const keys = this._keys();
		const localizedKeys = this.getEntries();
		const index = localizedKeys.findIndex(
			(it) => it.toLowerCase() === entry.toLowerCase()
		);
		if (index < 0) return null;
		return this[keys[index]][locales.language];
	},

	_keys() {
		return _(this)
			.keys()
			.without("getEntries", "getDefinition", "_keys")
			.value();
	},
};
