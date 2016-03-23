var TestCase = require('./tests').TestCase;
var proxy = require('proxy');

var cleanup = proxy.clearTaintedObjects;

require('mocks').mapMocksToObject(this);

var creationTest = new TestCase(
		'Array Proxy creation',
		function() {
			let pr = proxy.buildProxy(['foo', 'bar']);
			let x = pr;
			return proxy.isObjectTainted(x);
		},
		true,
		cleanup
);

var accessTest = new TestCase(
		'Array element access',
		function() {
			let pr = proxy.buildProxy(['foo', 'bar']);
			let x = pr[0];
			return proxy.isObjectTainted(x);
		},
		true, 
		cleanup
);

// TODO:
// We are in trouble here!!!
// The best solution is probably to replace the Array.prototype.indexOf
var indexOfTest = new TestCase(
		'Array indexOf function',
		function() {
			let pr = proxy.buildProxy(['foo', 'bar']);
			return pr.indexOf('foo');
		},
		0,
		cleanup
);

var joinTest = new TestCase(
		'Array join function',
		function() {
			let pr = proxy.buildProxy(['foo', 'bar']);
			let x = pr.join(',');	
			return proxy.isObjectTainted(x) && __triple_equal__(x, 'foo,bar');
		},
		true, 
		cleanup
);

exports.tests = [creationTest, accessTest, indexOfTest, joinTest];
exports.testSuite = 'Arrays test suite';