import { PureComponent } from "react";

export default class Layout extends PureComponent {
	get isReady() {
		return document.querySelector("body").clientWidth > 0;
	}

	requireComponents() {
		this.constructor.requiredComponentNames.forEach((requiredComponentName) => {
			if (this.props[requiredComponentName] == null)
				throw new Error(`Missing required component: ${requiredComponentName}`);
		});
	}

	componentDidMount() {
		const $interval = setInterval(() => {
			if (this.isReady) {
				clearInterval($interval);

				this.forceUpdate(() => {
					if (this.props.onReady) this._callOnReady();
				});
			}
		}, 1);
	}

	_callOnReady() {}
}
