import React, { PureComponent } from "react";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import styles from "./FileSearch.module.css";

export default class FileSearch extends PureComponent {
	render() {
		const { className, ...rest } = this.props;

		return (
			<div className={classNames(styles.container, className)} {...rest}>
				<Form.Control
					placeholder="Enter a file name..."
					spellCheck={false}
					className={styles.input}
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
	}
}
