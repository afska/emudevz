export default {
	enlargeAndGrid(base64Input, scale = 10) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = img.width * scale;
				canvas.height = img.height * scale;
				const ctx = canvas.getContext("2d");
				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(
					img,
					0,
					0,
					img.width,
					img.height,
					0,
					0,
					canvas.width,
					canvas.height
				);

				ctx.strokeStyle = "#c39f79";
				for (let i = 0; i <= img.width; i++) {
					ctx.beginPath();
					ctx.moveTo(i * scale, 0);
					ctx.lineTo(i * scale, canvas.height);
					ctx.stroke();
				}
				for (let j = 0; j <= img.height; j++) {
					ctx.beginPath();
					ctx.moveTo(0, j * scale);
					ctx.lineTo(canvas.width, j * scale);
					ctx.stroke();
				}

				resolve(canvas.toDataURL("image/png"));
			};
			img.onerror = (err) => reject(err);
			img.src = base64Input;
		});
	},
};
