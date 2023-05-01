import { PureComponent } from "react";

export default class Integration extends PureComponent {
	onFrame = () => {
		throw new Error("not_implemented");
	};

	componentDidMount() {
		this._init();
	}

	componentWillUnmount() {
		cancelAnimationFrame(this._frameId);
	}

	_init() {
		const self = this;

		(function loop() {
			self.onFrame();
			self._frameId = requestAnimationFrame(loop);
		})();
	}
}
