import React, { PureComponent } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import _ from "lodash";
import locales from "../../../locales";
import styles from "./CalculatorModal.module.css";

export default class CalculatorModal extends PureComponent {
	state = {
		dec: "0",
		hex: "0",
		bin: "0",
	};

	componentDidMount() {
		this.reset();
	}

	reset() {
		this.setState({ dec: "0", hex: "0", bin: "0" });
	}

	render() {
		const { open } = this.props;

		let hasDec = _.isFinite(parseInt(this.state.dec, 10));
		const hasHex = _.isFinite(parseInt(this.state.hex, 16));
		const hasBin = _.isFinite(parseInt(this.state.bin, 2));
		if (!hasDec && !hasHex & !hasBin) hasDec = true;

		return (
			<Modal
				show={open}
				onHide={this._onClose}
				centered
				contentClassName={"crt " + styles.modalContent}
			>
				<Modal.Header>
					<Modal.Title>📟 {locales.get("calculator")}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group>
							<Form.Label>{locales.get("decimal")}</Form.Label>
							{hasDec && (
								<Form.Control
									autoFocus
									value={this.state.dec}
									onChange={(e) => {
										const value = e.target.value.replace(/[^0123456789]/g, "");

										this.setState({
											dec: this._convert(value, 10, 10),
											hex: this._convert(value, 10, 16),
											bin: this._convert(value, 10, 2),
										});
									}}
								/>
							)}
							{!hasDec && <div>⚠️</div>}
						</Form.Group>
						<Form.Group style={{ marginTop: 8 }}>
							<Form.Label>{locales.get("hexadecimal")}</Form.Label>
							{hasHex && (
								<Form.Control
									value={this.state.hex}
									onChange={(e) => {
										const value = e.target.value
											.toLowerCase()
											.replace(/[^0123456789abcdef]/g, "");

										this.setState({
											dec: this._convert(value, 16, 10),
											hex: this._convert(value, 16, 16),
											bin: this._convert(value, 16, 2),
										});
									}}
								/>
							)}
							{!hasHex && <div>⚠️</div>}
						</Form.Group>
						<Form.Group style={{ marginTop: 8 }}>
							<Form.Label>{locales.get("binary")}</Form.Label>
							{hasBin && (
								<Form.Control
									value={this.state.bin}
									onChange={(e) => {
										const value = e.target.value.replace(/[^01]/g, "");

										this.setState({
											dec: this._convert(value, 2, 10),
											hex: this._convert(value, 2, 16),
											bin: this._convert(value, 2, 2),
										});
									}}
								/>
							)}
							{!hasBin && <div>⚠️</div>}
						</Form.Group>
					</Form>
				</Modal.Body>
			</Modal>
		);
	}

	_convert = (value, sourceBase, targetBase) => {
		const parsed = parseInt(value, sourceBase);
		if (!_.isFinite(parsed)) return "0";
		return parsed.toString(targetBase);
	};

	_onClose = () => {
		this.props.onClose();
		this.reset();
	};
}
