const fs = require("fs");

function readText(filePath) {
	return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, text) {
	fs.writeFileSync(filePath, text);
}

function isWhitespace(ch) {
	return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

function readStringLiteral(text, startIdx) {
	const quote = text[startIdx];
	let i = startIdx + 1;
	while (i < text.length) {
		const ch = text[i];
		if (ch === "\\") {
			i += 2;
			continue;
		}
		if (ch === quote) {
			return i + 1;
		}
		i++;
	}
	return i;
}

function skipLineComment(text, startIdx) {
	let i = startIdx + 2;
	while (i < text.length && text[i] !== "\n") i++;
	return i;
}

function skipBlockComment(text, startIdx) {
	let i = startIdx + 2;
	while (i < text.length - 1) {
		if (text[i] === "*" && text[i + 1] === "/") return i + 2;
		i++;
	}
	return i;
}

function findMatchingBrace(text, openIdx) {
	let i = openIdx;
	let depth = 0;
	while (i < text.length) {
		const ch = text[i];
		const next = text[i + 1];
		if (ch === '"' || ch === "'" || ch === "`") {
			i = readStringLiteral(text, i);
			continue;
		}
		if (ch === "/" && next === "/") {
			i = skipLineComment(text, i);
			continue;
		}
		if (ch === "/" && next === "*") {
			i = skipBlockComment(text, i);
			continue;
		}
		if (ch === "{") {
			depth++;
		} else if (ch === "}") {
			depth--;
			if (depth === 0) return i;
		}
		i++;
	}
	return -1;
}

function findBlockByPropertyKey(text, propertyName) {
	const re = new RegExp(propertyName + "\\s*:\\s*\\{", "m");
	const match = re.exec(text);
	if (!match) return null;
	const openIdx = match.index + match[0].length - 1; // position of '{'
	const closeIdx = findMatchingBrace(text, openIdx);
	return { openIdx, closeIdx };
}

function findExportDefaultBlock(text) {
	const re = /export\s+default\s*\{/m;
	const match = re.exec(text);
	if (!match) return null;
	const openIdx = match.index + match[0].length - 1; // position of '{'
	const closeIdx = findMatchingBrace(text, openIdx);
	return { openIdx, closeIdx };
}

function findEndOfValue(innerText, startIdx) {
	let i = startIdx;
	let depthBrace = 0;
	let depthBracket = 0;
	let depthParen = 0;
	let inString = false;
	let quote = "";
	while (i < innerText.length) {
		const ch = innerText[i];
		const next = innerText[i + 1];
		if (inString) {
			if (ch === "\\") {
				i += 2;
				continue;
			}
			if (ch === quote) {
				inString = false;
				quote = "";
			}
			i++;
			continue;
		}
		if (ch === '"' || ch === "'" || ch === "`") {
			inString = true;
			quote = ch;
			i++;
			continue;
		}
		if (ch === "/" && next === "/") {
			i = skipLineComment(innerText, i);
			continue;
		}
		if (ch === "/" && next === "*") {
			i = skipBlockComment(innerText, i);
			continue;
		}
		if (ch === "{") depthBrace++;
		else if (ch === "}") depthBrace--;
		else if (ch === "[") depthBracket++;
		else if (ch === "]") depthBracket--;
		else if (ch === "(") depthParen++;
		else if (ch === ")") depthParen--;
		else if (
			ch === "," &&
			depthBrace === 0 &&
			depthBracket === 0 &&
			depthParen === 0
		) {
			return i; // position of comma
		}
		i++;
	}
	return i; // end of innerText
}

function parseTopLevelProperties(innerText) {
	let i = 0;
	const props = [];
	while (i < innerText.length) {
		// capture leading whitespace before a property
		const wsStart = i;
		while (i < innerText.length && isWhitespace(innerText[i])) i++;
		const leading = innerText.slice(wsStart, i);
		if (i >= innerText.length) {
			return { props, tail: leading };
		}
		// if only whitespace remains, that's the tail
		let lookahead = i;
		while (lookahead < innerText.length && isWhitespace(innerText[lookahead]))
			lookahead++;
		if (lookahead >= innerText.length) {
			return { props, tail: innerText.slice(wsStart) };
		}

		// detect end of object (defensive)
		if (innerText[i] === "}") {
			return { props, tail: innerText.slice(wsStart) };
		}

		// parse key
		const keyStart = i;
		let keyEnd = i;
		let keyRaw = "";
		let keyNormalized = "";
		if (innerText[i] === '"' || innerText[i] === "'" || innerText[i] === "`") {
			keyEnd = readStringLiteral(innerText, i);
			keyRaw = innerText.slice(i, keyEnd);
			try {
				keyNormalized = JSON.parse(
					keyRaw[0] === "`"
						? '"' + keyRaw.slice(1, -1).replace(/\\"/g, '"') + '"'
						: keyRaw
				);
			} catch (_) {
				keyNormalized = keyRaw.slice(1, -1);
			}
			i = keyEnd;
		} else {
			// identifier key until ':'
			while (i < innerText.length && innerText[i] !== ":") i++;
			keyEnd = i;
			keyRaw = innerText.slice(keyStart, keyEnd);
			keyNormalized = keyRaw.trim();
		}

		// expect ':'
		if (innerText[i] !== ":") {
			// malformed, bail out keeping the rest as tail
			return { props, tail: innerText.slice(wsStart) };
		}
		i++; // skip ':'
		while (i < innerText.length && isWhitespace(innerText[i])) i++;

		// parse value and capture up to next comma at depth 0
		let endAfter;
		if (innerText[i] === "{") {
			const valueClose = findMatchingBrace(innerText, i);
			if (valueClose < 0) {
				return { props, tail: innerText.slice(wsStart) };
			}
			endAfter = valueClose + 1;
		} else {
			const endPos = findEndOfValue(innerText, i);
			endAfter = endPos;
		}
		// check optional trailing comma after property
		const hadComma = innerText[endAfter] === ",";
		const endNoComma = endAfter;
		if (hadComma) endAfter++;
		const propTextNoComma = innerText.slice(keyStart, endNoComma);
		props.push({
			leading,
			key: keyNormalized,
			textNoComma: propTextNoComma,
			hadComma,
		});
		i = endAfter;
	}
	return { props, tail: "" };
}

function sortPropsByKey(props) {
	const collator = new Intl.Collator("en", {
		sensitivity: "base",
		numeric: false,
	});
	return props
		.map((p, idx) => ({ ...p, __i: idx }))
		.sort((a, b) => {
			const c = collator.compare(a.key, b.key);
			return c !== 0 ? c : a.__i - b.__i;
		})
		.map(({ __i, ...rest }) => rest);
}

function sortObjectLiteralInText(fullText, openIdx, closeIdx) {
	const before = fullText.slice(0, openIdx + 1);
	const inner = fullText.slice(openIdx + 1, closeIdx);
	const after = fullText.slice(closeIdx);
	const { props, tail } = parseTopLevelProperties(inner);
	const sorted = sortPropsByKey(props);
	const originalJoined =
		props
			.map((p) => p.leading + p.textNoComma + (p.hadComma ? "," : ""))
			.join("") + tail;
	// always include a comma between properties to keep syntax valid
	const sortedJoined =
		sorted.map((p) => p.leading + p.textNoComma + ",").join("") + tail;
	const changed = originalJoined !== sortedJoined;
	return { text: before + sortedJoined + after, count: props.length, changed };
}

function sortFileByPropertyObject(filePath, propertyName) {
	const text = readText(filePath);
	const block = findBlockByPropertyKey(text, propertyName);
	if (!block)
		throw new Error(`Cannot find property "${propertyName}" in ${filePath}`);
	const { text: newText, count, changed } = sortObjectLiteralInText(
		text,
		block.openIdx,
		block.closeIdx
	);
	if (changed) writeText(filePath, newText);
	return { count, changed };
}

function sortFileByExportDefaultObject(filePath) {
	const text = readText(filePath);
	const block = findExportDefaultBlock(text);
	if (!block)
		throw new Error(`Cannot find export default object in ${filePath}`);
	const { text: newText, count, changed } = sortObjectLiteralInText(
		text,
		block.openIdx,
		block.closeIdx
	);
	if (changed) writeText(filePath, newText);
	return { count, changed };
}

module.exports = {
	sortFileByPropertyObject,
	sortFileByExportDefaultObject,
};
