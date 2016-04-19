var TestCase = require('./tests').TestCase;

var booleanLiteralTest = new TestCase(
		'Boolean Literal Test',
		function() {
			var pr = this.taint(true, 'base');
			return this.isObjectTainted(pr);
		},
		true,	
		this.clearTaintedObjects
);


var numberLiteralTest = new TestCase(
		'Number Literal Test',
		function() {
			var pr = this.taint(1, 'base');
			return this.isObjectTainted(pr);
		},
		true,	
		this.clearTaintedObjects
);


var stringLiteralTest = new TestCase(
		'String Literal Test',
		function() {
			var pr = this.taint('asd', 'base');
			return this.isObjectTainted(pr);
		},
		true,	
		this.clearTaintedObjects
);


exports.tests = [booleanLiteralTest, numberLiteralTest, stringLiteralTest];
exports.testSuite = 'Literals tainting test suite';
