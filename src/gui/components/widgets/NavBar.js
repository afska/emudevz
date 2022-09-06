import React, { PureComponent } from "react";
import ProgressList from "./ProgressList";
import IconButton from "./IconButton";
import { FaChevronLeft } from "react-icons/fa";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import locales from "../../../locales";
import classNames from "classnames";
import styles from "./NavBar.module.css";

class NavBar extends PureComponent {
	render() {
		const { maxLevelId, chapter, goBack } = this.props;

		return (
			<div className={styles.navbar}>
				<div className={classNames(styles.item, styles.text)}>
					<IconButton
						Icon={FaChevronLeft}
						tooltip={locales.get("goBack")}
						onClick={goBack}
					/>
					<span>{chapter.name[locales.language]}</span>
				</div>
				<div className={styles.item}>
					<ProgressList maxLevelId={maxLevelId} levels={chapter.levels} />
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => ({
	goBack() {
		dispatch(push("/"));
	},
});

export default connect(undefined, mapDispatchToProps)(NavBar);
