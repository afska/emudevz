import React, { PureComponent } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "./components/widgets/Button";
import styles from "./SettingsModal.module.css";

export default class SettingsModal extends PureComponent {
	render() {
		const { show } = this.props;

		return (
			<Modal
				show={show}
				onHide={this.onClose}
				centered
				contentClassName={styles.modalContent}
			>
				<Modal.Header>
					<Modal.Title>Settings</Modal.Title>
				</Modal.Header>
				<Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.onClose}>Cancel</Button>
					<Button onClick={this.onSave}>Save</Button>
				</Modal.Footer>
			</Modal>
		);
	}

	onShow = () => {
		this.setState({ show: true });
	};

	onSave = () => {
		this.setState({ show: false });
	};

	onClose = () => {
		this.setState({ show: false });
	};
}
