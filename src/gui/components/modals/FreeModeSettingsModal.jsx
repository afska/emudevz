import React, { PureComponent } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { connect } from "react-redux";
import locales from "../../../locales";
import { bus } from "../../../utils";
import styles from "./SettingsModal.module.css";

class FreeModeSettings extends PureComponent {
	render() {
		const { open, freeModeSetings } = this.props;
		const { romExtension, screenWidth, screenHeight } = freeModeSetings || {};

		return (
			<Modal
				show={open}
				onHide={this._onClose}
				centered
				contentClassName={"crt " + styles.modalContent}
			>
				<Modal.Header>
					<Modal.Title>⚙️ {locales.get("free_mode_settings")}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group>
							<Form.Label>🕹️ {locales.get("rom_extension")}</Form.Label>
							<Form.Control
								value={romExtension}
								onChange={this._onRomExtensionChange}
							/>
							<Form.Text muted>
								{locales.get("rom_extension_examples")}
							</Form.Text>
						</Form.Group>
						<Form.Group style={{ marginTop: 16 }}>
							<Form.Label>📐 {locales.get("screen_width")}</Form.Label>
							<Form.Control
								type="number"
								min={1}
								max={800}
								value={screenWidth}
								onChange={this._onScreenWidthChange}
							/>
							<Form.Text muted>{locales.get("screen_width_range")}</Form.Text>
						</Form.Group>
						<Form.Group style={{ marginTop: 16 }}>
							<Form.Label>📏 {locales.get("screen_height")}</Form.Label>
							<Form.Control
								type="number"
								min={1}
								max={600}
								value={screenHeight}
								onChange={this._onScreenHeightChange}
							/>
							<Form.Text muted>{locales.get("screen_height_range")}</Form.Text>
						</Form.Group>
					</Form>
				</Modal.Body>
			</Modal>
		);
	}

	_onClose = () => {
		this.props.onClose();
		bus.emit("free-mode-settings-changed");
	};

	_set(values) {
		const newSettings = { ...this.props.freeModeSetings, ...values };
		this.props.setFreeModeSetings(newSettings);
	}

	_onRomExtensionChange = (e) => {
		let value = e.target.value.trim();
		if (value.length > 0 && value[0] !== ".")
			value = "." + value.replace(/^\.+/, "");
		this._set({ romExtension: value });
	};

	_onScreenWidthChange = (e) => {
		const parsedValue = parseInt(e.target.value, 10);
		const clamped = Math.max(
			1,
			Math.min(800, isNaN(parsedValue) ? 1 : parsedValue)
		);
		this._set({ screenWidth: clamped });
	};

	_onScreenHeightChange = (e) => {
		const parsedValue = parseInt(e.target.value, 10);
		const clamped = Math.max(
			1,
			Math.min(600, isNaN(parsedValue) ? 1 : parsedValue)
		);
		this._set({ screenHeight: clamped });
	};
}

const mapStateToProps = ({ savedata }) => ({
	freeModeSetings: savedata.freeModeSetings,
});
const mapDispatchToProps = ({ savedata }) => ({
	setFreeModeSetings: savedata.setFreeModeSetings,
});

export default connect(mapStateToProps, mapDispatchToProps)(FreeModeSettings);
