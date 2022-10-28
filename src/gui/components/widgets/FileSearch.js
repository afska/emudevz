import React, { PureComponent } from "react";
import Form from "react-bootstrap/Form";
import classNames from "classnames";
import styles from "./FileSearch.module.css";

export default class FileSearch extends PureComponent {
	render() {
		const { className, ...rest } = this.props;

		return (
			<div className={classNames(styles.container, className)} {...rest}>
				{/* <input type="text" /> */}
				<Form.Control type="email" placeholder="Enter email" />
			</div>
		);
	}
}
