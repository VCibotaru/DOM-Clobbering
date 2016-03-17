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


/**
 * Build mocks for unary operators.
 * @function
 * @param {function} op - A function that incapsulates the operator.
 * @return - The mock.
 */
var UnaryOperationMockFactory = function(op) {
	let resultFunc = function(obj) {
		if (proxy.isObjectTainted(obj) === true) {
			obj = proxy.getWrappedObject(obj);
			// console.log(obj + ' : ' + typeof obj);
			return proxy.buildProxy(op(obj), 'new_obj_from_op:_' + op);
		}
		return op(obj);
	};
	return resultFunc;
};

/**
 * Build mocks for binary operators.
 * @function
 * @param {function} op - A function that incapsulates the operator.
 * @return - The mock.
 */
var BinaryOperationMockFactory = function(op) {
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
			return proxy.buildProxy(op(left,right), 'new_obj_from_op:_' + op); 
		}
		return op(left, right);
	};
	return resultFunc;
};

/**
 * Builds mocks for operators.
 * @function
 * @param {String} opRepr - The string representation of the operator (e.g. '===')
 * @param {Function} opFunc - A function that incapsulates the operator.
 * @return - The mock
 */
var OperationMockFactory = function(opRepr, opFunc) {
	let isUnary = isUnaryOperator(opRepr);
	if (isUnary === true) {
		return UnaryOperationMockFactory(opFunc);
	}
	return BinaryOperationMockFactory(opFunc);
};

/**
 * Builds the mocks and maps them to the given object's namespace.
 * @function
 * @param {Object} obj - The object to which namespace the mocks must be mapped.
 */
var mapMocksToObject = function(obj) {
	for (let op in names) {
		let func;
		if (isUnaryOperator(op) === true) {
			func = new Function('x', 'return ' + op + ' x;');
		}
		else {
			func = new Function('x', 'y', 'return x ' + op + ' y;');
		}
		let mock = OperationMockFactory(op, func);
		obj[names[op]] = mock;
	}
};

exports.mapMocksToObject = mapMocksToObject;
