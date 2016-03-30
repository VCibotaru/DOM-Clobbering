/**
 * This module contains mock functions for different operators (e.g. typeof, ===);
 * A mock function is a function that will replace the operator in the rewritten code.
 * For example, we will need a mock to replace the === operator in such way, that
 * it will work correctly for proxy objects.
 * To do so, we will create a function called __triple_equal__(op) that will
 * incapsulate the operator logic.
 * @module mocks
 */

var getWrappedObject = require('proxy').getWrappedObject;
var buildProxy = require('proxy').buildProxy;
var isObjectTainted = require('proxy').isObjectTainted;
var replacerNames = require('replacer').replacerNames;
var isUnaryOperator = require('replacer').isUnaryOperator;
var isBinaryOperator = require('replacer').isBinaryOperator;
var isFunction = require('replacer').isFunction;
var isEqualityOperator = require('replacer').isEqualityOperator;

// this is needed to distinguish mocked functions from the others
// in the debugger's code
var mockFunctionKey = '__is_mock_function__';

/**
 * Builds mocks for unary operators.
 * @function UnaryOperatorMockFactory
 * @param {string} op - String representation of the operator (e.g. '===') 
 * @return - The mock.
 */
var UnaryOperatorMockFactory = function(op) {
	// build new function that incapsulates the operator
	let opFunc = new Function('x', 'return ' + op + ' x;');
	// mark as mocked
	opFunc[mockFunctionKey] = true;
	let resultFunc = function(obj) {
		if (isObjectTainted(obj) === true) {
			obj = getWrappedObject(obj);
			return buildProxy(opFunc(obj), 'new_obj_from_op:_' + op);
		}
		return opFunc(obj);
	};
	// mark as mocked
	resultFunc[mockFunctionKey] = true;
	return resultFunc;
};

/**
 * Builds mocks for binary operators.
 * @function BinaryOperatorMockFactory
 * @param {string} op - String representation of the operator (e.g. '===') 
 * @return - The mock.
 */
var BinaryOperatorMockFactory = function(op) {
	// build new function that incapsulates the operator
	let opFunc = new Function('x', 'y', 'return x ' + op + ' y;');
	// mark as mocked
	opFunc[mockFunctionKey] = true;
	let resultFunc = function(left, right) {
		let l = isObjectTainted(left);
		let r = isObjectTainted(right);
		if (l === true) {
			left = getWrappedObject(left); 
		}
		if (r === true) {
			right = getWrappedObject(right); 
		}
		if (l === true || r === true) {
			return buildProxy(opFunc(left,right), 'new_obj_from_op:' + op); 
		}
		return opFunc(left, right);
	};
	// mark as mocked
	resultFunc[mockFunctionKey] = true;
	return resultFunc;
};

/**
 * Builds mocks for functions
 * @function
 * @param {string} funcName - Name of the function (e.g. 'eval') 
 * @return - The mock.
 */
var FunctionMockFactory = function(funcName) {
	// TODO: now there is only one function to be mocked: eval
	// eval takes one parameter
	// if in future there will be other (non-unary) functions
	// I shall think on how to implement this factory in a better way
	let func = new Function('x', 'return ' + funcName + '(x)');
	let resultFunc = function(obj) {
		if (isObjectTainted(obj) === true) {
			obj = getWrappedObject(obj);
			return buildProxy(func(obj), 'new_obj_from_op:_' + funcName);
		}
		return func(obj);
	};
	return resultFunc;
};
	
/**
 * Build mocks for equality operators.
 * This mocks differ from binary operator mocks because the result is
 * not tainted. @see {@link equalityOperatorNames} for more details.
 * @function EqualityMockFactory
 * @param {string} op - String representation of the operator (e.g. '===') 
 * @return - The mock.
 */
var EqualityOperatorMockFactory = function(op) {
	let opFunc = new Function('x', 'y', 'return x ' + op + ' y;');
	let resultFunc = function(left, right) {
		let l = isObjectTainted(left);
		let r = isObjectTainted(right);
		if (l === true) {
			left = getWrappedObject(left); 
		}
		if (r === true) {
			right = getWrappedObject(right); 
		}
		// The result here is NOT TAINTED!!!
		return opFunc(left, right);
	};
	return resultFunc;
};
/**
 * Builds the mocks and maps them to the given object's namespace.
 * @function
 * @param {Object} obj - The object to which namespace the mocks must be mapped.
 */
var mapMocksToObject = function(obj) {
	let predicates = {
		'unary'    : isUnaryOperator,
		'binary'   : isBinaryOperator,
		'equality' : isEqualityOperator,
		'function' : isFunction,
	};
	let factories = {
		'unary'    : UnaryOperatorMockFactory,
		'binary'   : BinaryOperatorMockFactory,
		'equality' : EqualityOperatorMockFactory,
		'function' : FunctionMockFactory,
	};
	for (let name in replacerNames) {
		let factory;
		// select the needed factory depending on the name type
		for (let type in predicates) {
			if (predicates[type](name) === true) {
				factory = factories[type];
				break;
			}
		}
		if (factory === undefined) {
			throw 'Unknown type in mocks.mapMocksToObject' + name;
		}
		let mock = factory(name);
		obj[replacerNames[name]] = mock;
	}
};

var functionDefToCode = require('misc').functionDefToCode;
var variableDefToCode = require('misc').variableDefToCode;
var importCode = "";

importCode += variableDefToCode(mockFunctionKey, "mockFunctionKey");
var funcImports = [
	"UnaryOperatorMockFactory",
	"BinaryOperatorMockFactory",
	"EqualityOperatorMockFactory",
	"FunctionMockFactory",
	"mapMocksToObject",
];

for (let i of funcImports) {
	importCode += functionDefToCode(this[i], i);
}

// importCode += "mapMocksToObject(this);";

exports.importCode = importCode;
exports.mapMocksToObject = mapMocksToObject;
exports.mockFunctionKey = mockFunctionKey;
