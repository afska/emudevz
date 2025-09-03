import Layout from "./Layout";
import styles from "./Layout.module.css";

export default class MonoLayout extends Layout {
	static get requiredComponentNames() {
		return ["Main"];
	}

	render() {
		this.requireComponents();
		const { Main } = this.props;

		return (
			<div className={styles.container}>
				<Main
					ref={(ref) => {
						this.instances.Main = ref;
					}}
				/>
			</div>
		);
	}
}
