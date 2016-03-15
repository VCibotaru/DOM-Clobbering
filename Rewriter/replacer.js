/**
 *@module replacer 
 */


var Syntax = {
	Identifier: 'Identifier',
	ExpressionStatement: 'ExpressionStatement',
	CallExpression: 'CallExpression',
	UnaryExpression: 'UnaryExpression',
};

var Operators = {
	typeof: 'typeof'
};

var ReplacerNames = {
	typeof: '__typeof__',
};

/**
 * A class for ast nodes replacement
 * @constructor
 * @param {Function} predicate - The function that will check if the node should be replaced.
 * @param {Function} replace - The function that returns a replaced node.
 * @example
 *  if (replacer.predicate(node)) {
 *      return replacer.replace(node);
 *  }
 */
var Replacer = function(predicate, replace) {
	this.predicate = predicate;
	this.replace = replace;
};

/**
 * Replaces the typeof operator with the {@link ReplacerNames.typeof} function.
 */
var typeofReplacer = new Replacer(
		function(node) {
			return node.type === Syntax.UnaryExpression && node.operator === Operators.typeof;
		},
		function(node) {
			node.type = Syntax.CallExpression; 
			node.callee = {
				type: Syntax.Identifier,
				name: ReplacerNames.typeof 
			};
			node.arguments = [node.argument];
			return node;
		}
);

/** The array containing all replacers*/
exports.replacers = [typeofReplacer];
