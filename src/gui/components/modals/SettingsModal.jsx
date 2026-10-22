import React, { PureComponent } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FaUndo } from "react-icons/fa";
import { connect } from "react-redux";
import classNames from "classnames";
import locales, { LANGUAGES } from "../../../locales";
import {
	DEFAULT_ADVANCED_SETTINGS,
	DEFAULT_KEY_BINDINGS,
} from "../../../models/savedata";
import { filepicker, savefile, toast } from "../../../utils";
import { date } from "../../../utils";
import Button from "../widgets/Button";
import GamepadMapper from "../widgets/GamepadMapper";
import IconButton from "../widgets/IconButton";
import KeyMapper from "../widgets/KeyMapper";
import VolumeSlider from "../widgets/VolumeSlider";
import styles from "./SettingsModal.module.css";

const MARGIN = 16;
const SAVEFILE_EXTENSION = ".devz";

const KEY_BINDING_ITEMS = () => [
	{ id: "paneNavigationUp", label: locales.get("pane_navigation_up") },
	{ id: "paneNavigationDown", label: locales.get("pane_navigation_down") },
	{ id: "paneNavigationLeft", label: locales.get("pane_navigation_left") },
	{ id: "paneNavigationRight", label: locales.get("pane_navigation_right") },
	{ id: "runCode", label: locales.get("run_code") },
	{ id: "fileSearch", label: locales.get("file_search") },
	{ id: "closeFile", label: locales.get("close_file") },
	{ id: "closeFileDesktop", label: locales.get("close_file_desktop") },
	{ id: "nextTab", label: locales.get("next_tab") },
	{ id: "previousTab", label: locales.get("previous_tab") },
];

class SettingsModal extends PureComponent {
	state = {
		areYouSureRestore: false,
		areYouSureDelete: false,
		isLoadingSaveBackup: false,
		isLoadingSaveRestore: false,
		isLoadingSaveDelete: false,
		showExtendedButtons: false,
		keyBindingsExpanded: false,
		advancedSettingsExpanded: false,
	};

