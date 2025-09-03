import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import classNames from "classnames";
import locales from "../../../locales";
import ValueSlider from "./ValueSlider";
import styles from "./ImageDiffModal.module.css";

// HACK: Monkey-patching React to have PropTypes (`react-image-diff` is very old and needs this)
const ImageDiff = React.lazy(async () => {
	React.PropTypes = PropTypes;
	const mod = await import("react-image-diff");
	React.PropTypes = undefined;
	return mod;
});

const DIFF_MODES = ["fade", "swipe", "difference"];
const MARGIN = 16;
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const SCALE = 1;

const COLOR_DIFF = "#d9534f";
const COLOR_OK = "#3fb950";

export default class ImageDiffModal extends PureComponent {
	state = {
		diffMode: "swipe",
		fader: 0.5,
		index: 1,
		rendered: null, // { actual, expected }
	};

	componentDidUpdate(prevProps) {
		const openedNow = this.props.sequence != null;
		const openedBefore = prevProps.sequence != null;

		if (
			(openedNow && !openedBefore) ||
			(openedNow && this.props.sequence !== prevProps.sequence)
		)
			this.reset();
	}

	reset() {
		const { sequence } = this.props;

		this._cache?.clear();
		this._prepareTimeline();

		this.setState(
			{
				diffMode: "swipe",
				fader: 0.5,
				index: sequence?.initialIndex ?? 1,
				rendered: null,
			},
			this._renderCurrentIndex
		);
	}

	render() {
		const { sequence } = this.props;
		const { diffMode, fader, index, rendered } = this.state;

		const isOpen = sequence != null;
		const isDifference = diffMode === "difference";

		const isOk =
			this._diffMap && index >= 1 && index <= (sequence?.total || 0)
				? this._diffMap[index - 1]
				: null;
		const labelStyle =
			isOk == null
				? undefined
				: {
						color: isOk ? COLOR_OK : COLOR_DIFF,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
				  };

		return (
			<React.Suspense fallback={<div className="running" />}>
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
							{sequence && (
								<Form.Group>
									<Form.Label style={labelStyle}>
										<span>
											🖼️ {locales.get("check_diffs_frame")} ({index}/
											{sequence.total})
										</span>
										{isOk != null && <span>{isOk ? "✅" : "❌"}</span>}
									</Form.Label>
									<ValueSlider
										title={`${index} / ${sequence.total}`}
										value={index}
										onChange={(e) => {
											const next = Number(e.target.value);
											this.setState({ index: next }, this._renderCurrentIndex);
										}}
										step={1}
										min={1}
										max={sequence.total}
										disableTooltip
										railGradient={this._railGradient}
										hideTrack
									/>
								</Form.Group>
							)}

							<Form.Group style={{ marginTop: MARGIN }}>
								<Form.Label>🔎 {locales.get("check_diffs_mode")}</Form.Label>
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
									step={0.01}
								/>
								<div className={styles.faderDetail}>
									<span className={styles.expected}>
										{locales.get("tests_video_expected_output")}:{" "}
										{((1 - fader) * 100).toFixed(0)}%
									</span>{" "}
									-{" "}
									<span className={styles.actual}>
										{locales.get("tests_video_ppu_output")}:{" "}
										{(fader * 100).toFixed(0)}%
									</span>
								</div>
							</Form.Group>
							<Form.Group
								className={classNames(
									styles.mainDiff,
									isDifference ? styles.smooth : styles.pixelated
								)}
								style={{ marginTop: MARGIN }}
							>
								{isOpen && rendered && (
									<ImageDiff
										/* (used this way so green/red means "correct/incorrect" instead of "new/old") */
										before={rendered.actual}
										after={rendered.expected}
										type={diffMode}
										value={fader}
										width={SCREEN_WIDTH * SCALE}
										height={SCREEN_HEIGHT * SCALE}
									/>
								)}
							</Form.Group>
						</Form>
					</Modal.Body>
				</Modal>
			</React.Suspense>
		);
	}

	_onClose = () => {
		this.props.onClose();
		this.reset();
	};

	_prepareTimeline() {
		const { sequence } = this.props;

		if (!sequence) {
			this._diffMap = null;
			this._railGradient = undefined;
			return;
		}

		this._diffMap = this._computeDiffMap(sequence);
		this._railGradient = this._buildTimelineGradient(
			this._diffMap,
			COLOR_OK,
			COLOR_DIFF
		);
	}

	_computeDiffMap(sequence) {
		const { total, actualFrames, expectedFrames } = sequence;
		const map = new Array(total);

		for (let i = 0; i < total; i++) {
			const a = actualFrames[i];
			const b = expectedFrames[i];
			let equal = true;
			const len = Math.min(a.length, b.length);
			for (let j = 0; j < len; j++) {
				if (a[j] !== b[j]) {
					equal = false;
					break;
				}
			}
			map[i] = equal; // (true = green, false = red)
		}

		return map;
	}

	_buildTimelineGradient(boolMap, green, red) {
		const n = boolMap.length;
		const stops = [];
		let start = 0;
		let current = boolMap[0];

		for (let i = 1; i <= n; i++) {
			if (i === n || boolMap[i] !== current) {
				const from = (start / n) * 100;
				const to = (i / n) * 100;
				const color = current ? green : red;
				stops.push(
					`${color} ${from.toFixed(4)}%`,
					`${color} ${to.toFixed(4)}%`
				);
				start = i;
				current = boolMap[i];
			}
		}

		return `linear-gradient(to right, ${stops.join(", ")})`;
	}

	_renderCurrentIndex = () => {
		const { sequence } = this.props;
		if (!sequence) return;

		const index = Math.min(Math.max(1, this.state.index), sequence.total) - 1;

		this._cache = this._cache || new Map();
		if (this._cache.has(index)) {
			this.setState({ rendered: this._cache.get(index) });
			return;
		}

		const rendered = {
			expected: this._bufferToDataURL(sequence.expectedFrames[index]),
			actual: this._bufferToDataURL(sequence.actualFrames[index]),
		};
		this._cache.set(index, rendered);
		this.setState({ rendered });
	};

	_bufferToDataURL(buffer, w = SCREEN_WIDTH, h = SCREEN_HEIGHT) {
		const canvas = document.createElement("canvas");
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext("2d");
		const data = new Uint8ClampedArray(w * h * 4);
		for (let i = 0, p = 0; i < w * h; i++, p += 4) {
			const c = buffer[i] >>> 0;
			data[p] = c & 0xff;
			data[p + 1] = (c >>> 8) & 0xff;
			data[p + 2] = (c >>> 16) & 0xff;
			data[p + 3] = (c >>> 24) & 0xff;
		}
		const img = new ImageData(data, w, h);
		ctx.putImageData(img, 0, 0);
		return canvas.toDataURL();
	}
}

ImageDiffModal.propTypes = {
	sequence: PropTypes.shape({
		total: PropTypes.number.isRequired,
		initialIndex: PropTypes.number,
		actualFrames: PropTypes.arrayOf(PropTypes.object).isRequired, // Uint32Array
		expectedFrames: PropTypes.arrayOf(PropTypes.object).isRequired, // Uint32Array
	}),
	onClose: PropTypes.func,
};
