import { PureComponent } from "react";
import _ from "lodash";

export default class Layout extends PureComponent {
	instances = {};

	get isPinOpen() {
		return this.instances.Pin != null;
	}

	get supportsPin() {
		return this.constructor.pinLocation != null;
	}

	get supportsSecondaryPin() {
		return this.constructor.secondaryPinLocation != null;
	}

	focus(instanceName) {
		const pinLocation = this.constructor.pinLocation;
		if (this.isPinOpen && instanceName === pinLocation) {
			this.instances.Pin.focus();
			return;
		}

		const secondaryPinLocation = this.constructor.secondaryPinLocation;
		if (
			this.instances.SecondaryPin != null &&
			instanceName === secondaryPinLocation
		) {
			this.instances.SecondaryPin.focus();
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
			(it) => it?.constructor.id === typeId && condition(it)
		);
	}

	_onPin = (pin) => {
		this._onPinOpened(pin, "Pin", this.constructor.pinLocation);
	};

	_closePin = (options) => {
		this._onPinClosed("Pin", this.constructor.pinLocation, options);
	};

	_onSecondaryPin = (pin) => {
		const location = this.constructor.secondaryPinLocation;

		this._onPinOpened(pin, "SecondaryPin", location);
	};

	_closeSecondaryPin = (options) => {
		this._onPinClosed(
			"SecondaryPin",
			this.constructor.secondaryPinLocation,
			options
		);
	};

	_onPinOpened = (pin, name, pinLocation) => {
		this.setState({ [name]: pin.Component }, () => {
			this.instances[name].initialize(pin.args, pin.level, this);
			setTimeout(() => {
				this.focus(pinLocation);
			});
		});
	};

	_onPinClosed = (name, pinLocation, options = { changeFocus: true }) => {
		this.instances[name] = null;
		this.setState({ [name]: null }, () => {
			if (options?.changeFocus) {
				setTimeout(() => {
					this.focus(pinLocation);
				});
			}
		});
	};
}
