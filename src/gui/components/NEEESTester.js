import React, { PureComponent } from "react";
import DiffViewer, { DiffMethod } from "react-diff-viewer";
import { FaFastForward, FaSpinner } from "react-icons/fa";
import _ from "lodash";
import filesystem, { Drive } from "../../filesystem";
import Level from "../../level/Level";
import locales from "../../locales";
import testContext from "../../terminal/commands/test/context";
import { bus } from "../../utils";
import { NEEESTestLogger } from "../../utils/nes";
import IconButton from "./widgets/IconButton";
import styles from "./NEEESTester.module.css";

const NEEESTEST_PATH = "/roms/test/NEEEStest.neees";
const LOG_PATH = "/roms/test/NEEEStest.log";
const NEWLINE = /\n|\r\n|\r/;
const ENTRY_POINT = 0xc000;

const javascript = testContext.javascript;

export default class NEEESTester extends PureComponent {
	state = {
		_isInitialized: false,
		_error: null,
		logLines: [],
		line: 0,
		isRunning: false,
	};

	async initialize(args, level) {
		this._level = level;

		this.setState({
			_isInitialized: true,
			logLines: filesystem.read(LOG_PATH).split(NEWLINE).slice(1),
		});
	}

	render() {
		const { _isInitialized, _error, line, isRunning } = this.state;
		if (!_isInitialized) return false;

		const canRun = Level.current.memory.$canRun;

		if (_error)
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
					{isRunning && (
						<div className={styles.spinner}>
							<FaSpinner size={24} />
						</div>
					)}
					{!isRunning && (
						<div className={styles.debugger}>
							<IconButton
								Icon={FaFastForward}
								tooltip={locales.get("find_errors")}
								onClick={this._onRun}
								disabled={!canRun}
								kind="rounded"
							/>
						</div>
					)}
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
			"level-memory-changed": () => this.forceUpdate(),
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	focus = () => {
		this._container.focus();
	};

	_onCode = async () => {
		try {
			const $ = javascript.prepare(Level.current);
			const mainModule = await $.evaluate();

			const rom = new Uint8Array(
				filesystem.read(NEEESTEST_PATH, { binary: true })
			);
			const neees = new mainModule.default.NEEES(rom);
			neees.logger = new NEEESTestLogger();
			neees.cpu.logger = (a, b, c, d, e) => neees.logger.log(a, b, c, d, e);
			neees.cpu.pc.setValue(ENTRY_POINT);
			this._neees = neees;

			this.setState({ _error: null });
		} catch (e) {
			this.setState({ _error: e.message });
		}
	};

	_onRun = () => {
		if (!this._neees) return;

		let line = this.state.line;
		let expected = null;
		let actual = null;

		while (expected === actual) {
			try {
				this._neees.cpu.step();
			} catch (e) {
				debugger; // TODO: REMOVE
				this.setState({ _error: e.message, line: 0 });
				return;
			}
			expected = this.state.logLines[line];
			actual = this._neees.logger.lastLog;
			line++;
		}

		this.setState({ line });
	};

	_onContainerRef = (ref) => {
		this._container = ref;
	};
}
