export default (text) =>
	text.replace(
		/(<a?:.+?:\d{18}>|\p{Extended_Pictographic}(?:\uFE0F|\u200D[\p{Extended_Pictographic}])*)(\s*)/gu,
		(m, emoji, spaces) => emoji + spaces + " "
	);
