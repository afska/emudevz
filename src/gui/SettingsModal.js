import React, { PureComponent } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { connect } from "react-redux";
import locales, { LANGUAGES } from "../locales";
import Button from "./components/widgets/Button";
import VolumeSlider from "./components/widgets/VolumeSlider";
import styles from "./SettingsModal.module.css";

const MARGIN = 16;
const SAVEFILE_EXTENSION = ".devz";

class SettingsModal extends PureComponent {
	render() {
		const {
			language,
			setLanguage,
			speedUpChat,
			setSpeedUpChat,
			open,
		} = this.props;

		return (
			<Modal
				show={open}
				onHide={this._onClose}
				centered
				contentClassName={"crt " + styles.modalContent}
			>
				<Modal.Header>
					<Modal.Title>{locales.get("settings")}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group>
							<Form.Label>{locales.get("language")}</Form.Label>
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
							<Form.Label>{locales.get("speedUpChat")}</Form.Label>
							<div className={styles.options}>
								<div>
									<Form.Check
										type="radio"
										id="speedUpChat-no"
										label={locales.get("no")}
										checked={!speedUpChat}
										onChange={() => {
											setSpeedUpChat(false);
										}}
									/>
								</div>
								<div>
									<Form.Check
										type="radio"
										id="speedUpChat-yes"
										label={locales.get("yes")}
										checked={speedUpChat}
										onChange={() => {
											setSpeedUpChat(true);
										}}
									/>
								</div>
							</div>
						</Form.Group>
						<Form.Group style={{ marginTop: MARGIN }}>
							<Form.Label>{locales.get("save_file")}</Form.Label>
							<div className={styles.options}>
								<div>
									<Button onClick={this._backupSavefile}>
										💾 {locales.get("backup")}
									</Button>
								</div>
								<div>
									<Button onClick={this._restoreSavefile}>
										📥 {locales.get("restore")}
									</Button>
								</div>
								<div>
									<Button onClick={this._deleteSavefile}>
										🗑️ {locales.get("delete")}
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

	_getSave() {
		const save = {};
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			const value = localStorage.getItem(key);
			save[key] = value;
		}
		return JSON.stringify(save);
	}

	_setSave(save) {
		localStorage.clear();
		const data = JSON.parse(save);
		for (let key in data) {
			const value = data[key];
			localStorage.setItem(key, value);
		}
		this._reload();
	}

	_reload() {
		window.location.reload();
	}

	_backupSavefile = (e) => {
		e.preventDefault();

		const content = this._getSave();
		const filename = new Date().toJSON().split("T")[0] + SAVEFILE_EXTENSION;

		const link = document.createElement("a");
		const file = new Blob([content], { type: "text/plain" });
		link.href = URL.createObjectURL(file);
		link.download = filename;
		link.click();
		URL.revokeObjectURL(link.href);
	};

	_restoreSavefile = (e) => {
		e.preventDefault();

		const handleFileSelect = (event) => {
			event.target.removeEventListener("change", handleFileSelect);
			if (input.files.length === 0) return;

			const file = event.target.files[0];
			const reader = new FileReader();

			reader.onload = (e) => {
				const fileContent = e.target.result;
				this._setSave(fileContent);
			};

			reader.readAsText(file);
		};

		const input = document.createElement("input");
		input.type = "file";
		input.accept = SAVEFILE_EXTENSION;
		input.addEventListener("change", handleFileSelect);
		input.click();
	};

	_deleteSavefile = (e) => {
		e.preventDefault();
		localStorage.clear();
		this._reload();
	};

	_onSave = () => {
		this.props.setLanguage(this.state.language);
		this.props.setSettingsOpen(false);
	};

	_onClose = () => {
		this.props.setSettingsOpen(false);
	};
}

const mapStateToProps = ({ savedata }) => ({
	language: savedata.language,
	speedUpChat: savedata.speedUpChat,
});
const mapDispatchToProps = ({ savedata }) => ({
	setLanguage: savedata.setLanguage,
	setSpeedUpChat: savedata.setSpeedUpChat,
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsModal);
