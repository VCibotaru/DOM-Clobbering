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

var unaryOperatorNames = {
	'~'     : '__bitwise_not__',
	'!'     : '__logical_not__',
	'typeof': '__typeof__',
	// '+'     : '__unary_plus__',
	// '-'     : '__unary_minus__',
	// '++'    : '__increment__',
	// '--'    : '__decrement__',
};

var binaryOperatorNames = {
	'+'     : '__plus__',
	'-'     : '__minus__',
	'*'     : '__multiply__',
	'/'     : '__divide__',
	'%'     : '__modulus__',
	//TODO: unary plus, unary minus
	'&'     : '__bitwise_and__',
	'|'     : '__bitwise_or__',
	'^'     : '__xor__',
	'>>'    : '__shift_right__',
	'<<'    : '__shift_left__',
	'&&'    : '__logical_and__',
	'||'    : '__logical_or__',
};

/**
 * Equality operators are separated into a distinct group because
 * their results should not be tainted.
 * The logic is the following:
 * consider code:
 * var a = __triple_equal__(proxy(1), proxy(2))
 * if (a) { do_smth;}
 * In this snippet do_smth should not obviously be executed
 * but, if we taint the result of __triple_equal__ operator
 * then a will be equal to BooleanProxy(false) which will be
 * evaluated as true (wtf?!)
 * To avoid  this situations we will not taint the results of equality
 * operators. However, this approach has the downside of not catching
 * all the tainted values.
 * @name equalityOperatorNames
 */
var equalityOperatorNames = {
	'=='    : '__double_equal__',
	'==='   : '__triple_equal__',
	'!='    : '__double_inequal__',
	'!=='   : '__triple_inequal__',
	'>'     : '__greater__',
	'<'     : '__lesser__',
	'>='    : '__greater_equal__',
	'<='    : '__lesser_equal__',
};

var functionNames = {
	'eval' : '__eval__',
};

// shallow copies all the values from src to dst
var copyObject = function(src, dst) {
	for (let pr in src) {
		dst[pr] = src[pr];
	}
};

// replaceNames is a concatenation of operatorNames and funcNames
var replacerNames = {};
copyObject(functionNames, replacerNames);
copyObject(unaryOperatorNames, replacerNames);
copyObject(binaryOperatorNames, replacerNames);
copyObject(equalityOperatorNames, replacerNames);


/**
 * Checks if the operator is unary.
 * @function isUnaryOperator
 * @param {String} op - The string representation of the operator (e.g. '===')
 * @return - True if op is unary, else false
 */
var isUnaryOperator = function(op) {
	return (op in unaryOperatorNames); 
};

/**
 * Checks if the operator is binary.
 * @function isBinaryOperator
 * @param {String} op - The string representation of the operator (e.g. '===')
 * @return - True if op is unary, else false
 */
var isBinaryOperator = function(op) {
	return (op in binaryOperatorNames); 
};

/**
 * Checks if the operator is an equality operator.
 * @function isEqualityOperator.
 * @param {String} op - The string representation of the operator (e.g. '===')
 * @return - True if op is an equality operator, else false
 */
var isEqualityOperator = function(op) {
	return (op in equalityOperatorNames); 
};
/**
 * Checks if the object is a function.
 * @function isFunction
 * @param {String} func - The string representation of the function (e.g. 'eval')
 * @return - True if func is a function, else false
 */
