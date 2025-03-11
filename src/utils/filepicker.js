export default {
	open(extension, onFilePicked) {
		const handleFileSelect = async (event) => {
			event.target.removeEventListener("change", handleFileSelect);
			if (input.files.length === 0) return;

			const file = event.target.files[0];
			const reader = new FileReader();

			reader.onload = async (e) => {
				const fileContent = e.target.result;
				onFilePicked(fileContent);
			};

			reader.readAsArrayBuffer(file);
		};

		const input = document.createElement("input");
		input.type = "file";
		input.accept = extension;
		input.addEventListener("change", handleFileSelect);
		input.click();
	},
};
