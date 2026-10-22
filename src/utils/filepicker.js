export default {
	open(extension, onFilePicked, onCancel = () => {}) {
		const handleFileSelect = async (e) => {
			e.target.removeEventListener("change", handleFileSelect);

			if (input.files.length === 0) return onCancel();

			const file = e.target.files[0];
			const fileContent = await this._readFile(file);
			onFilePicked(fileContent, file.name);
		};

		const input = document.createElement("input");
		input.type = "file";
		if (extension != null) input.accept = extension;
		input.addEventListener("change", handleFileSelect);
		input.addEventListener("cancel", onCancel);
		input.click();
	},
	openMultiple(extension, onFilesPicked, onCancel = () => {}) {
		const handleFileSelect = async (e) => {
			e.target.removeEventListener("change", handleFileSelect);

			if (input.files.length === 0) return onCancel();

			const files = [];
			for (const file of input.files) {
				const fileContent = await this._readFile(file);
				files.push({ content: fileContent, name: file.name });
			}

			onFilesPicked(files);
		};

		const input = document.createElement("input");
		input.type = "file";
		input.multiple = true;
		if (extension != null) input.accept = extension;
		input.addEventListener("change", handleFileSelect);
		input.addEventListener("cancel", onCancel);
		input.click();
	},
	saveAs(content, fileName) {
		const blob = new Blob([content], {
			type: "application/octet-stream",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName;
		a.click();
		URL.revokeObjectURL(url);
	},
	_readFile(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = () => reject(reader.error);
			reader.readAsArrayBuffer(file);
		});
	},
};
