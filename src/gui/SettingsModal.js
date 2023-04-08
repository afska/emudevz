import React, { PureComponent } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { connect } from "react-redux";
import locales, { LANGUAGES } from "../locales";
import VolumeSlider from "./components/widgets/VolumeSlider";
import styles from "./SettingsModal.module.css";

class SettingsModal extends PureComponent {
	render() {
		const { language, setLanguage, open } = this.props;

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
							<div className={styles.language}>
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
						<Form.Group>
							<Form.Label>{locales.get("music")}</Form.Label>
							<VolumeSlider disableTooltip />
						</Form.Group>
						<Form.Label style={{ color: "gray" }}>Save file</Form.Label>
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
});
const mapDispatchToProps = ({ savedata }) => ({
	setLanguage: savedata.setLanguage,
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsModal);
