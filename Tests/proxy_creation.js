var TestCase = require('./tests').TestCase;
var proxy = require('proxy');

var proxyCreationTest = new TestCase(
		'Proxy Creation',
		function() {
			var obj = {'foo': 'bar'};
			var pr = proxy.buildProxy(obj, 'base');
			return proxy.getTaintedNames();
		},
		["base"],
		proxy.clearTaintedObjects
);

var proxyPropagationTest = new TestCase(
		'Proxy Propagation',
		function () {
			var obj = {'foo': 'bar'};
			var pr = proxy.buildProxy(obj, 'base');
			var x = pr;
			return proxy.isObjectTainted(x);
		},
		true,
		proxy.clearTaintedObjects
);

var proxyReassignmentTest = new TestCase(
		'Proxy Reassignment',
		function () {
			var obj = {'foo': 'bar'};
			var pr = proxy.buildProxy(obj, 'base');
			pr = 'asd';
			return proxy.isObjectTainted(pr);
		},
		false,
		proxy.clearTaintedObjects
);

exports.tests = [proxyCreationTest, proxyPropagationTest, proxyReassignmentTest];
exports.testSuite = 'Basic proxy creation and propagation';
