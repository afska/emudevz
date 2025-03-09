import React, { PureComponent } from "react";
import Modal from "react-bootstrap/Modal";
import _ from "lodash";
import locales from "../../../locales";
import styles from "./ImageDiffModal.module.css";

export default class ImageDiffModal extends PureComponent {
	render() {
		const { imageUrls, onClose } = this.props;

		const isOpen = imageUrls != null;

		return (
			<Modal
				show={isOpen}
				onHide={onClose}
				centered
				contentClassName={"crt " + styles.modalContent}
			>
				<Modal.Header>
					<Modal.Title>🔍 {locales.get("check_diffs")}</Modal.Title>
				</Modal.Header>
				<Modal.Body>{imageUrls?.new}</Modal.Body>
			</Modal>
		);
	}
}
