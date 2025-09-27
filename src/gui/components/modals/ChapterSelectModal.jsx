import React, { PureComponent } from "react";
import Modal from "react-bootstrap/Modal";
import Book from "../../../level/Book";
import locales from "../../../locales";
import { BOOK_PATH } from "../../PlayScreen";
import Chapter from "../widgets/Chapter";
import LetsPlayChapter from "../widgets/LetsPlayChapter";
import styles from "./ChapterSelectModal.module.css";

const STATUS_OK = 200;

export default class ChapterSelectModal extends PureComponent {
	state = { book: null };

	componentDidMount() {
		this._loadBook();
	}

	render() {
		const { open } = this.props;
		const { book } = this.state;

		return (
			<Modal
				show={open}
				size="lg"
				onHide={this._onClose}
				centered
				contentClassName={"crt " + styles.modalContent}
			>
				<Modal.Header>
					<Modal.Title>{locales.get("select_a_chapter")}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{!book && <div>{locales.get("loading")}</div>}
					{book && (
						<div className={styles.floating}>
							<LetsPlayChapter
								book={book}
								chapter={book.getChapter(-1)}
								tabIndex={-1}
							/>
						</div>
					)}
					{book && (
						<div className={styles.levelMap}>
							<Chapter book={book} chapter={book.getChapter(0)} mini />
							<div className={styles.verticalLine} />
							<Chapter book={book} chapter={book.getChapter(1)} optional />
							<div className={styles.verticalLine} />
							<Chapter book={book} chapter={book.getChapter(2)} />
							<div className={styles.verticalLine} />
							<Chapter book={book} chapter={book.getChapter(3)} />
							<div className={styles.verticalLine} />
							<div className={styles.horizontalLine} />
							<div className={styles.chapterRow}>
								{/* <Chapter
									book={book}
									chapter={book.getChapter(7)}
									nested
									right
									optional
									comingSoon
								/> */}
								<Chapter
									book={book}
									chapter={book.getChapter(4)}
									nested
									right
								/>
								<Chapter
									book={book}
									chapter={book.getChapter(5)}
									nested
									left
									right
								/>
								<Chapter book={book} chapter={book.getChapter(6)} nested left />
								{/* <Chapter
									book={book}
									chapter={book.getChapter(8)}
									nested
									left
									optional
									comingSoon
								/> */}
							</div>
							<div className={styles.horizontalLine} />
							<div className={styles.verticalLine} />
							<Chapter book={book} chapter={book.getChapter(8)} comingSoon />
						</div>
					)}
				</Modal.Body>
			</Modal>
		);
	}

	_loadBook() {
		fetch(BOOK_PATH)
			.then((req) => {
				if (req.status !== STATUS_OK) throw new Error("Book not found");
				return req.json();
			})
			.then((book) => {
				this.setState({ book: new Book(book) });
			})
			.catch(this._onClose);
	}

	_onClose = () => {
		this.props.setChapterSelectOpen(false);
	};
}
