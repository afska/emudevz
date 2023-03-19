import React, { PureComponent } from "react";
import DiffViewer, { DiffMethod } from "react-diff-viewer";
import _ from "lodash";
import Level from "../../level/Level";
import testContext from "../../terminal/commands/test/context";
import { bus } from "../../utils";
import styles from "./NEEESTester.module.css";

const javascript = testContext.javascript;

export default class NEEESTester extends PureComponent {
	state = {
		_isInitialized: false,
		_error: null,
	};

	async initialize(args, level) {
		this._level = level;

		this.setState({
			_isInitialized: true,
		});
	}

	render() {
		if (this.state._error)
			return (
				<div
					className={styles.topContainer}
					tabIndex={0}
					ref={this._onContainerRef}
				>
					<div className={styles.message}>
						<span>❌ {this.state._error}</span>
					</div>
				</div>
			);

		return (
			<div
				className={styles.topContainer}
				tabIndex={0}
				ref={this._onContainerRef}
			>
				<div className={styles.container}>
					<div className={styles.titles}>
						<div className={styles.title}>Your emulator</div>
						<div className={styles.title}>Golden log</div>
					</div>
					<DiffViewer
						oldValue={"C000  4C F5 C5  JMP $C5F5                       A:00 X:00 Y:00 P:24 SP:FD CYC:7\nC5F5  A2 00     LDX #$00                        A:00 X:00 Y:00 P:24 SP:FD CYC:10\nC5F7  86 00     STX $00 = 05                    A:00 X:00 Y:00 P:27 SP:FD CYC:12\nC5F9  86 10     STX $10 = 00                    A:00 X:00 Y:00 P:26 SP:FD CYC:15\nC5FB  86 11     STX $11 = 00                    A:00 X:00 Y:00 P:26 SP:FD CYC:18\nC5FD  20 2D C7  JSR $C72D                       A:00 X:00 Y:00 P:26 SP:FD CYC:21\nC72D  EA        NOP                             A:00 X:00 Y:00 P:26 SP:FB CYC:27\nC72E  38        SEC                             A:00 X:00 Y:00 P:26 SP:FB CYC:29\nC72F  B0 04     BCS $C735                       A:00 X:00 Y:00 P:27 SP:FB CYC:31\nC735  EA        NOP                             A:00 X:00 Y:00 P:27 SP:FB CYC:34"
							.split("\n")
							.slice(0, 6)
							.join("\n")}
						newValue={"C000  4C F5 C5  JMP $C5F5                       A:00 X:00 Y:00 P:24 SP:FD CYC:7\nC5F5  A2 00     LDX #$00                        A:00 X:00 Y:00 P:24 SP:FD CYC:10\nC5F7  86 00     STX $00 = 00                    A:00 X:00 Y:00 P:26 SP:FD CYC:12\nC5F9  86 10     STX $10 = 00                    A:00 X:00 Y:00 P:26 SP:FD CYC:15\nC5FB  86 11     STX $11 = 00                    A:00 X:00 Y:00 P:26 SP:FD CYC:18\nC5FD  20 2D C7  JSR $C72D                       A:00 X:00 Y:00 P:26 SP:FD CYC:21\nC72D  EA        NOP                             A:00 X:00 Y:00 P:26 SP:FB CYC:27\nC72E  38        SEC                             A:00 X:00 Y:00 P:26 SP:FB CYC:29\nC72F  B0 04     BCS $C735                       A:00 X:00 Y:00 P:27 SP:FB CYC:31\nC735  EA        NOP                             A:00 X:00 Y:00 P:27 SP:FB CYC:34"
							.split("\n")
							.slice(0, 6)
							.join("\n")}
						splitView={true}
						useDarkTheme={true}
						hideLineNumbers={false}
						linesOffset={0}
						compareMethod={DiffMethod.WORDS}
					/>
				</div>
			</div>
		);
	}

	componentDidMount() {
		this._subscriber = bus.subscribe({
			code: this._onCode,
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	focus = () => {
		this._container.focus();
	};

	_onCode = () => {
		try {
			// const { instructions, cpu } = asm.prepare(Level.current, code).compile();
			// this._cpu = cpu;

			this.setState({ _error: null }, () => {
				setTimeout(() => {
					this._updateState();
				});
			});
			bus.emit("compiled");
		} catch (e) {
			// if (
			// 	e?.message?.startsWith("Parse Error") ||
			// 	e?.message?.startsWith("Assembly Error")
			// ) {
			// 	e.handled = true;
			// 	this.setState({ _error: e.message });
			// }
			// throw e;
		}
	};

	_onStep = () => {
		// TODO: CALL
		this._cpu.step();
		this._updateState();
	};

	_onContainerRef = (ref) => {
		this._container = ref;
	};

	_updateState() {
		if (!this._cpu) return;

		// this.setState({});
	}
}
