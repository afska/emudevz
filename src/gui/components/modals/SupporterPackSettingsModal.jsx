import React, { PureComponent } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FaDownload, FaUndo, FaUpload } from "react-icons/fa";
import { connect } from "react-redux";
import locales from "../../../locales";
import { bus, filepicker, toast } from "../../../utils";
import AlphaColorInput from "../../../utils/AlphaColorInput";
import { sfx } from "../../sound";
import {
	GLOBAL_THEME_GROUPS,
	TERMINAL_ANSI_INDICES,
	getDefaultConsoleTheme,
	getDefaultGlobalTheme,
	getDefaultLayoutBrightness,
	getDefaultTerminalAnsiTheme,
} from "../../theme";
import IconButton from "../widgets/IconButton";
import VolumeSlider from "../widgets/VolumeSlider";
import modalStyles from "./SettingsModal.module.css";
import styles from "./SupporterPackSettingsModal.module.css";

const FILE_NAME = "emudevz-theme.json";
const THEME_OPTIONS = [
	{ value: "oneDark", labelKey: "supporter_theme_option_oneDark" },
	{ value: "basicLight", labelKey: "supporter_theme_option_basicLight" },
	{ value: "basicDark", labelKey: "supporter_theme_option_basicDark" },
	{
		value: "solarizedLight",
		labelKey: "supporter_theme_option_solarizedLight",
	},
	{ value: "solarizedDark", labelKey: "supporter_theme_option_solarizedDark" },
	{ value: "materialDark", labelKey: "supporter_theme_option_materialDark" },
	{ value: "nord", labelKey: "supporter_theme_option_nord" },
	{ value: "gruvboxLight", labelKey: "supporter_theme_option_gruvboxLight" },
	{ value: "gruvboxDark", labelKey: "supporter_theme_option_gruvboxDark" },
];

