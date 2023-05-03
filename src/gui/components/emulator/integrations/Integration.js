import { PureComponent } from "react";

const TILE_SIZE = 8;

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

	_moveTV(dy) {
		document.querySelector(
			"#tvScreen canvas"
		).style.transform = `translateY(${dy}px)`;
	}

	_disconnectControllers(neees) {
		neees.context.controllers[0].update = () => {};
		neees.context.controllers[1].update = () => {};
	}

	_checkTiles(neees, tiles) {
		let pass = true;
		for (let [x, y, tileId] of tiles)
			pass = pass && this._getTileId(neees, x, y) === tileId;

		return pass;
	}

	_getTileId(neees, x, y) {
		return neees.ppu.nameTable.getTileIdOf(
			neees.ppu.registers.ppuCtrl.patternTableAddressIdForBackground,
			x * TILE_SIZE,
			y * TILE_SIZE
		);
	}
}
