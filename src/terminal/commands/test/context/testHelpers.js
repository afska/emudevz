import { byte } from "../../../../utils";

function newHeader(prgPages = 1, chrPages = 1, flags6 = 0, flags7 = 0) {
	// prettier-ignore
	return [0x4e, 0x45, 0x53, 0x1a, prgPages, chrPages, flags6, flags7, 0, 0, 0, 0, 0, 0, 0, 0];
}

function newRom(prgBytes = [], header = newHeader()) {
	const prg = prgBytes;
	const chr = [];
	for (let i = prgBytes.length; i < 16384; i++) prg.push(0);
	for (let i = 0; i < 8192; i++) chr.push(byte.random());
	const bytes = new Uint8Array([...header, ...prg, ...chr]);

	return bytes;
}

export default { newHeader, newRom };
