import React, { PureComponent } from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import { ButtonBox, getKeyLabel } from "./KeyMapper";
import styles from "./GamepadMapper.module.css";

class GamepadMapper extends PureComponent {
	state = { waitingKey: null };

	render() {
		const {
			player = 1,
			keyboardMappings,
			setKeyboardMappings,
			className,
			extended = false,
			...rest
		} = this.props;
		const { waitingKey } = this.state;

		if (keyboardMappings == null) return null;

		const mappings = keyboardMappings[player];

		const MappedButtonBox = ({ button, className, children, ...rest }) => {
			const isWaitingKey = waitingKey && waitingKey.button === button;
			const text = isWaitingKey ? "..." : children;

			const keyForThisButton = mappings[button];
			let isDuplicate = false;
			if (keyForThisButton) {
				let count = 0;
				for (let k in mappings) if (mappings[k] === keyForThisButton) count++;
				isDuplicate = count > 1;
			}

			return (
				<ButtonBox
					onClick={() => this._waitForKey(player, button)}
					className={className}
					isDuplicate={isDuplicate}
					{...rest}
				>
					{text}
				</ButtonBox>
			);
		};

		return (
			<div
				className={classNames(styles.gamepad, styles.box, className)}
				{...rest}
			>
				{extended && (
					<div className={styles.lr}>
						<MappedButtonBox
							player={player}
							button="BUTTON_L"
							className={styles.longButton}
						>
							{getKeyLabel(mappings.BUTTON_L)}
						</MappedButtonBox>
						<MappedButtonBox
							player={player}
							button="BUTTON_R"
							className={styles.longButton}
						>
							{getKeyLabel(mappings.BUTTON_R)}
						</MappedButtonBox>
					</div>
				)}

				<div className={styles.mainGamepad}>
					<div className={classNames(styles.box, styles.dpad)}>
						<div />
						<MappedButtonBox player={player} button="BUTTON_UP">
							{getKeyLabel(mappings.BUTTON_UP)}
						</MappedButtonBox>
						<div />
						<MappedButtonBox player={player} button="BUTTON_LEFT">
							{getKeyLabel(mappings.BUTTON_LEFT)}
						</MappedButtonBox>
						<div />
						<MappedButtonBox player={player} button="BUTTON_RIGHT">
							{getKeyLabel(mappings.BUTTON_RIGHT)}
						</MappedButtonBox>
						<div />
						<MappedButtonBox player={player} button="BUTTON_DOWN">
							{getKeyLabel(mappings.BUTTON_DOWN)}
						</MappedButtonBox>
						<div />
					</div>

					<div className={styles.startSelect}>
						<MappedButtonBox
							player={player}
							button="BUTTON_SELECT"
							className={styles.longButton}
						>
							{getKeyLabel(mappings.BUTTON_SELECT)}
						</MappedButtonBox>
						<MappedButtonBox
							player={player}
							button="BUTTON_START"
							className={styles.longButton}
						>
							{getKeyLabel(mappings.BUTTON_START)}
						</MappedButtonBox>
					</div>

					<div className={styles.mainButtons}>
						{extended && (
							<div className={classNames(styles.box, styles.ab)}>
								<MappedButtonBox
									player={player}
									button="BUTTON_Y"
									className={styles.redButton}
								>
									{getKeyLabel(mappings.BUTTON_Y)}
								</MappedButtonBox>
								<MappedButtonBox
									player={player}
									button="BUTTON_X"
									className={styles.redButton}
								>
									{getKeyLabel(mappings.BUTTON_X)}
								</MappedButtonBox>
							</div>
						)}

						<div className={classNames(styles.box, styles.ab)}>
							<MappedButtonBox
								player={player}
								button="BUTTON_B"
								className={styles.redButton}
							>
								{getKeyLabel(mappings.BUTTON_B)}
							</MappedButtonBox>
							<MappedButtonBox
								player={player}
								button="BUTTON_A"
								className={styles.redButton}
							>
								{getKeyLabel(mappings.BUTTON_A)}
							</MappedButtonBox>
						</div>
					</div>
				</div>
			</div>
		);
	}

	componentWillUnmount() {
		if (this._onKey) {
			window.removeEventListener("keydown", this._onKey);
			this._onKey = null;
		}
	}

	_waitForKey = (player, button) => {
		this.setState({ waitingKey: { player, button } });

		if (this._onKey) {
			window.removeEventListener("keydown", this._onKey);
			this._onKey = null;
		}

		const onKey = (e) => {
			e.preventDefault();
			e.stopPropagation();
			window.removeEventListener("keydown", onKey);
			this._onKey = null;

			const { waitingKey } = this.state;
			if (!waitingKey) return;

			const mappings = { ...this.props.keyboardMappings };
			const playerKeys = { ...mappings[waitingKey.player] };
			playerKeys[waitingKey.button] = e.key.toUpperCase();
			mappings[waitingKey.player] = playerKeys;
			this.props.setKeyboardMappings(mappings);
			this.setState({ waitingKey: null });
		};

		this._onKey = onKey;
		window.addEventListener("keydown", this._onKey);
	};
}

const mapStateToProps = ({ savedata }) => ({
	keyboardMappings: savedata.keyboardMappings,
});
const mapDispatchToProps = ({ savedata }) => ({
	setKeyboardMappings: savedata.setKeyboardMappings,
});

export default connect(mapStateToProps, mapDispatchToProps)(GamepadMapper);
