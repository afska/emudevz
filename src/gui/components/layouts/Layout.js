import { PureComponent } from "react";
import _ from "lodash";

export default class Layout extends PureComponent {
	instances = {};

	get supportsPin() {
		return this.constructor.pinLocation != null;
	}

	focus(instanceName) {
		const pinLocation = this.constructor.pinLocation;
		if (this.instances.Pin != null && instanceName === pinLocation) {
			this.instances.Pin.focus();
			return;
		}

		this.instances[instanceName].focus();
	}

	getInstanceName(instance) {
		return _.findKey(this.instances, instance);
	}

	requireComponents() {
		this.constructor.requiredComponentNames.forEach((requiredComponentName) => {
			if (this.props[requiredComponentName] == null)
				throw new Error(`Missing required component: ${requiredComponentName}`);
		});
	}

	findInstance(typeId, condition = () => true) {
		const components = _.values(this.instances);
		return components.find(
			(it) => it.constructor.id === typeId && condition(it)
		);
	}
}
