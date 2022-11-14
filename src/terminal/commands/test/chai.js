import chai from "chai";

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

export default chai;
