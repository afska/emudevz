import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import locales from "../../../locales";
import ValueSlider from "./ValueSlider";
import styles from "./ImageDiffModal.module.css";

// HACK: Monkey-patching React to have PropTypes (`react-image-diff` is very old and needs this)
React.PropTypes = PropTypes;
const ImageDiff = require("react-image-diff");
React.PropTypes = undefined;

const DIFF_MODES = ["fade", "swipe", "difference"];
const MARGIN = 16;

export default class ImageDiffModal extends PureComponent {
	state = {
		diffMode: "swipe",
		fader: 0.5,
	};

	componentDidMount() {
		this.reset();
	}

	reset() {
		this.setState({ diffMode: "swipe", fader: 0.5 });
	}

	render() {
		const { imageUrls } = this.props;
		const { diffMode, fader } = this.state;

		const isOpen = imageUrls != null;
		const isDifference = diffMode === "difference";

		return (
			<Modal
				show={isOpen}
				onHide={this._onClose}
				centered
				contentClassName={"crt " + styles.modalContent}
			>
				<Modal.Header>
					<Modal.Title>🔍 {locales.get("check_diffs")}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group>
							<Form.Label>{locales.get("check_diffs_mode")}</Form.Label>
							<div className={styles.options}>
								{DIFF_MODES.map((it) => (
									<div key={`diffmode-${it}`}>
										<Form.Check
											type="radio"
											id={`diffmode-${it}`}
											label={locales.get(`check_diffs_mode_${it}`)}
											checked={it === diffMode}
											onChange={() => {
												this.setState({ diffMode: it });
											}}
										/>
									</div>
								))}
							</div>
						</Form.Group>
						<Form.Group style={{ marginTop: MARGIN }}>
							{diffMode !== "difference"}
							<ValueSlider
								title={locales.get("check_diffs_balance")}
								value={fader}
								onChange={(e) => {
									this.setState({ fader: e.target.value });
								}}
								disabled={isDifference}
							/>
						</Form.Group>
						<Form.Group
							className={styles.mainDiff}
							style={{ marginTop: MARGIN }}
						>
							{isOpen && (
								<ImageDiff
									before={imageUrls.old}
									after={imageUrls.new}
									type={diffMode}
									value={fader}
								/>
							)}
						</Form.Group>
					</Form>
				</Modal.Body>
			</Modal>
		);
	}

	_onClose = () => {
		this.props.onClose();
		this.reset();
	};
}
