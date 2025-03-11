import React, { PureComponent } from "react";
import Modal from "react-bootstrap/Modal";
import { connect } from "react-redux";
import classNames from "classnames";
import Level from "../../../level/Level";
import locales from "../../../locales";
import Button from "./Button";
import styles from "./LevelHistoryModal.module.css";

class LevelHistoryModal extends PureComponent {
	render() {
		const { open, book, completedLevels, goTo } = this.props;

		return (
			<Modal
				show={open}
				onHide={this._onClose}
				centered
				contentClassName={"crt " + styles.modalContent}
			>
				<Modal.Header>
					<Modal.Title>🕒 {locales.get("level_history")}</Modal.Title>
				</Modal.Header>
				<Modal.Body className={styles.modalBody}>
					{completedLevels
						.slice()
						.reverse()
						.map(({ levelId, date }, i) => {
							const chapter = book.getChapterOf(levelId);
							if (!chapter) return false;
							const levelDefinition = book.getLevelDefinitionOf(levelId);
							const isCurrent = levelDefinition.id === Level.current.id;

							return (
								<div key={i}>
									<Button
										className={classNames(
											styles.level,
											isCurrent && styles.current
										)}
										onClick={() => goTo(levelId)}
									>
										<div>
											<span className={styles.chapter}>
												{chapter.name[locales.language]}
											</span>
											<span className={styles.levelName}>
												{levelDefinition.name[locales.language]}
											</span>
										</div>
									</Button>
									<div className={styles.time}>{locales.timeAgo(date)}</div>
								</div>
							);
						})}
				</Modal.Body>
			</Modal>
		);
	}

	_onClose = () => {
		this.props.onClose();
	};
}

const mapStateToProps = ({ book, savedata }) => ({
	book: book.instance,
	completedLevels: savedata.completedLevels,
});

const mapDispatchToProps = ({ level }) => ({
	goTo: level.goTo,
});

export default connect(mapStateToProps, mapDispatchToProps)(LevelHistoryModal);
