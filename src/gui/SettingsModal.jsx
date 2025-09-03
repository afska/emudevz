import React, { PureComponent } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { connect } from "react-redux";
import locales, { LANGUAGES } from "../locales";
import { filepicker, savefile, toast } from "../utils";
import Button from "./components/widgets/Button";
import VolumeSlider from "./components/widgets/VolumeSlider";
import styles from "./SettingsModal.module.css";

const MARGIN = 16;
const SAVEFILE_EXTENSION = ".devz";

class SettingsModal extends PureComponent {
	state = {
		areYouSureRestore: false,
		areYouSureDelete: false,
		isLoadingSaveBackup: false,
		isLoadingSaveRestore: false,
		isLoadingSaveDelete: false,
	};

	render() {
		const {
			language,
			setLanguage,
			speedUpChat,
			setSpeedUpChat,
			open,
		} = this.props;
		const {
			areYouSureRestore,
			areYouSureDelete,
			isLoadingSaveBackup,
			isLoadingSaveRestore,
			isLoadingSaveDelete,
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
							<Form.Label>💨 {locales.get("speed_up_chat")}</Form.Label>
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
										style={{ background: "#ff07005e" }}
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
			const filename = new Date().toJSON().split("T")[0] + SAVEFILE_EXTENSION;
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
				} catch (e) {
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
		} catch (e) {
			this.setState({ isLoadingSaveDelete: false });
		}
	};

	_onSave = () => {
		this.props.setLanguage(this.state.language);
		this.props.setSettingsOpen(false);
	};

	_onClose = () => {
		this.setState({ areYouSureRestore: false, areYouSureDelete: false });
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
