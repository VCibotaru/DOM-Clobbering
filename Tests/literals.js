var TestCase = require('./tests').TestCase;
var proxy = require('proxy');

var booleanLiteralTest = new TestCase(
		'Boolean Literal Test',
		function() {
			var pr = proxy.buildProxy(true, 'base');
			return proxy.isObjectTainted(pr);
		},
		true,	
		proxy.clearTaintedObjects
);


var numberLiteralTest = new TestCase(
		'Number Literal Test',
		function() {
			var pr = proxy.buildProxy(1, 'base');
			return proxy.isObjectTainted(pr);
		},
		true,	
		proxy.clearTaintedObjects
);


var stringLiteralTest = new TestCase(
		'String Literal Test',
		function() {
			var pr = proxy.buildProxy('asd', 'base');
			return proxy.isObjectTainted(pr);
		},
		true,	
		proxy.clearTaintedObjects
);


exports.tests = [booleanLiteralTest, numberLiteralTest, stringLiteralTest];
exports.testSuite = 'Literals tainting test suite';
