import React, { useEffect, useRef } from "react";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import locales from "../../../locales";
import styles from "./FileSearch.module.css";

export default function FileSearch(props) {
	const { isSearching, onBlur, className, ...rest } = props;

	const inputRef = useRef(null);
	useEffect(() => {
		if (isSearching) inputRef.current.focus();
	}, [isSearching]);

	const render = () => {
		return (
			<div className={classNames(styles.container, className)} {...rest}>
				<Form.Control
					placeholder={locales.get("enter_a_file_name")}
					spellCheck={false}
					className={styles.input}
					onBlur={onBlur}
					onKeyDown={onKeyDown}
					ref={inputRef}
				/>

				<div className={styles.results}>
					<div className={styles.result}>CPU.js</div>
					<div className={classNames(styles.result, styles.selected)}>
						C<span className={styles.highlight}>artr</span>idge.js
					</div>
					<div className={styles.result}>
						cpu/instructions/b<span className={styles.highlight}>ranch</span>
						ing.js
					</div>
					<div className={styles.result}>ppu/sprites/oam.js</div>
				</div>
			</div>
		);
	};

	const onKeyDown = (e) => {
		const isEsc = e.code === "Escape";

		if (isEsc) {
			e.preventDefault();
			if (onBlur) onBlur();
			return;
		}
	};

	if (!isSearching) return false;
	return render();
}
