import React, { Component } from "react";
import styles from "./Screen.module.css";

const vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = a_position;
    v_texCoord = a_texCoord;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_time;
  varying vec2 v_texCoord;
  // Parameters for the CRT effect
  const float curvature = 0.2;
  const vec2 resolution = vec2(256.0, 240.0);
  const float scanlineIntensity = 0.1;
  const float flickerIntensity = 0.12;
  vec2 crtCurve(vec2 uv) {
    vec2 scale = vec2(0.90, 0.90);
    uv = uv * 2.0 - 1.0;
    uv *= 1.0 + curvature * uv.y * uv.y;
    uv = (uv + 1.0) / 2.0;
    uv = (uv - 0.5) * scale + 0.5;
    return uv;
  }
  float scanlineEffect(vec2 uv, float time) {
    float scrollSpeed = 5.0;
    float scanline = sin((uv.y * resolution.y - time * scrollSpeed) * 3.14159);
    return mix(1.0, 1.0 - 1.5 * scanlineIntensity, (1.0 + scanline) / 2.0);
  }
  float flickerEffect() {
    return 1.0 - flickerIntensity + (fract(sin(u_time) * 12345.6789) * 2.0 - 1.0) * flickerIntensity;
  }
  void main() {
    vec2 uv = v_texCoord;
    uv = crtCurve(uv);
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      vec4 color = texture2D(u_texture, uv);
      float scanline = scanlineEffect(uv, u_time);
      float flicker = flickerEffect();
      gl_FragColor = color * scanline * flicker;
    }
  }
`;

export default class CRTScreen extends Component {
	render() {
		return (
			<canvas
				className={styles.screen}
				width={256}
				height={240}
				ref={(canvas) => {
					if (canvas) this._initCanvas(canvas);
				}}
			/>
		);
	}

	setBuffer = (buffer) => {
		const rgbaBuffer = new Uint8Array(256 * 240 * 4);

		for (let i = 0; i < buffer.length; i++) {
			rgbaBuffer[i * 4] = buffer[i] & 0xff;
			rgbaBuffer[i * 4 + 1] = (buffer[i] >> 8) & 0xff;
			rgbaBuffer[i * 4 + 2] = (buffer[i] >> 16) & 0xff;
			rgbaBuffer[i * 4 + 3] = 255;
		}

		this.gl.uniform1f(this.uTimeUniformLocation, performance.now() * 0.001);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGBA,
			256,
			240,
			0,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			rgbaBuffer
		);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
	};

	_initCanvas(canvas) {
		// Initialize WebGL
		this.gl = canvas.getContext("webgl");
		if (!this.gl) {
			console.error("WebGL not supported.");
			return;
		}

		// Initialize shaders and program
		const vertexShader = this._createShader(
			this.gl,
			this.gl.VERTEX_SHADER,
			vertexShaderSource
		);
		const fragmentShader = this._createShader(
			this.gl,
			this.gl.FRAGMENT_SHADER,
			fragmentShaderSource
		);
		const program = this._createProgram(this.gl, vertexShader, fragmentShader);

		// Set up vertex buffer
		this.vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array([
				-1,
				-1,
				0,
				1,
				1,
				-1,
				1,
				1,
				-1,
				1,
				0,
				0,
				-1,
				1,
				0,
				0,
				1,
				-1,
				1,
				1,
				1,
				1,
				1,
				0,
			]),
			this.gl.STATIC_DRAW
		);

		this.gl.useProgram(program);
		// Set up attribute pointers
		const positionAttributeLocation = this.gl.getAttribLocation(
			program,
			"a_position"
		);
		const texCoordAttributeLocation = this.gl.getAttribLocation(
			program,
			"a_texCoord"
		);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.vertexAttribPointer(
			positionAttributeLocation,
			2,
			this.gl.FLOAT,
			false,
			4 * 4,
			0
		);
		this.gl.vertexAttribPointer(
			texCoordAttributeLocation,
			2,
			this.gl.FLOAT,
			false,
			4 * 4,
			2 * 4
		);

		this.gl.enableVertexAttribArray(positionAttributeLocation);
		this.gl.enableVertexAttribArray(texCoordAttributeLocation);

		// Create uniform location
		this.uTimeUniformLocation = this.gl.getUniformLocation(program, "u_time");

		// Set up texture
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGBA,
			256,
			240,
			0,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			null
		);

		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_WRAP_S,
			this.gl.CLAMP_TO_EDGE
		);
		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_WRAP_T,
			this.gl.CLAMP_TO_EDGE
		);
		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_MIN_FILTER,
			this.gl.NEAREST
		);
		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_MAG_FILTER,
			this.gl.NEAREST
		);

		this.buffer = new Uint8Array(256 * 240 * 4);
	}

	_createShader(gl, type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) return shader;

		console.error(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}

	_createProgram(gl, vertexShader, fragmentShader) {
		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		const success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (success) return program;

		console.error(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
	}
}
