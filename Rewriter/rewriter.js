// require('mocks');

var esprima = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');
var replacers = require('replacer').replacers;
var mocks = require('mocks');

var enter = function(node, parent) {
	for (let replacer of replacers) {
		if (replacer.predicate(node) === true) {
			node = replacer.replace(node);
			return node;
		}
	}
	return node;
};


var rewrite = function(code) {
	let ast = esprima.parse(code);
	let newAst = estraverse.replace(ast, {enter:enter});
	let newCode = escodegen.generate(newAst);
	return newCode; 
};

exports.rewrite = rewrite;
