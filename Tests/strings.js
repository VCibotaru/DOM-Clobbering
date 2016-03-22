var TestCase = require('./tests').TestCase;
var rewrite = require('rewriter').rewrite;
var proxy = require('proxy');

var cleanup = proxy.clearTaintedObjects;

require('mocks').mapMocksToObject(this);

var creationTest = new TestCase(
		'StringProxy creation',
		function() {
			let pr = proxy.buildProxy('foo', 'base');
			let y = pr;
			return proxy.isObjectTainted(y);
		},
		true,
		cleanup
);

var typeofTest = new TestCase(
		'Strings typeof',
		function() {
			let code = "" +
			"let pr = proxy.buildProxy('foo');" + 
			"typeof pr;" +
			"";
			let newCode = rewrite(code);
			return eval(newCode);
		},
		'string',
		cleanup
);

var doubleEqualTest = new TestCase(
		'Strings double equal (==)',
		function() {
			let code = "" +
			"let pr = proxy.buildProxy('foo');" +
			"pr == 'foo';" +
			"";
			let newCode = rewrite(code);
			return eval(newCode);
		},
		true,
		cleanup
);
var tripleEqualTest = new TestCase(
		'Strings triple equal (===)',
		function() {
			let code = "" +
			"let pr = proxy.buildProxy('foo');" +
			"pr === 'foo';" +
			"";
			let newCode = rewrite(code);
			return eval(newCode);
		},
		true,
		cleanup
);

var plusTest = new TestCase(
		'Strings concat (+)',
		function() {
			let code = "" +
			"let x = proxy.buildProxy('foo');" + 
			"let y = proxy.buildProxy('bar');" +
			"let z = x + 'bar';" +
			"(x + y === 'foo' + 'bar') && (x + 'bar' === 'foo' + y) &&" +
			"(x + new String('bar')  === new String('foo') + y) &&" +
			"(x + 4 === 'foo4') && (proxy.isObjectTainted(z));" + 
			"";
			let newCode = rewrite(code);
			return eval(newCode);
		},
		true,
		cleanup
);

// TODO: eval
// TODO: functions
//
exports.tests = [creationTest, typeofTest, doubleEqualTest, tripleEqualTest, plusTest];
exports.testSuite = 'Strings test suite';
