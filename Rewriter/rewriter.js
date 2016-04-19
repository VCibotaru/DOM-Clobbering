/**
 * This module contains the rewrite(code) function, that rewrites the code.
 * For a better explanation of what it does, please look at replacer and mocks modules. 
 * @module rewriter
 */
var esprima = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');
var replacers = require('replacer').replacers;

var enter = function(node, parent) {
	if (parent.type === 'AssignmentExpression' && node === parent.left) {
		// never rewrite the left parts of an assignment
		return estraverse.VisitorOption.Skip;
	}
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