	render() {
		const {
			language,
			setLanguage,
			chatSpeed,
			setChatSpeed,
			crtFilter,
			setCrtFilter,
			open,
			keyBindings,
			advancedSettings,
		} = this.props;
		const {
			areYouSureRestore,
			areYouSureDelete,
			isLoadingSaveBackup,
			isLoadingSaveRestore,
			isLoadingSaveDelete,
			showExtendedButtons,
			keyBindingsExpanded,
			advancedSettingsExpanded,
		} = this.state;

		return (
			<Modal
				show={open}
				onHide={this._onClose}
				centered
				contentClassName={"crt " + styles.modalContent}
			>
				<Modal.Header>
					<Modal.Title>⚙️ {locales.get("settings")}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group>
							<Form.Label>🗣️ {locales.get("language")}</Form.Label>
							<div className={styles.options}>
								{LANGUAGES.map((it) => (
									<div key={`language-${it}`}>
										<Form.Check
											type="radio"
											id={`language-${it}`}
											label={locales.get(`language_${it}`)}
											checked={it === language}
											onChange={() => {
												setLanguage(it);
											}}
										/>
									</div>
								))}
							</div>
						</Form.Group>
						<Form.Group style={{ marginTop: MARGIN }}>
							<Form.Label>💨 {locales.get("chat_speed")}</Form.Label>
							<div className={styles.options}>
								<div>
									<Form.Check
										type="radio"
										id="chatSpeed-slow"
										label={locales.get("chat_speed_slow")}
										checked={chatSpeed === "slow"}
										onChange={() => {
											setChatSpeed("slow");
										}}
									/>
								</div>
								<div>
									<Form.Check
										type="radio"
										id="chatSpeed-medium"
										label={locales.get("chat_speed_medium")}
										checked={chatSpeed === "medium"}
										onChange={() => {
											setChatSpeed("medium");
										}}
									/>
								</div>
								<div>
									<Form.Check
										type="radio"
										id="chatSpeed-fast"
										label={locales.get("chat_speed_fast")}
										checked={chatSpeed === "fast"}
										onChange={() => {
											setChatSpeed("fast");
										}}
									/>
								</div>
							</div>
						</Form.Group>
						<Form.Group style={{ marginTop: MARGIN }}>
							<Form.Label>📺 {locales.get("crt_filter")}</Form.Label>
							<div className={styles.options}>
								<div>
									<Form.Check
										type="radio"
										id="crtFilter-no"
										label={locales.get("no")}
										checked={!crtFilter}
										onChange={() => {
											setCrtFilter(false);
										}}
									/>
								</div>
								<div>
									<Form.Check
										type="radio"
										id="crtFilter-yes"
										label={locales.get("yes")}
										checked={crtFilter}
										onChange={() => {
											setCrtFilter(true);
										}}
									/>
								</div>
							</div>
						</Form.Group>
						<Form.Group style={{ marginTop: MARGIN }}>
							<Form.Label className={styles.controlsTitle}>
								<span>🎮 {locales.get("emulator_controls")}</span>
								<IconButton
									Icon={FaUndo}
									tooltip={locales.get("restore_defaults")}
									onClick={() => {
										this.props.setDefaultKeyboardMappings();
									}}
								/>
							</Form.Label>
							{open && (
								<>
									<Form.Check
										type="checkbox"
										id="show-extended-buttons"
										label={locales.get("show_extended_buttons")}
										className={styles.showExtendedButtons}
										checked={showExtendedButtons}
										onChange={(e) => {
											this.setState({
												showExtendedButtons: e.target.checked,
											});
										}}
									/>

									<div className={classNames(styles.options, styles.controls)}>
										<GamepadMapper
											key={`gamepad-1-${showExtendedButtons}`}
											player={1}
											extended={showExtendedButtons}
										/>
										<GamepadMapper
											key={`gamepad-2-${showExtendedButtons}`}
											player={2}
											extended={showExtendedButtons}
										/>
									</div>
								</>
							)}
						</Form.Group>
						<Form.Group style={{ marginTop: MARGIN }}>
							<Form.Label
								className={styles.controlsTitle}
								style={{ cursor: "pointer" }}
								onClick={() =>
									this.setState({
										keyBindingsExpanded: !keyBindingsExpanded,
									})
								}
							>
								<span>
									{keyBindingsExpanded ? "▼" : "►"} ⌨️{" "}
									{locales.get("keyboard_shortcuts")}
								</span>
								<IconButton
									Icon={FaUndo}
									tooltip={locales.get("restore_defaults")}
									onClick={(e) => {
										e.stopPropagation();
										this.props.setDefaultKeyBindings();
									}}
								/>
							</Form.Label>
							{keyBindingsExpanded && open && (
								<KeyMapper
									items={KEY_BINDING_ITEMS()}
									mapping={keyBindings}
									defaultMapping={DEFAULT_KEY_BINDINGS}
									layout="column"
									onChange={(newBindings) => {
										this.props.setKeyBindings(newBindings);
									}}
								/>
							)}
						</Form.Group>
						<Form.Group style={{ marginTop: MARGIN }}>
							<Form.Label
								className={styles.controlsTitle}
								style={{ cursor: "pointer" }}
								onClick={() =>
									this.setState({
										advancedSettingsExpanded: !advancedSettingsExpanded,
									})
								}
							>
								<span>
									{advancedSettingsExpanded ? "▼" : "►"} ⚙️{" "}
									{locales.get("advanced_settings")}
								</span>
								<IconButton
									Icon={FaUndo}
									tooltip={locales.get("restore_defaults")}
									onClick={(e) => {
										e.stopPropagation();
										this.props.setDefaultAdvancedSettings();
									}}
								/>
							</Form.Label>
							{advancedSettingsExpanded && (
								<Form.Control
									as="textarea"
									rows={10}
									value={advancedSettings || DEFAULT_ADVANCED_SETTINGS}
									onChange={(e) => {
										this.props.setAdvancedSettings(e.target.value);
									}}
									style={{ fontFamily: "monospace", fontSize: "small" }}
									spellCheck={false}
								/>
							)}
						</Form.Group>
						<Form.Group style={{ marginTop: MARGIN }}>
							<Form.Label>⏱️ {locales.get("emulator_sync")}</Form.Label>
							<div className={styles.options}>
								<div>
									<Form.Check
										type="radio"
										id="sync-audio"
										label={locales.get("sync_to_audio")}
										checked={!this.props.emulatorSettings.syncToVideo}
										onChange={() => {
											this.props.setEmulatorSettings({
												...this.props.emulatorSettings,
												syncToVideo: false,
											});
										}}
									/>
								</div>
								<div>
									<Form.Check
										type="radio"
										id="sync-video"
										label={locales.get("sync_to_video")}
										checked={this.props.emulatorSettings.syncToVideo}
										onChange={() => {
											this.props.setEmulatorSettings({
												...this.props.emulatorSettings,
												syncToVideo: true,
											});
										}}
									/>
								</div>
							</div>
						</Form.Group>
						<Form.Group style={{ marginTop: MARGIN }}>
							<Form.Label>🧰 {locales.get("buffer_size")}</Form.Label>
							<div className={styles.options}>
								{[1024, 2048, 4096, 8192].map((size) => (
									<div key={`buf-${size}`}>
										<Form.Check
											type="radio"
											id={`buffer-${size}`}
											label={`${size}`}
											checked={
												this.props.emulatorSettings.audioBufferSize === size
											}
											onChange={() => {
												this.props.setEmulatorSettings({
													...this.props.emulatorSettings,
													audioBufferSize: size,
												});
											}}
										/>
									</div>
								))}
							</div>
						</Form.Group>
						<Form.Group style={{ marginTop: MARGIN }}>
							<Form.Label>🗂️ {locales.get("save_file")}</Form.Label>
							<div className={styles.options}>
								<div>
									<Button
										onClick={this._backupSavefile}
										disabled={isLoadingSaveBackup}
									>
										{isLoadingSaveBackup ? "⌛" : "💾 " + locales.get("backup")}
									</Button>
								</div>
								<div>
									<Button
										onClick={this._restoreSavefile}
										disabled={isLoadingSaveRestore}
									>
										{isLoadingSaveRestore
											? "⌛"
											: (areYouSureRestore ? "❗❗❗ " : "📥 ") +
											  locales.get("restore")}
									</Button>
								</div>
								<div>
									<Button
										onClick={this._deleteSavefile}
										disabled={isLoadingSaveDelete}
										style={{ background: "var(--danger, #ff07005e)" }}
									>
										{isLoadingSaveDelete
											? "⌛"
											: (areYouSureDelete ? "❗❗❗ " : "💥 ") +
											  locales.get("delete")}
									</Button>
								</div>
							</div>
						</Form.Group>
						<Form.Group style={{ marginTop: MARGIN }}>
							<Form.Label>{locales.get("music")}</Form.Label>
							<VolumeSlider disableTooltip />
						</Form.Group>
					</Form>
				</Modal.Body>
			</Modal>
		);
	}