class SupporterPackSettingsModal extends PureComponent {
	render() {
		const {
			open,
			editorTheme,
			consoleTheme,
			terminalAnsiTheme,
			invertTransparentImages,
			layoutBrightness,
		} = this.props;
		const DEFAULT_CONSOLE = getDefaultConsoleTheme();
		const DEFAULT_ANSI = getDefaultTerminalAnsiTheme();
		const DEFAULT_LAYOUT = getDefaultLayoutBrightness();
		const DEFAULT_UNSELECTED = DEFAULT_LAYOUT.unselected;
		const DEFAULT_SELECTED = DEFAULT_LAYOUT.selected;

		return (
			<Modal
				show={open}
				onHide={this._onClose}
				centered
				contentClassName={"crt " + modalStyles.modalContent}
			>
				<Modal.Header>
					<div className={styles.headerRow}>
						<Modal.Title>{locales.get("supporter_title")}</Modal.Title>
						<div className={styles.headerActions}>
							<IconButton
								Icon={FaDownload}
								tooltip={locales.get("supporter_export_json")}
								onClick={this._exportTheme}
							/>
							<IconButton
								Icon={FaUpload}
								tooltip={locales.get("supporter_import_json")}
								onClick={this._importTheme}
							/>
							<IconButton
								Icon={FaUndo}
								tooltip={locales.get("restore_defaults")}
								onClick={this._restoreDefaults}
							/>
						</div>
					</div>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group>
							<h5 className={styles.sectionTitleLarge}>
								{locales.get("supporter_editor_theme_title")}
							</h5>
							<p className={styles.sectionDescriptionTopLevel}>
								{locales.get("supporter_editor_theme_description")}
							</p>
							<Form.Select
								style={{ marginTop: 8 }}
								value={editorTheme || "oneDark"}
								onChange={(e) => {
									this.props.setEditorTheme(e.target.value);
									bus.emit("theme-changed");
								}}
							>
								{THEME_OPTIONS.map((themeOption) => (
									<option key={themeOption.value} value={themeOption.value}>
										{locales.get(themeOption.labelKey)}
									</option>
								))}
							</Form.Select>
						</Form.Group>

						<div className={styles.section}>
							<h5 className={styles.sectionTitleLarge}>
								{locales.get("supporter_console_theme_title")}
							</h5>
							<p className={styles.sectionDescriptionTopLevel}>
								{locales.get("supporter_console_theme_description")}
							</p>
							{this._renderColorPickerGrid(
								Object.keys(DEFAULT_CONSOLE).map((themeKey) => ({
									key: themeKey,
									value: consoleTheme?.[themeKey],
									defaultValue: DEFAULT_CONSOLE[themeKey],
									onChange: (hex) => this._setConsoleTheme({ [themeKey]: hex }),
									dialLabel: themeKey,
									displayLabel: themeKey,
								})),
								false
							)}
						</div>

						<div className={styles.section}>
							<h5 className={styles.sectionTitleLarge}>
								{locales.get("supporter_terminal_apps_title")}
							</h5>
							<p className={styles.sectionDescriptionTopLevel}>
								{locales.get("supporter_terminal_apps_description")}
							</p>
							{this._renderColorPickerGrid(
								Object.keys(DEFAULT_ANSI).map((themeKey) => {
									const hex =
										terminalAnsiTheme?.[themeKey] || DEFAULT_ANSI[themeKey];
									const index = TERMINAL_ANSI_INDICES[themeKey];
									const dialLabel =
										index != null ? `${themeKey} (${index})` : themeKey;

									return {
										key: themeKey,
										value: hex,
										defaultValue: DEFAULT_ANSI[themeKey],
										onChange: (next) => this._setAnsi(themeKey, next),
										dialLabel,
										displayLabel: themeKey,
									};
								}),
								false
							)}
						</div>

						<div className={styles.section}>
							<h5 className={styles.sectionTitleLarge}>
								{locales.get("supporter_global_theme_title")}
							</h5>
							{GLOBAL_THEME_GROUPS.map((group) => (
								<div key={group.title} className={styles.group}>
									<h6 className={styles.groupTitle}>
										{locales.get(group.title)}
									</h6>
									<p className={styles.sectionDescription}>
										{locales.get(group.description)}
									</p>
									{this._renderColorPickerGrid(
										this._buildGlobalThemeGroupItems(group),
										true
									)}
								</div>
							))}

							<Form.Check
								type="checkbox"
								id="invert-transparent-images"
								label={locales.get("supporter_invert_images_label")}
								checked={!!invertTransparentImages}
								style={{ marginTop: 16 }}
								onChange={(event) =>
									this._setInvertTransparentImages(event.target.checked)
								}
								className={styles.terminalCheckbox}
							/>
							<p className={styles.sectionDescription}>
								{locales.get("supporter_invert_images_description")}
							</p>
						</div>

						<div className={styles.section}>
							<h5 className={styles.brightnessTitle}>
								{locales.get("supporter_layout_brightness_title")}
							</h5>
							<p className={styles.brightnessDescription}>
								{locales.get("supporter_layout_brightness_description")}
							</p>
							{(() => {
								const rawUnselected = layoutBrightness?.unselected;
								const rawSelected = layoutBrightness?.selected;
								const unselected =
									typeof rawUnselected === "number"
										? rawUnselected
										: DEFAULT_UNSELECTED;
								const selected =
									typeof rawSelected === "number"
										? rawSelected
										: DEFAULT_SELECTED;

								return (
									<>
										<div className={styles.brightnessRow}>
											<div className={styles.brightnessLabel}>
												{locales.get("supporter_brightness_unselected")}
											</div>
											<input
												type="range"
												min={50}
												max={90}
												value={Math.round(unselected * 100)}
												onChange={(e) =>
													this._setLayoutBrightness(
														"unselected",
														Number(e.target.value) / 100
													)
												}
											/>
											<span className={styles.brightnessValue}>
												{Math.round(unselected * 100)}%
											</span>
										</div>
										<div className={styles.brightnessRow}>
											<div className={styles.brightnessLabel}>
												{locales.get("supporter_brightness_selected")}
											</div>
											<input
												type="range"
												min={100}
												max={125}
												value={Math.round(selected * 100)}
												onChange={(e) =>
													this._setLayoutBrightness(
														"selected",
														Number(e.target.value) / 100
													)
												}
											/>
											<span className={styles.brightnessValue}>
												{Math.round(selected * 100)}%
											</span>
										</div>
									</>
								);
							})()}
						</div>

						<div className={styles.section}>
							<h5 className={styles.sectionTitleLarge}>
								{locales.get("supporter_imgui_theme_title")}
							</h5>
							<p className={styles.sectionDescriptionTopLevel}>
								{locales.get("supporter_imgui_theme_description")}
							</p>
							<Form.Select
								style={{ marginTop: 8 }}
								value={this.props.imguiTheme || "classic"}
								onChange={(e) => {
									this.props.setImguiTheme(e.target.value);
									bus.emit("theme-changed");
								}}
							>
								<option value="classic">
									{locales.get("supporter_imgui_theme_classic")}
								</option>
								<option value="dark">
									{locales.get("supporter_imgui_theme_dark")}
								</option>
								<option value="light">
									{locales.get("supporter_imgui_theme_light")}
								</option>
							</Form.Select>
						</div>
						<div className={styles.section}>
							<h5 className={styles.sectionTitleLarge}>
								{locales.get("supporter_sfx_title")}
							</h5>
							<p className={styles.sectionDescriptionTopLevel}>
								{locales.get("supporter_sfx_description")}
							</p>
							<VolumeSlider
								disableTooltip
								volume={this.props.sfxVolume}
								setVolume={(v) => {
									this._setSfxVolume(v);
								}}
							/>
						</div>
					</Form>
				</Modal.Body>
			</Modal>
		);
	}

