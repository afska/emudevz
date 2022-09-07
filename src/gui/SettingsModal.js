import React, { PureComponent } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "./components/widgets/Button";
import locales, { LANGUAGES } from "../locales";
import styles from "./SettingsModal.module.css";

export default class SettingsModal extends PureComponent {
	render() {
		const { open } = this.props;

		return (
			<Modal
				show={open}
				onHide={this.onClose}
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
											checked={language === "en"}
										/>
									</div>
								))}
							</div>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.onClose}>{locales.get("cancel")}</Button>
					<Button onClick={this.onSave} primary>
						{locales.get("save")}
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}

	onSave = () => {
		this.props.setSettingsOpen(false);
	};

	onClose = () => {
		this.props.setSettingsOpen(false);
	};
}