var isFunction = function(func) {
	return (func in functionNames); 
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
 * A factory for creating the unary operators' replacers.
 * @function UnaryOperatorReplacerFactory
 * @param {String} op - The string representation of the operator (e.g. '===')
 * @param {String} opReplacerName - The name of the function that shall replace the operator
 * (e.g. '__triple_equal__')
 * @return - The replacer object
 */
var UnaryOperatorReplacerFactory = function(op, opReplacerName) {
	let replacer = new Replacer(
			function(node) {
				return (node.type === Syntax.UnaryExpression || node.type === Syntax.UpdateExpression) && node.operator === op;
				return (node.type === Syntax.BinaryExpression || node.type === Syntax.LogicalExpression) && node.operator === op;
			},
			function(node) {
				node.type = Syntax.CallExpression;
				node.callee = {
					type:Syntax.Identifier,
					name: opReplacerName
				};
				let args  = [node.argument];
				node.arguments = args;
				return node;
			}
	);
	return replacer;
};

/**
 * A factory for creating the binary operators' replacers.
 * @function BinaryOperatorReplacerFactory
 * @param {String} op - The string representation of the operator (e.g. '===')
 * @param {String} opReplacerName - The name of the function that shall replace the operator
 * (e.g. '__triple_equal__')
 * @return - The replacer object
 */
var BinaryOperatorReplacerFactory = function(op, opReplacerName) {
	let replacer = new Replacer(
			function(node) {
				return (node.type === Syntax.BinaryExpression || node.type === Syntax.LogicalExpression) && node.operator === op;
			},
			function(node) {
				node.type = Syntax.CallExpression;
				node.callee = {
					type:Syntax.Identifier,
					name: opReplacerName
				};
				let args = [node.left, node.right];
				node.arguments = args;
				return node;
			}
	);
	return replacer;
};

/**
 * A factory for creating the functions operators' replacers.
 * @function FunctionReplacerFactory
 * @param {String} func - The functions name (e.g. 'eval')
 * @param {String} funcReplacerName - The name of the function that shall replace func 
 * (e.g. '__eval__')
 * @return - The replacer object
 */
var FunctionReplacerFactory = function(func, funcReplacerName) {
	let replacer = new Replacer(
		function(node) {
			return node.type === Syntax.CallExpression && node.callee.name === func;
		},
		function(node) {
			node.callee.name = funcReplacerName;
			return node;
		}
	);
	return replacer;
};	


// returns all the replacers described in replacerNames
var createAllReplacers = function() {
	let replacers = [];
	let nameTypes = {
		'unary'    : unaryOperatorNames,
		'binary'   : binaryOperatorNames,
		'equality' : equalityOperatorNames,
		'function' : functionNames,
	};
	let factories = {
		'unary'    : UnaryOperatorReplacerFactory,
		'binary'   : BinaryOperatorReplacerFactory,
		// equality operators is created using the same factory as the binary ones
		'equality' : BinaryOperatorReplacerFactory,
		'function' : FunctionReplacerFactory,
	};
	for (let type in nameTypes) {
		// for all types of names (function names, operator names, ...)
		for (let name in nameTypes[type]) {
			// for all names of current type of names
			
			// choose the factory, depending on name type
			let factory = factories[type];
			// create a replacer for current name
			let replacer = factory(name, nameTypes[type][name]);
			// add replacer to all replacers
			replacers.push(replacer);
		}
	}
	
	return replacers;
};

var importCode = "";
var arrayImports = [
	"Syntax",
	"unaryOperatorNames",
	"binaryOperatorNames",
	"equalityOperatorNames",
	"functionNames",
	"replacerNames",
];
var funcImports = [
	"isUnaryOperator",
	"isBinaryOperator",
	"isFunction",
	"isEqualityOperator",
	"Replacer",
	"UnaryOperatorReplacerFactory",
	"BinaryOperatorReplacerFactory",
	"FunctionReplacerFactory",
	"createAllReplacers",
];

var functionDefToCode = require('misc').functionDefToCode;
var variableDefToCode = require('misc').variableDefToCode;

for (let i of arrayImports) {
	importCode += variableDefToCode(this[i], i);
}
for (let i of funcImports) {
	importCode += functionDefToCode(this[i], i);
}
importCode += "var replacers = createAllReplacers();";

/** The array containing all replacers*/
exports.replacers = createAllReplacers();
exports.replacerNames = replacerNames;
exports.isUnaryOperator = isUnaryOperator;
exports.isBinaryOperator = isBinaryOperator;
exports.isFunction = isFunction;
exports.isEqualityOperator = isEqualityOperator;
exports.importCode = importCode;
