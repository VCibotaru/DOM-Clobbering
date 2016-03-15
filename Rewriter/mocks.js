/*
 * This module contains mock functions for different operators (e.g. typeof, ===);
 * @module mocks
 */

var proxy = require('proxy');


// a replacer for typeof operator
var __typeof__ = function(obj) {
	if (proxy.isObjectTainted(obj) !== true) {
		return typeof obj;
	}
	else {
		return obj[proxy.proxyTypeofKey];
	}
};

exports.__typeof__ = __typeof__;
