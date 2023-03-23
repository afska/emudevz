import chai from "chai";
import _ from "lodash";

function isClass(v) {
	return typeof v === "function" && /^\s*class\s+/.test(v.toString());
}

chai.Assertion.addProperty("class", function () {
	const obj = this._obj;

	this.assert(
		isClass(obj),
		"expected #{this} to be a class",
		"expected #{this} to not be a class",
		"class", // expected
		typeof obj // actual
	);
});

chai.Assertion.addChainableMethod("equalN", function (expected, name) {
	const actual = this._obj;

	this.assert(
		actual === expected,
		`expected ${name} to equal ${expected}, but got ${actual}`,
		`expected ${name} not to equal ${expected}`
	);
});

const toHex = (x) => (_.isFinite(x) ? `0x${x.toString(16).toUpperCase()}` : x);
chai.Assertion.addChainableMethod("equalHex", function (expected, name) {
	const actual = this._obj;

	this.assert(
		actual === expected,
		`expected ${name} to equal ${toHex(expected)}, but got ${toHex(actual)}`,
		`expected ${name} not to equal ${toHex(expected)}`
	);
});

const toBin = (x) =>
	_.isFinite(x) ? `0b${x.toString(2).padStart(8, "0")}` : x;
chai.Assertion.addChainableMethod("equalBin", function (expected, name) {
	const actual = this._obj;

	this.assert(
		actual === expected,
		`expected ${name} to equal ${toBin(expected)}, but got ${toBin(actual)}`,
		`expected ${name} not to equal ${toBin(expected)}`
	);
});

export default chai;
