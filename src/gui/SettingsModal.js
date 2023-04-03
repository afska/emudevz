import React, { PureComponent } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { connect } from "react-redux";
import locales, { LANGUAGES } from "../locales";
import Button from "./components/widgets/Button";
import VolumeSlider from "./components/widgets/VolumeSlider";
import styles from "./SettingsModal.module.css";

class SettingsModal extends PureComponent {
	state = { language: "en" };

	componentDidMount() {
		this.reset();
	}

	reset() {
		const { language } = this.props;
		this.setState({ language });
	}

	render() {
		const { open } = this.props;

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
								{LANGUAGES.map((language) => (
									<div key={`language-${language}`}>
										<Form.Check
											type="radio"
											id={`language-${language}`}
											label={locales.get(`language_${language}`)}
											checked={language === this.state.language}
											onChange={() => {
												this.setState({ language });
											}}
										/>
									</div>
								))}
							</div>
						</Form.Group>
						<Form.Group>
							<Form.Label>{locales.get("music")}</Form.Label>
							<VolumeSlider />
						</Form.Group>
						<Form.Label style={{ color: "gray" }}>Save file</Form.Label>
						<div style={{ color: "gray", fontSize: 12, fontStyle: "italic" }}>
							The game's save file is in your LocalStorage. You can make a
							backup using the <b>LocalStorage Manager</b> extension (on
							Chrome).
						</div>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this._onClose}>{locales.get("cancel")}</Button>
					<Button onClick={this._onSave} primary>
						{locales.get("save")}
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}

	_onSave = () => {
		this.props.setLanguage(this.state.language);
		this.props.setSettingsOpen(false);
	};

	_onClose = () => {
		this.props.setSettingsOpen(false);
		this.reset();
	};
}

const mapStateToProps = ({ savedata }) => ({
	language: savedata.language,
});
const mapDispatchToProps = ({ savedata }) => ({
	setLanguage: savedata.setLanguage,
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsModal);
