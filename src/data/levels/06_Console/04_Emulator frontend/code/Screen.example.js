import React from "react";

const SCREEN_SIZE = { width: 256, height: 240 };

export default class Screen extends React.Component {
  render() {
    return (
      <canvas
        className="screen"
        width={SCREEN_SIZE.width}
        height={SCREEN_SIZE.height}
        ref={(canvas) => {
          if (canvas) this._initCanvas(canvas);
        }}
      />
    );
  }

  setBuffer = (buffer) => {
    this.buf32.set(buffer);
    this.imageData.data.set(this.buf8);
    this.context.putImageData(this.imageData, 0, 0);
  };

  _initCanvas(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    const { width, height } = SCREEN_SIZE;
    this.imageData = this.context.getImageData(0, 0, width, height);

    // set alpha to opaque
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, width, height);

    // buffer to write on next animation frame
    this.buf = new ArrayBuffer(this.imageData.data.length);

    // get the canvas buffer in 8bit and 32bit
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.buf32 = new Uint32Array(this.buf);
  }
}
