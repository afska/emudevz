import React, { PureComponent } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { connect } from "react-redux";
import locales, { LANGUAGES } from "../locales";
import VolumeSlider from "./components/widgets/VolumeSlider";
import styles from "./SettingsModal.module.css";

const MARGIN = 16;

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
							<Form.Label>{locales.get("music")}</Form.Label>
							<VolumeSlider disableTooltip />
						</Form.Group>
						<Form.Label style={{ color: "gray", marginTop: MARGIN }}>
							Save file
						</Form.Label>
						<div style={{ color: "gray", fontSize: 12, fontStyle: "italic" }}>
							The game's save file is in your LocalStorage. You can make a
							backup using the <b>LocalStorage Manager</b> extension (on
							Chrome).
						</div>
					</Form>
				</Modal.Body>
			</Modal>
		);
	}

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
