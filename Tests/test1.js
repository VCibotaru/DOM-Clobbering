var TestCase = require('./tests').TestCase;
var proxy = require('proxy');
var _ = require('underscore');

var proxyCreationTest = new TestCase(
		'Proxy Creation',
		["base"],
		function() {
			var obj = {'foo': 'bar'};
			var pr = proxy.ObjectProxy(obj, 'base');
			return proxy.storage.getTaintedNames();
		},
		function(testResult) {
			return _.isEqual(this.result, testResult);		
		},
		proxy.storage.clearTaintedObjects
);


var tests = [proxyCreationTest];
exports.tests = tests;
exports.testSuite = 'Basic proxy creation';
