import React, { PureComponent } from "react";
import { Dropdown, SplitButton } from "react-bootstrap";
import classNames from "classnames";
import locales from "../../../locales";
import styles from "./ToggableButton.module.css";

export default class ToggableButton extends PureComponent {
	render() {
		const {
			options,
			selectedOption,
			onOptionSelect,
			className,
			...rest
		} = this.props;

		const selected =
			options.find((opt) => opt.mode === selectedOption) || options[0];

		const label = locales.get(selected.labelKey);

		return (
			<div className={classNames(styles.toggableButton, className)}>
				<div className={styles.buttonGroup}>
					<SplitButton
						id="toggable-button"
						title={label}
						renderMenuOnMount
						{...rest}
					>
						{options.map((opt, i) => (
							<Dropdown.Item key={i} onClick={() => onOptionSelect(opt)}>
								{locales.get(opt.labelKey)}
							</Dropdown.Item>
						))}
					</SplitButton>
				</div>
			</div>
		);
	}
}
