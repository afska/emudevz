import React, { PureComponent } from "react";
import DiffViewer, { DiffMethod } from "react-diff-viewer";
import { FaFastForward } from "react-icons/fa";
import EmulatorBuilder from "../../EmulatorBuilder";
import filesystem from "../../filesystem";
import Level from "../../level/Level";
import locales from "../../locales";
import testContext from "../../terminal/commands/test/context";
import { bus } from "../../utils";
import { NEEESTestLogger } from "../../utils/nes";
import IconButton from "./widgets/IconButton";
import styles from "./NEEESTester.module.css";

const NEEESTEST_PATH = "/roms/test/NEEEStest.neees";
const LOG_PATH = "/roms/test/golden.log";
const NEWLINE = /\n|\r\n|\r/;
const ENTRY_POINT = 0xc000;
const LINES = 6;
const PAGE_BOUNDARY_BUG_LINE = 3348;

export default class NEEESTester extends PureComponent {
	state = {
		_isInitialized: false,
		_error: null,
		logLines: [],
		success: false,
		lastLines: [],
		diffLine: 0,
	};

	async initialize(args, level) {
		this._level = level;

		this.setState({
			_isInitialized: true,
			logLines: filesystem.read(LOG_PATH).split(NEWLINE),
		});
	}

	render() {
		const {
			_isInitialized,
			_error,
			logLines,
			success,
			diffLine,
			lastLines,
		} = this.state;
		if (!_isInitialized) return false;

		const canRun = Level.current.memory.$canRun;

		if (_error || success)
			return (
				<div
					className={styles.topContainer}
					tabIndex={0}
					ref={this._onContainerRef}
				>
					<div className={styles.message}>
						{success ? (
							<span>✔️ Your CPU rocks!</span>
						) : (
							<span
								dangerouslySetInnerHTML={{ __html: "❌ " + this.state._error }}
							/>
						)}
					</div>
				</div>
			);

		return (
			<div
				className={styles.topContainer}
				tabIndex={0}
				ref={this._onContainerRef}
			>
				{lastLines.length === 0 && (
					<div className={styles.message}>
						<span>👹👹👹</span>
					</div>
				)}

				<div className={styles.container}>
					{!success && (
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
					{lastLines.length > 0 && (
						<>
							<div className={styles.titles}>
								<div className={styles.title}>
									{locales.get("your_emulator")}
								</div>
								<div className={styles.title}>{locales.get("golden_log")}</div>
							</div>
							<DiffViewer
								oldValue={lastLines.join("\n")}
								newValue={logLines.slice(0, diffLine).slice(-LINES).join("\n")}
								splitView={true}
								useDarkTheme={true}
								hideLineNumbers={false}
								linesOffset={diffLine - lastLines.length}
								compareMethod={DiffMethod.WORDS}
							/>
						</>
					)}
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
			const rom = new Uint8Array(
				filesystem.read(NEEESTEST_PATH, { binary: true })
			);
			const NEEES = await new EmulatorBuilder().addUserCPU().build();
			const neees = new NEEES();
			neees.load(rom);
			neees.logger = new NEEESTestLogger();
			neees.cpu.logger = (a, b, c, d, e) => neees.logger.log(a, b, c, d, e);
			neees.cpu.pc.setValue(ENTRY_POINT);
			this._neees = neees;

			this.setState({
				_error: null,
				success: false,
				lastLines: [],
				diffLine: 0,
			});
			return true;
		} catch (e) {
			const message = this._getMessage(e);
			this.setState({ _error: message });
			return false;
		}
	};

	_onRun = async () => {
		if (!this._neees) return;
		if (!(await this._onCode())) return;

		this.setState({ success: false, lastLines: [], diffLine: 0 });

		let line = 0;
		let expected = null;
		let actual = null;

		let lastLines = [];
		while (expected === actual) {
			expected = this.state.logLines[line];
			if (!expected) break;

			try {
				this._neees.cpu.step();
			} catch (e) {
				const message = this._getMessage(e);
				this.setState({ _error: message });
				return;
			}

			actual = this._neees.logger.lastLog;
			lastLines = [...lastLines, actual].slice(-LINES);
			line++;
		}

		if (line === this.state.logLines.length - 1) {
			bus.emit("golden-log-end");

			this.setState({ success: true });
		} else {
			if (line === PAGE_BOUNDARY_BUG_LINE) bus.emit("cpu-bug-page-boundary");
			else bus.emit("cpu-bug-unexpected");

			this.setState({ success: false, diffLine: line, lastLines });
		}
	};

	_onContainerRef = (ref) => {
		this._container = ref;
	};

	_getMessage(e) {
		return testContext.javascript.buildHTMLError(e);
	}
}
