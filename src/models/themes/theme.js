import { ansi256ToHex } from "../../utils/ansi256";

export const INVERTABLE_IMAGES = [
	"header",
	"tile_bitplanes",
	"palette_ram",
	"name_tables",
	"_interrupts",
	"_golden_log",
	"_PPUData_access",
];

export const TERMINAL_ANSI_INDICES = {
	system: 45,
	comment: 230,
	message: 111,
	accent: 180,
	dictionary: 195,
	input: 207,
	error: 202,
	warning: 214,
	diffAdded: 41,
	diffRemoved: 196,
};

export const GLOBAL_THEME_GROUPS = [
	{
		title: {
			ru: "Фон",
			en: "Background",
			es: "Fondo",
		},
		description: {
			ru: "Основной фон игры.",
			en: "Base background of the game.",
			es: "Fondo base del juego.",
		},
		variants: [
			{ key: "background", label: "base", defaultValue: "#000000" },
			{ key: "background-crt", label: "crt", defaultValue: "#121010" },
			{ key: "background-code", label: "editor", defaultValue: "#111111" },
			{ key: "background-ui", label: "ui", defaultValue: "#18181a" },
			{
				key: "background-ui-selected",
				label: "ui-selected",
				defaultValue: "#2b323a",
			},
			{
				key: "background-tvnoise",
				label: "tvnoise",
				defaultValue: "#333333",
			},
		],
	},
	{
		title: {
			ru: "CRT-фильтр",
			en: "CRT filter",
			es: "Filtro CRT",
		},
		description: {
			ru: "Цвета строк развёртки и тонкая настройка CRT-фильтра.",
			en: "CRT filter scanline colors and fine-tuning.",
			es: "Colores del filtro CRT y ajuste fino de las scanlines.",
		},
		variants: [
			{ key: "crt-gradient1", label: "gradient1", defaultValue: "#12101000" },
			{ key: "crt-gradient2", label: "gradient2", defaultValue: "#00000040" },
			{ key: "crt-gradient3", label: "gradient3", defaultValue: "#ff00000f" },
			{ key: "crt-gradient4", label: "gradient4", defaultValue: "#00ff0005" },
			{ key: "crt-gradient5", label: "gradient5", defaultValue: "#0000ff0f" },
		],
	},
	{
		title: {
			ru: "Подсветка",
			en: "Highlight",
			es: "Resaltado",
		},
		description: {
			ru: "Цвет свечения и тени.",
			en: "Drop-shadow highlight color.",
			es: "Color de resplandor/sombra.",
		},
		variants: [
			{ key: "highlight", label: "highlight", defaultValue: "#ffffff" },
		],
	},
	{
		title: {
			ru: "Основной цвет",
			en: "Primary color",
			es: "Color primario",
		},
		description: {
			ru: "Основной цвет темы.",
			en: "Theme's main color.",
			es: "Color principal del tema.",
		},
		variants: [
			{ key: "primary", label: "base", defaultValue: "#466a8e" },
			{
				key: "primary-medium",
				label: "medium",
				defaultValue: "#577295",
			},
			{ key: "primary-light", label: "light", defaultValue: "#6f8fb9" },
			{ key: "primary-vibrant", label: "vibrant", defaultValue: "#3398dc" },
			{ key: "primary-dark", label: "dark", defaultValue: "#1c3554" },
			{
				key: "primary-superdark",
				label: "superdark",
				defaultValue: "#2e303c",
			},
			{ key: "primary-alt", label: "alt", defaultValue: "#505a69" },
			{
				key: "primary-alt-light",
				label: "alt-light",
				defaultValue: "#697992",
			},
			{
				key: "primary-translucent",
				label: "translucent",
				defaultValue: "#2e3c49ee",
			},
		],
	},
	{
		title: {
			ru: "Дополнительный цвет",
			en: "Secondary color",
			es: "Color secundario",
		},
		description: {
			ru: "Дополнительный цвет темы.",
			en: "Theme's secondary color.",
			es: "Color secundario del tema.",
		},
		variants: [
			{ key: "secondary", label: "base", defaultValue: "#c39f79" },
			{ key: "secondary-vibrant", label: "vibrant", defaultValue: "#e8a931" },
			{
				key: "secondary-translucent-light",
				label: "translucent-light",
				defaultValue: "#e3ae49cc",
			},
			{
				key: "secondary-translucent-dark",
				label: "translucent-dark",
				defaultValue: "#a67f35cc",
			},
		],
	},
	{
		title: {
			ru: "Нейтральный цвет",
			en: "Neutral color",
			es: "Color neutro",
		},
		description: {
			ru: "Нейтральный цвет темы (например, серый).",
			en: "Neutral theme color (like gray).",
			es: "Color neutro del tema (como gris).",
		},
		variants: [
			{
				key: "neutral-border",
				label: "border",
				defaultValue: "#a9a9a9",
			},
			{
				key: "neutral-shadow1",
				label: "shadow1",
				defaultValue: "#00000013",
			},
			{
				key: "neutral-shadow2",
				label: "shadow2",
				defaultValue: "#c8c8c899",
			},
			{
				key: "neutral-superlight",
				label: "superlight",
				defaultValue: "#ffffff",
			},
			{
				key: "neutral-translucent",
				label: "translucent",
				defaultValue: "#1e1e1e80",
			},
		],
	},
	{
		title: {
			ru: "Особые цвета",
			en: "Special colors",
			es: "Colores especiales",
		},
		description: {
			ru: "Цвета с особым значением.",
			en: "Colors with a special meaning.",
			es: "Colores con un significado especial.",
		},
		variants: [
			{ key: "success", label: "success", defaultValue: "#5cb85c" },
			{ key: "failure", label: "failure", defaultValue: "#d9534f" },
			{ key: "warning", label: "warning", defaultValue: "#e8a931" },
			{ key: "danger", label: "danger", defaultValue: "#ff07005e" },
			{ key: "unlocked", label: "unlocked", defaultValue: "#b8a7e8" },
			{ key: "locked", label: "locked", defaultValue: "#acacac" },
			{ key: "disabled", label: "disabled", defaultValue: "#323232" },
		],
	},
	{
		title: {
			ru: "Текст",
			en: "Text",
			es: "Texto",
		},
		description: {
			ru: "Основной цвет текста.",
			en: "General text color.",
			es: "Color de texto general.",
		},
		variants: [
			{ key: "text", label: "base", defaultValue: "#ffffff" },
			{ key: "text-dim", label: "dim", defaultValue: "#b7bbc7" },
			{
				key: "text-dim-alt",
				label: "dim-alt",
				defaultValue: "#a5b0ba",
			},
			{
				key: "text-neutral-light",
				label: "neutral-light",
				defaultValue: "#b3b3b3",
			},
			{
				key: "text-neutral-dark",
				label: "neutral-dark",
				defaultValue: "#808080",
			},
			{
				key: "text-highlight",
				label: "highlight",
				defaultValue: "#d7d6ff",
			},
			{
				key: "text-markdown",
				label: "markdown",
				defaultValue: "#cccccc",
			},
			{ key: "text-tab", label: "tab", defaultValue: "#b3c6df" },
		],
	},
	{
		title: {
			ru: "Ссылка",
			en: "Hyperlink",
			es: "Hipervínculo",
		},
		description: {
			ru: "Цвет ссылок.",
			en: "Hyperlink color.",
			es: "Color de los hipervínculos.",
		},
		variants: [
			{ key: "link", label: "base", defaultValue: "#0d6efd" },
			{ key: "link-hover", label: "hover", defaultValue: "#0a58ca" },
			{
				key: "link-highlight",
				label: "highlight",
				defaultValue: "#9db5dc",
			},
			{
				key: "link-highlight-hover",
				label: "highlight-hover",
				defaultValue: "#ccd1f9",
			},
		],
	},
	{
		title: {
			ru: "Редактор кода",
			en: "Code editor",
			es: "Editor de código",
		},
		description: {
			ru: "Цвета редактора кода.",
			en: "Code editor colors.",
			es: "Colores del editor de código.",
		},
		variants: [
			{
				key: "editor-error",
				label: "error",
				defaultValue: "#e8433180",
			},
			{
				key: "editor-highlight",
				label: "highlight",
				defaultValue: "#62708080",
			},
		],
	},
	{
		title: {
			ru: "Уведомления",
			en: "Toasts",
			es: "Notificaciones",
		},
		description: {
			ru: "Всплывающие уведомления.",
			en: "Toast messages.",
			es: "Mensajes emergentes (toasts).",
		},
		variants: [
			{
				key: "toast-background",
				label: "background",
				defaultValue: "#333333",
			},
			{ key: "toast-text", label: "text", defaultValue: "#ffffff" },
		],
	},
	{
		title: {
			ru: "Диалоговые окна",
			en: "Modals",
			es: "Modales",
		},
		description: {
			ru: "Диалоговые окна.",
			en: "Modal dialogs.",
			es: "Diálogos modales.",
		},
		variants: [
			{
				key: "modal-background",
				label: "background",
				defaultValue: "#373737cc",
			},
			{
				key: "modal-accent",
				label: "accent",
				defaultValue: "#dcdcdc29",
			},
		],
	},
	{
		title: {
			ru: "Поля ввода",
			en: "Inputs",
			es: "Entradas",
		},
		description: {
			ru: "Элементы форм.",
			en: "Form controls.",
			es: "Controles de formulario.",
		},
		variants: [
			{
				key: "input-background",
				label: "background",
				defaultValue: "#435c69",
			},
			{ key: "input-text", label: "text", defaultValue: "#ffffff" },
		],
	},
	{
		title: {
			ru: "Кнопки",
			en: "Buttons",
			es: "Botones",
		},
		description: {
			ru: "Внешний вид кнопок.",
			en: "Buttons appearance.",
			es: "Apariencia de los botones.",
		},
		variants: [
			{
				key: "button-background",
				label: "background",
				defaultValue: "#00000080",
			},
			{
				key: "button-border",
				label: "border",
				defaultValue: "#808080",
			},
			{
				key: "button-hover",
				label: "hover",
				defaultValue: "#e6e6e699",
			},
			{
				key: "icon-button",
				label: "icon",
				defaultValue: "#ffffff",
			},
			{
				key: "icon-button-hover",
				label: "icon-hover",
				defaultValue: "#466a8e",
			},
		],
	},
	{
		title: {
			ru: "Плавающая кнопка",
			en: "FAB",
			es: "Botón flotante",
		},
		description: {
			ru: "Внешний вид плавающей кнопки действия.",
			en: "Floating Action Button appearance.",
			es: "Apariencia del botón flotante de acción.",
		},
		variants: [
			{
				key: "fab-background",
				label: "background",
				defaultValue: "#7792b2",
			},
			{ key: "fab-hover", label: "hover", defaultValue: "#9bc0e9" },
			{ key: "fab-inner", label: "inner", defaultValue: "#252525" },
			{
				key: "fab-disabled",
				label: "disabled",
				defaultValue: "#929292",
			},
		],
	},
	{
		title: {
			ru: "Панели и индикаторы",
			en: "Bars",
			es: "Barras",
		},
		description: {
			ru: "Индикаторы прогресса и элементы панели навигации.",
			en: "Bars like progress bars or NavBar items.",
			es:
				"Barras como barras de progreso o elementos de la barra de navegación.",
		},
		variants: [
			{
				key: "bar-background",
				label: "background",
				defaultValue: "#ecf0f1",
			},
			{
				key: "bar-border",
				label: "border",
				defaultValue: "#ffffff",
			},
			{
				key: "bar-shadow",
				label: "shadow",
				defaultValue: "#00000033",
			},
			{
				key: "bar-highlight",
				label: "highlight",
				defaultValue: "#27afd7",
			},
		],
	},
	{
		title: {
			ru: "Выбор главы",
			en: "Chapter select",
			es: "Selector de capítulo",
		},
		description: {
			ru: "Окно выбора главы.",
			en: "Chapter select modal.",
			es: "Modal de selección de capítulo.",
		},
		variants: [
			{
				key: "chapter-opt-background",
				label: "background",
				defaultValue: "#e6e6e699",
			},
			{
				key: "chapter-tree-line",
				label: "tree-line",
				defaultValue: "#ffffff",
			},
		],
	},
	{
		title: {
			ru: "Отладчик CPU",
			en: "CPU Debugger",
			es: "Depurador de CPU",
		},
		description: {
			ru: "Внешний вид отладчика из главы об ассемблере.",
			en: "Appearance of the debugger featured in the Assembly chapter.",
			es: "Apariencia del depurador usado en el capítulo de Assembly.",
		},
		variants: [
			{
				key: "cpu-debugger-table-bg",
				label: "table-bg",
				defaultValue: "#18181a",
			},
			{
				key: "cpu-debugger-table-striped-bg",
				label: "table-striped-bg",
				defaultValue: "#202428",
			},
			{
				key: "cpu-debugger-table-hover-bg",
				label: "table-hover-bg",
				defaultValue: "#2b3036",
			},
			{
				key: "cpu-debugger-table-border",
				label: "table-border",
				defaultValue: "#4b4d51",
			},
			{
				key: "cpu-debugger-name",
				label: "name",
				defaultValue: "#9bc0e9",
			},
			{
				key: "cpu-debugger-nonzero-cell",
				label: "nonzero-cell",
				defaultValue: "#e5c07b",
			},
			{
				key: "cpu-debugger-zero-cell",
				label: "zero-cell",
				defaultValue: "#ffffff",
			},
			{
				key: "cpu-debugger-sentence",
				label: "sentence",
				defaultValue: "#c678dd",
			},
			{
				key: "cpu-debugger-sp",
				label: "sp",
				defaultValue: "#4b4d51",
			},
		],
	},
	{
		title: {
			ru: "Сравнение изображений",
			en: "Image diff",
			es: "Comparador de imágenes",
		},
		description: {
			ru: "Инструмент сравнения изображений.",
			en: "Image comparer tool.",
			es: "Herramienta para comparar imágenes.",
		},
		variants: [
			{
				key: "diff-expected",
				label: "expected",
				defaultValue: "#63c363",
			},
			{
				key: "diff-actual",
				label: "actual",
				defaultValue: "#ff7777",
			},
		],
	},
];

export const getDefaultConsoleTheme = () => ({
	background: "#111111",
	cursor: "#ffffff",
	cursorAccent: "#111111",
	foreground: "#ffffff",
	selectionBackground: "#ffffff4d",
	selectionForeground: "",
	bgHighlight: "#2e3436",
	bgNew: "#75507b",
});

export const getDefaultTerminalAnsiTheme = () => {
	const theme = {};
	for (const [key, index] of Object.entries(TERMINAL_ANSI_INDICES))
		theme[key] = ansi256ToHex(index);
	return theme;
};

export const getDefaultGlobalTheme = () => {
	const theme = {};

	for (const group of GLOBAL_THEME_GROUPS) {
		for (const variant of group.variants) {
			theme[variant.key] = variant.defaultValue;
		}
	}

	return theme;
};

export const getDefaultLayoutBrightness = () => ({
	unselected: 0.9,
	selected: 1.25,
});
