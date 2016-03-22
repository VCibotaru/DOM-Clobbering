/*
 * This module contains mock functions for different operators (e.g. typeof, ===);
 * A mock function is a function that will replace the operator in the rewritten code.
 * For example, we will need a mock to replace the === operator in such way, that
 * it will work correctly for proxy objects.
 * To do so, we will create a function called __triple_equal__(op) that will
 * incapsulate the operator logic.
 * @module mocks
 */
var proxy = require('proxy');
var names = require('replacer').replacerNames;
var isUnaryOperator = require('replacer').isUnaryOperator;
var isBinaryOperator = require('replacer').isBinaryOperator;
var isFunction = require('replacer').isFunction;

/**
 * Builds mocks for unary operators.
 * @function
 * @param {string} op - String representation of the operator (e.g. '===') 
 * @return - The mock.
 */
var UnaryOperatorMockFactory = function(op) {
	// build new function that incapsulates the operator
	let opFunc = new Function('x', 'return ' + op + ' x;');
	let resultFunc = function(obj) {
		if (proxy.isObjectTainted(obj) === true) {
			obj = proxy.getWrappedObject(obj);
			return proxy.buildProxy(opFunc(obj), 'new_obj_from_op:_' + op);
		}
		return opFunc(obj);
	};
	return resultFunc;
};

/**
 * Builds mocks for binary operators.
 * @function
 * @param {string} op - String representation of the operator (e.g. '===') 
 * @return - The mock.
 */
var BinaryOperatorMockFactory = function(op) {
	// build new function that incapsulates the operator
	let opFunc = new Function('x', 'y', 'return x ' + op + ' y;');
	let resultFunc = function(left, right) {
		let l = proxy.isObjectTainted(left);
		let r = proxy.isObjectTainted(right);
		if (l === true) {
			left = proxy.getWrappedObject(left); 
		}
		if (r === true) {
			right = proxy.getWrappedObject(right); 
		}
		if (l === true || r === true) {
			return proxy.buildProxy(opFunc(left,right), 'new_obj_from_op:_' + op); 
		}
		return opFunc(left, right);
	};
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
		if (proxy.isObjectTainted(obj) === true) {
			obj = proxy.getWrappedObject(obj);
			return proxy.buildProxy(func(obj), 'new_obj_from_op:_' + funcName);
		}
		return func(obj);
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
		'function' : isFunction,
	};
	let factories = {
		'unary'    : UnaryOperatorMockFactory,
		'binary'   : BinaryOperatorMockFactory,
		'function' : FunctionMockFactory,
	};
	for (let name in names) {
		let factory;
		// select the needed factory depending on the name type
		for (let type in predicates) {
			if (predicates[type](name) === true) {
				factory = factories[type];
				break;
			}
		}
		if (factory === undefined) {
			throw 'Unknown type in mocks.mapMocksToObject';
		}
		let mock = factory(name);
		obj[names[name]] = mock;
	}
};

exports.mapMocksToObject = mapMocksToObject;
