import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import locales from "../../../locales";
import styles from "./ImageDiffModal.module.css";

// HACK: Monkey-patching React to have PropTypes (`react-image-diff` is very old and needs this)
React.PropTypes = PropTypes;
const ImageDiff = require("react-image-diff");
React.PropTypes = undefined;

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
				<Modal.Body>
					{isOpen && (
						<ImageDiff
							before={imageUrls.old}
							after={imageUrls.new}
							type="difference"
							value={0.5}
						/>
					)}
				</Modal.Body>
			</Modal>
		);
	}
}
