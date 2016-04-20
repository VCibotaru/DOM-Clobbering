/**
 * This module contains mock functions for different operators (e.g. typeof, ===);
 * A mock function is a function that will replace the operator in the rewritten code.
 * For example, we will need a mock to replace the === operator in such way, that
 * it will work correctly for proxy objects.
 * To do so, we will create a function called __triple_equal__(op) that will
 * incapsulate the operator logic.
 * @module mocks
 */

// var buildProxy = require('proxy').buildProxy;
// var isObjectTainted = require('proxy').isObjectTainted;
// var getTaintedName = require('proxy').getTaintedName;

var getTaintedName = require('tainter').getTaintedName;
var isObjectTainted = require('tainter').isObjectTainted;
var getWrappedObject = require('tainter').getWrappedObject;
var taint = require('tainter').taint;

var replacerNames = require('replacer').replacerNames;
var memberFunctionCallName = require('replacer').memberFunctionCallName;
var isUnaryOperator = require('replacer').isUnaryOperator;
var isBinaryOperator = require('replacer').isBinaryOperator;
var isFunction = require('replacer').isFunction;
var isEqualityOperator = require('replacer').isEqualityOperator;
var isMemberOperator = require('replacer').isMemberOperator;

// this is needed to distinguish mocked functions from the others
// in the debugger's code
var mockFunctionKey = '__is_mock_function__';

var markAsMocked = function(f) {
	f[mockFunctionKey] = true;
};

var isMarkedAsMocked = function(f) {
	return (f[mockFunctionKey] === true);
};

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
	markAsMocked(opFunc);
	let resultFunc = function(obj) {
		if (isObjectTainted(obj) === true) {
			wrappedObj = getWrappedObject(obj);
			let name = op + '(' + getTaintedName(obj) + ')';
			return taint(opFunc(wrappedObj), name);
		}
		return opFunc(obj);
	};
	// mark as mocked
	markAsMocked(resultFunc);
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
	markAsMocked(opFunc);
	let resultFunc = function(left, right) {
		let l = isObjectTainted(left);
		let r = isObjectTainted(right);
		let leftName, rigthName;
		if (l === true) {
			leftName = getTaintedName(left);
			left = getWrappedObject(left); 
		}
		else {
			leftName = 'value(' + left.toString() + ')';
		}
		if (r === true) {
			rightName = getTaintedName(right);
			right = getWrappedObject(right); 
		}
		else {
			rightName = 'value(' + right.toString() + ')';
		}
		if (l === true || r === true) {
			let name = op + '(' + leftName + ',' + rightName + ')';
			return taint(opFunc(left,right), name);
		}
		return opFunc(left, right);
	};
	// mark as mocked
	markAsMocked(resultFunc);
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
	markAsMocked(func);
	let resultFunc = function(obj) {
		if (isObjectTainted(obj) === true) {
			let name = funcName + '(' + getTaintedName(obj) + ')';
			obj = getWrappedObject(obj);
			return taint(func(obj), name);
		}
		return func(obj);
	};
	markAsMocked(resultFunc);
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
	markAsMocked(opFunc);
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
 * Builds mocks for member access operators (. and [])
 * @function MemberOperatorMockFactory
 * @param {string} op - unused, just to conform to MockFactory interface
 * @return - The mock. 
 */
var MemberOperatorMockFactory = function(op) {
	let resultFunc = function(object, property) {
		let val = object[property];
		if (isObjectTainted(object)) {
			if (val !== undefined && val !== null) {
				let newName = `${getTaintedName(object)}.${property}`;
				val = taint(val, newName); 
			}
		}
		return val;
	};
	markAsMocked(resultFunc);
	return resultFunc;
};

/**
 * Builds the mock for member functions calls (e.g. x.f())
 * @function buildMemberFunctionMock
 * @return - The mock.
 */
var buildMemberFunctionMock = function() {
	let func = function(obj, name) {
		let args = Array.from(arguments).slice(2);
		let res = obj[name].apply(obj, args);
		if (isObjectTainted(obj)) {
			// conservative strategy - always taint the result
			res = taint(res);
		}
		return res;
	};
	markAsMocked(func);
	return func;
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
		'member'   : isMemberOperator,
	};
	let factories = {
		'unary'    : UnaryOperatorMockFactory,
		'binary'   : BinaryOperatorMockFactory,
		'equality' : EqualityOperatorMockFactory,
		'function' : FunctionMockFactory,
		'member'   : MemberOperatorMockFactory,
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
	obj[memberFunctionCallName] = buildMemberFunctionMock();
};

var functionDefToCode = require('misc').functionDefToCode;
var variableDefToCode = require('misc').variableDefToCode;
var importCode = "";

importCode += variableDefToCode(mockFunctionKey, "mockFunctionKey");
var funcImports = [
	"markAsMocked",
	"isMarkedAsMocked",
	"UnaryOperatorMockFactory",
	"BinaryOperatorMockFactory",
	"EqualityOperatorMockFactory",
	"FunctionMockFactory",
	"mapMocksToObject",
];

for (let i of funcImports) {
	importCode += functionDefToCode(this[i], i);
}

exports.importCode = importCode;
exports.mapMocksToObject = mapMocksToObject;
exports.markAsMocked = markAsMocked;
exports.isMarkedAsMocked = isMarkedAsMocked;
exports.mockFunctionKey = mockFunctionKey;
