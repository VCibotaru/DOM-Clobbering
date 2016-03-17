/**
 * This module contains replacers for different operators.
 * A replacer is an object designed for replacing some ast nodes
 * with others.
 * We need replacers for code rewriting. The logic is following:
 * For example, we need to modify the logic of === operator. To do so
 * we will replace all of its occurences with our __triple_equal__
 * mock function (look at mocks module).
 * To do it we need to parse the code into an ast, and replace all
 * the nodes that represent the === operator with nodes that represent 
 * a call to the mock function.
 * This is when replacer come to action - they store the info about 
 * what nodes shall be replaced, and how they shall be replaced.
 *@module replacer 
 */


var Syntax = {
	Identifier: 'Identifier',
	ExpressionStatement: 'ExpressionStatement',
	CallExpression: 'CallExpression',
	UnaryExpression: 'UnaryExpression',
	BinaryExpression: 'BinaryExpression',
	LogicalExpression: 'LogicalExpression',
	UpdateExpression: 'UpdateExpression',
};


var replacerNames = {
	'typeof': '__typeof__',
	'=='    : '__double_equal__',
	'==='   : '__triple_equal__',
	'!='    : '__double_inequal__',
	'!=='   : '__triple_inequal__',
	'+'     : '__plus__',
	'-'     : '__minus__',
	'*'     : '__multiply__',
	'/'     : '__divide__',
	'%'     : '__modulus__',
	//TODO: unary plus, unary minus
	'++'    : '__increment__',
	'--'    : '__decrement__',
	'&'     : '__bitwise_and__',
	'|'     : '__bitwise_or__',
	'^'     : '__xor__',
	'~'     : '__bitwise_not__',
	'>>'    : '__shift_right__',
	'<<'    : '__shift_left__',
	'&&'    : '__logical_and__',
	'||'    : '__logical_or__',
	'!'     : '__logical_not__',
	'>'     : '__greater__',
	'<'     : '__lesser__',
	'>='    : '__greater_equal__',
	'<='    : '__lesser_equal__',
};


/**
 * Checks if the operator is unary.
 * @function
 * @param {String} op - The string representation of the operator (e.g. '===')
 * @return - True if op is unary, false if it is binary
 */
var isUnaryOperator = function(op) {
	var unaryOperators = new Set(['typeof', '++', '--', '~', '!']);
	return unaryOperators.has(op);
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
 * A factory for creating the operators' replacers.
 * @function
 * @param {String} op - The string representation of the operator (e.g. '===')
 * @param {String} opReplacerName - The name of the function that shall replace the operator
 * (e.g. '__triple_equal__')
 * @return - The replacer object
 */
var OperationReplacerFactory = function(op, opReplacerName) {
	let replacer = new Replacer(
			function(node) {
				if (isUnaryOperator(op)) {
					return (node.type === Syntax.UnaryExpression || node.type === Syntax.UpdateExpression) && node.operator === op;
				}
				else {
					return (node.type === Syntax.BinaryExpression || node.type === Syntax.LogicalExpression) && node.operator === op;
				}	
			},
			function(node) {
				node.type = Syntax.CallExpression;
				node.callee = {
					type:Syntax.Identifier,
					name: opReplacerName
				};
				let args  = isUnaryOperator(op) ? [node.argument] : [node.left, node.right];
				node.arguments = args;
				return node;
			}
	);
	return replacer;
};

// returns all the replacers described in replacerNames
var createAllReplacers = function() {
	let replacers = [];
	for (let name in replacerNames) {
		let replacer = OperationReplacerFactory(name, replacerNames[name]);
		replacers.push(replacer);

	}
	return replacers;
};

/** The array containing all replacers*/
exports.replacers = createAllReplacers();
exports.replacerNames = replacerNames;
exports.isUnaryOperator = isUnaryOperator;