	_reload() {
		window.location.reload();
	}

	_backupSavefile = async (e) => {
		e.preventDefault();

		this.setState({ isLoadingSaveBackup: true });

		try {
			const filename = date.today() + SAVEFILE_EXTENSION;
			await savefile.export(filename);
		} finally {
			this.setState({ isLoadingSaveBackup: false });
		}
	};

	_restoreSavefile = async (e) => {
		e.preventDefault();
		if (!this.state.areYouSureRestore) {
			this.setState({ areYouSureRestore: true });
			return;
		}

		filepicker.open(SAVEFILE_EXTENSION, async (fileContent) => {
			this.setState({ isLoadingSaveRestore: true });

			try {
				try {
					await savefile.check(fileContent);
				} catch (err) {
					toast.error(locales.get("save_file_cannot_be_restored"));
					return;
				}

				try {
					await savefile.clear();
					await savefile.import(fileContent);
				} finally {
					this._reload();
				}
			} finally {
				this.setState({ isLoadingSaveRestore: false });
			}
		});
	};

	_deleteSavefile = async (e) => {
		e.preventDefault();
		if (!this.state.areYouSureDelete) {
			this.setState({ areYouSureDelete: true });
			return;
		}

		this.setState({ isLoadingSaveDelete: true });

		try {
			await savefile.clear();
			this._reload();
		} catch (err) {
			this.setState({ isLoadingSaveDelete: false });
		}
	};

	_onSave = () => {
		this.props.setLanguage(this.state.language);
		this.props.setSettingsOpen(false);
	};

	_onClose = () => {
		this.setState({
			areYouSureRestore: false,
			areYouSureDelete: false,
			showExtendedButtons: false,
			keyBindingsExpanded: false,
			advancedSettingsExpanded: false,
		});
		this.props.setSettingsOpen(false);
	};
}

const mapStateToProps = ({ savedata }) => ({
	language: savedata.language,
	chatSpeed: savedata.chatSpeed,
	crtFilter: savedata.crtFilter,
	emulatorSettings: savedata.emulatorSettings,
	keyBindings: savedata.keyBindings,
	advancedSettings: savedata.advancedSettings,
});
const mapDispatchToProps = ({ savedata }) => ({
	setLanguage: savedata.setLanguage,
	setChatSpeed: savedata.setChatSpeed,
	setCrtFilter: savedata.setCrtFilter,
	setEmulatorSettings: savedata.setEmulatorSettings,
	setDefaultKeyboardMappings: savedata.setDefaultKeyboardMappings,
	setKeyBindings: savedata.setKeyBindings,
	setDefaultKeyBindings: savedata.setDefaultKeyBindings,
	setAdvancedSettings: savedata.setAdvancedSettings,
	setDefaultAdvancedSettings: savedata.setDefaultAdvancedSettings,
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsModal);
