export default {
	open(extension, onFilePicked, onCancel = () => {}) {
		const handleFileSelect = async (event) => {
			event.target.removeEventListener("change", handleFileSelect);

			if (input.files.length === 0) return onCancel();

			const file = event.target.files[0];
			const fileName = file.name;
			const reader = new FileReader();

			reader.onload = async (e) => {
				const fileContent = e.target.result;
				onFilePicked(fileContent, fileName);
			};

			reader.readAsArrayBuffer(file);
		};

		const input = document.createElement("input");
		input.type = "file";
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
};
