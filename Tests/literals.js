var TestCase = require('./tests').TestCase;
var proxy = require('proxy');

var booleanLiteralTest = new TestCase(
		'Boolean Literal Test',
		function() {
			var pr = proxy.BooleanProxy(true, 'base');
			return proxy.storage.isObjectTainted(pr);
		},
		true,	
		proxy.storage.clearTaintedObjects.bind(proxy.storage)
);


var numberLiteralTest = new TestCase(
		'Number Literal Test',
		function() {
			var pr = proxy.NumberProxy(1, 'base');
			return proxy.storage.isObjectTainted(pr);
		},
		true,	
		proxy.storage.clearTaintedObjects.bind(proxy.storage)
);


var stringLiteralTest = new TestCase(
		'String Literal Test',
		function() {
			var pr = proxy.StringProxy('asd', 'base');
			return proxy.storage.isObjectTainted(pr);
		},
		true,	
		proxy.storage.clearTaintedObjects.bind(proxy.storage)
);


exports.tests = [booleanLiteralTest, numberLiteralTest, stringLiteralTest];
exports.testSuite = 'Literals tainting test suite';
