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
		return this._getTileIdOf(
			neees,
			neees.ppu.registers.ppuCtrl.backgroundPatternTableId,
			x * TILE_SIZE,
			y * TILE_SIZE
		);
	}

	_getTileIdOf(neees, nameTableId, x, y) {
		const SCREEN_WIDTH = 256;
		const TILE_LENGTH = 8;
		const NAME_TABLES_START_ADDRESS = 0x2000;
		const NAME_TABLE_TOTAL_TILES_X = SCREEN_WIDTH / TILE_LENGTH;
		const NAME_TABLE_SIZE = 1024;

		const startAddress =
			NAME_TABLES_START_ADDRESS + nameTableId * NAME_TABLE_SIZE;

		const tileX = Math.floor(x / TILE_LENGTH);
		const tileY = Math.floor(y / TILE_LENGTH);
		const tileIndex = tileY * NAME_TABLE_TOTAL_TILES_X + tileX;

		return neees.ppu.memory.read(startAddress + tileIndex);
	}
}