	_renderColorPickerGrid = (items, useNarrowLabels = false) => {
		const labelClassName = useNarrowLabels
			? styles.colorPickerLabelNarrow
			: styles.colorPickerLabel;

		return (
			<div className={styles.colorPickerGrid}>
				{items.map((item) => (
					<div key={item.key} className={styles.colorPickerItem}>
						<AlphaColorInput
							value={item.value}
							defaultValue={item.defaultValue}
							onChange={item.onChange}
							onReset={() => item.onChange(item.defaultValue)}
							label={item.dialLabel}
						/>
						<span className={labelClassName}>{item.displayLabel}</span>
					</div>
				))}
			</div>
		);
	};

	_buildGlobalThemeGroupItems = (group) => {
		const groupItems = [];

		for (const variant of group.variants) {
			const themeKey = variant.key;
			const defaultValue = variant.defaultValue;
			if (!defaultValue) continue;

			const currentValue = this.props.globalTheme?.[themeKey];

			groupItems.push({
				key: variant.key,
				value: currentValue,
				defaultValue,
				onChange: (hex) => this._setGlobalTheme({ [themeKey]: hex }),
				dialLabel: variant.label,
				displayLabel: variant.label,
			});
		}

		return groupItems;
	};

	_onClose = () => {
		this.props.onClose();
	};

	_setAnsi = (key, val) => {
		this.props.setTerminalAnsiTheme({ [key]: val });
		bus.emit("theme-changed");
	};

	_setConsoleTheme = (partial) => {
		this.props.setConsoleTheme(partial);
		bus.emit("theme-changed");
	};

	_setGlobalTheme = (partial) => {
		this.props.setGlobalTheme(partial);
		bus.emit("theme-changed");
	};

	_setInvertTransparentImages = (invertTransparentImages) => {
		this.props.setInvertTransparentImages(invertTransparentImages);
		bus.emit("theme-changed");
	};

	_setLayoutBrightness = (key, value) => {
		if (typeof value !== "number" || Number.isNaN(value)) return;
		this.props.setLayoutBrightness({ [key]: value });
		bus.emit("theme-changed");
	};

	_exportTheme = () => {
		const {
			editorTheme,
			consoleTheme,
			terminalAnsiTheme,
			globalTheme,
			invertTransparentImages,
			layoutBrightness,
			imguiTheme,
		} = this.props;

		const data = {
			editorTheme,
			consoleTheme,
			terminalAnsiTheme,
			globalTheme,
			invertTransparentImages: !!invertTransparentImages,
			layoutBrightness,
			imguiTheme,
		};

		const json = JSON.stringify(data, null, 2);
		filepicker.saveAs(json, FILE_NAME);
		sfx.play("save");
	};

