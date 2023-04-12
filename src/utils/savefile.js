import JSZip from "jszip";

const DB_NAME = "emudevz";
const INDEXED_DB_FOLDER = "indexeddb";
const LOCALSTORAGE_FILE = "localstorage.json";

export default {
	export: async (fileName) => {
		const db = await openDB();
		const tx = db.transaction(DB_NAME);
		const store = tx.objectStore(DB_NAME);
		const cursor = store.openCursor();

		const zip = new JSZip();

		// LocalStorage
		zip.file(LOCALSTORAGE_FILE, getLocalStorage());

		// IndexedDB
		return new Promise((resolve, reject) => {
			cursor.onsuccess = (event) => {
				const cursor = event.target.result;
				if (cursor) {
					zip.folder(INDEXED_DB_FOLDER).file(cursor.key, cursor.value);
					cursor.continue();
				} else {
					zip
						.generateAsync({ type: "uint8array" })
						.then((content) => {
							saveAs(content, fileName);
							resolve();
						})
						.catch((error) => {
							reject(error);
						});
				}
			};

			cursor.onerror = (error) => {
				reject(error);
			};
		});
	},

	async import(data) {
		const zip = await JSZip.loadAsync(data);

		// LocalStorage
		const save = await zip.file(LOCALSTORAGE_FILE).async("string");
		setLocalStorage(save);

		// IndexedDB
		const db = await openDB();
		const prefix = INDEXED_DB_FOLDER + "/";
		for (let file in zip.files) {
			if (file !== prefix && file.startsWith(prefix)) {
				const key = file.replace(prefix, "");
				const content = await zip.file(file).async("uint8array");
				const tx = db.transaction(DB_NAME, "readwrite");
				const store = tx.objectStore(DB_NAME);
				store.put(content, key);
				await tx.done;
			}
		}
	},

	clear: async () => {
		localStorage.clear();

		const clearObjectStore = (db, objectStoreName) =>
			new Promise((resolve) => {
				const transaction = db.transaction(objectStoreName, "readwrite");
				const objectStore = transaction.objectStore(objectStoreName);
				objectStore.clear();
				transaction.oncomplete = () => resolve();
			});

		const db = await openDB();
		const objectStoreNames = Array.from(db.objectStoreNames);
		await Promise.all(
			objectStoreNames.map((name) => clearObjectStore(db, name))
		);
	},
};

function openDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME);
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function getLocalStorage() {
	const save = {};
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		const value = localStorage.getItem(key);
		save[key] = value;
	}
	return JSON.stringify(save);
}

function setLocalStorage(save) {
	const data = JSON.parse(save);
	for (let key in data) {
		const value = data[key];
		localStorage.setItem(key, value);
	}
}

function saveAs(content, fileName) {
	const blob = new Blob([content], {
		type: "application/octet-stream",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	a.click();
	URL.revokeObjectURL(url);
}
