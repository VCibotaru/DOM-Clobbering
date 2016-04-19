var TestCase = require('./tests').TestCase;

var proxyCreationTest = new TestCase(
		'Proxy Creation',
		function() {
			var obj = {'foo': 'bar'};
			var pr = this.taint(obj, 'base');
			return this.getTaintedNames();
		},
		["base"],
		this.clearTaintedObjects
);

var proxyPropagationTest = new TestCase(
		'Proxy Propagation',
		function () {
			var obj = {'foo': 'bar'};
			var pr = this.taint(obj, 'base');
			var x = pr;
			return this.isObjectTainted(x);
		},
		true,
		this.clearTaintedObjects
);

var proxyReassignmentTest = new TestCase(
		'Proxy Reassignment',
		function () {
			var obj = {'foo': 'bar'};
			var pr = this.taint(obj, 'base');
			pr = 'asd';
			return this.isObjectTainted(pr);
		},
		false,
		this.clearTaintedObjects
);

exports.tests = [proxyCreationTest, proxyPropagationTest, proxyReassignmentTest];
exports.testSuite = 'Basic proxy creation and propagation';
