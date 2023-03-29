import { PureComponent } from "react";

export default class Layout extends PureComponent {
	instances = {};

	focus(instanceName) {
		const pinLocation = this.constructor.pinLocation;
		if (this.instances.Pin != null && instanceName === pinLocation) {
			this.instances.Pin.focus();
			return;
		}

		this.instances[instanceName].focus();
	}

	requireComponents() {
		this.constructor.requiredComponentNames.forEach((requiredComponentName) => {
			if (this.props[requiredComponentName] == null)
				throw new Error(`Missing required component: ${requiredComponentName}`);
		});
	}
}