	_importTheme = () => {
		filepicker.open(".json", (buffer) => {
			try {
				const text = new TextDecoder("utf-8").decode(buffer);
				const data = JSON.parse(text);
				if (!data || typeof data !== "object") return;

				const applySubset = (source, defaults, setter) => {
					if (!source || typeof source !== "object") return;
					const partial = {};
					for (const key of Object.keys(defaults)) {
						if (Object.prototype.hasOwnProperty.call(source, key))
							partial[key] = source[key];
					}
					if (Object.keys(partial).length === 0) return;
					setter(partial);
				};

				if (typeof data.editorTheme === "string")
					this.props.setEditorTheme(data.editorTheme);

				applySubset(
					data.consoleTheme,
					getDefaultConsoleTheme(),
					this.props.setConsoleTheme
				);
				applySubset(
					data.terminalAnsiTheme,
					getDefaultTerminalAnsiTheme(),
					this.props.setTerminalAnsiTheme
				);
				applySubset(
					data.globalTheme,
					getDefaultGlobalTheme(),
					this.props.setGlobalTheme
				);

				if (typeof data.invertTransparentImages === "boolean")
					this.props.setInvertTransparentImages(data.invertTransparentImages);

				if (
					data.layoutBrightness &&
					typeof data.layoutBrightness === "object"
				) {
					const defaults = getDefaultLayoutBrightness();
					const subset = {};
					for (const key of Object.keys(defaults)) {
						if (
							Object.prototype.hasOwnProperty.call(data.layoutBrightness, key)
						) {
							subset[key] = data.layoutBrightness[key];
						}
					}
					if (Object.keys(subset).length > 0) {
						this.props.setLayoutBrightness(subset);
					}
				}

				if (typeof data.imguiTheme === "string")
					this.props.setImguiTheme(data.imguiTheme);

				bus.emit("theme-changed");
				toast.success(locales.get("it_worked"));
				sfx.play("load");
			} catch (e) {
				console.error("💥 Failed to import theme JSON", e);
				toast.error(locales.get("the_operation_failed"));
			}
		});
	};

	_setSfxVolume(volume) {
		this.props.setSfxVolume(volume);
		sfx.setVolume(volume);
	}

	_restoreDefaults = () => {
		this.props.setEditorTheme("oneDark");
		this.props.setConsoleTheme(getDefaultConsoleTheme());
		this.props.setTerminalAnsiTheme(getDefaultTerminalAnsiTheme());
		this.props.setGlobalTheme(getDefaultGlobalTheme());
		this.props.setInvertTransparentImages(false);
		this.props.setLayoutBrightness(getDefaultLayoutBrightness());
		this.props.setImguiTheme("classic");
		this._setSfxVolume(0.3);
		bus.emit("theme-changed");
	};
}

const mapStateToProps = ({ savedata }) => ({
	editorTheme: savedata.editorTheme,
	consoleTheme: savedata.consoleTheme,
	terminalAnsiTheme: savedata.terminalAnsiTheme,
	globalTheme: savedata.globalTheme,
	invertTransparentImages: savedata.invertTransparentImages,
	layoutBrightness: savedata.layoutBrightness,
	imguiTheme: savedata.imguiTheme,
	sfxVolume: savedata.sfxVolume,
});
const mapDispatchToProps = ({ savedata }) => ({
	setEditorTheme: savedata.setEditorTheme,
	setConsoleTheme: savedata.setConsoleTheme,
	setTerminalAnsiTheme: savedata.setTerminalAnsiTheme,
	setGlobalTheme: savedata.setGlobalTheme,
	setInvertTransparentImages: savedata.setInvertTransparentImages,
	setLayoutBrightness: savedata.setLayoutBrightness,
	setImguiTheme: savedata.setImguiTheme,
	setSfxVolume: savedata.setSfxVolume,
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SupporterPackSettingsModal);
