/**
 * This module is created for replacing some prototype methods.
 * For example, in method Array.prototype.indexOf the objects are compared using 
 * the === operator. In our case the objects stored in the array are proxies,
 * so we would rather use the te method for proxy-aware comparison.
 * @module prototypE-rewriter
 */

require('mocks').mapMocksToObject(this);
var replacerNames = require('replacer').replacerNames;
var markAsMocked = require('mocks').markAsMocked;
/**
 * Replaces the Array.prototype.indexOf method. 
 * This is needed to change the way in which the stored objects are compared.
 * We replace the === operator with the te function for 
 * proxy-aware comparison.
 * The polyfill code is taken from here:
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf}.
 * The === operator was replaced with te.
 * @function replaceArrayIndexOf
 */
var replaceArrayIndexOf = function(obj) {
	// replace === with the te mock (te stands for triple equal)
	let te = new Function("x", "y", "return " + replacerNames['==='] + "(x, y)");
	markAsMocked(te);
	let f = function(searchElement, fromIndex) {
		var k;
		if (te(this, null)) {
			throw new TypeError('"this" is null or not defined');
		}
		var o = Object(this);
		var len = o.length >>> 0;
		if (te(len, 0)) {
			return -1;
		}
		var n = +fromIndex || 0;
		if (te(Math.abs(n), Infinity)) {
			n = 0;
		}
		if (n >= len) {
			return -1;
		}
		k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
		while (k < len) {
			if (k in o && (te(o[k], searchElement))) {
				return k;
			}
			k++;
		}
		return -1;
	};
	obj.Array.prototype.indexOf = f;
	
};


var rewritePrototypes = function(obj) {
	funcs = [
		replaceArrayIndexOf,
	];
	for (let func of funcs) {
		func(obj);
	}
};

var importCode = "";
var functionDefToCode = require('misc').functionDefToCode;

var importFuncs = [
	"replaceArrayIndexOf",
	"rewritePrototypes",
];

for (let f of importFuncs) {
	importCode += functionDefToCode(this[f], f);
}


exports.rewritePrototypes = rewritePrototypes;
exports.importCode = importCode;
