var TestCase = require('./tests').TestCase;
var rewrite = require('rewriter').rewrite;

var cleanup = this.clearTaintedObjects;

require('mocks').mapMocksToObject(this);

var creationTest = new TestCase(
		'StringProxy creation',
		function() {
			let pr = this.taint('foo', 'base');
			let y = pr;
			return this.isObjectTainted(y);
		},
		true
);

var typeofTest = new TestCase(
		'Strings typeof',
		function() {
			let code = "" +
			"let pr = this.taint('foo');" + 
			"typeof pr;" +
			"";
			let newCode = rewrite(code);
			return eval(newCode);
		},
		'string'
);

var doubleEqualTest = new TestCase(
		'Strings double equal (==)',
		function() {
			let code = "" +
			"let pr = this.taint('foo');" +
			"pr == 'foo';" +
			"";
			let newCode = rewrite(code);
			return eval(newCode);
		},
		true
);
var tripleEqualTest = new TestCase(
		'Strings triple equal (===)',
		function() {
			let code = "" +
			"let pr = this.taint('foo');" +
			"pr === 'foo';" +
			"";
			let newCode = rewrite(code);
			return eval(newCode);
		},
		true
);

var plusTest = new TestCase(
		'Strings concat (+)',
		function() {
			let code = "" +
			"let x = this.taint('foo');" + 
			"let y = this.taint('bar');" +
			"let z = x + 'bar';" +
			"(x + y === 'foo' + 'bar') && (x + 'bar' === 'foo' + y) &&" +
			"(x + new String('bar')  === new String('foo') + y) &&" +
			"(x + 4 === 'foo4') && (this.isObjectTainted(z));" + 
			"";
			let newCode = rewrite(code);
			return eval(newCode);
		},
		true
);

var evalTest = new TestCase(
		'Strings eval()',
		function() {
			let x = this.taint('2+2');
			let code = "" +
			"eval(x);" +
			"";
			let newCode = rewrite(code);
			return eval(newCode);
		},
		4
);

var sliceTest = new TestCase(
		'Strings slice()',
		function() {
			var pr = this.taint('foobar', 'base');
			let code = "" +
			"let x = pr.slice(0,3);" +
			"";
			eval(rewrite(code));
			return __triple_equal__(x, 'foo') && this.isObjectTainted(x);
		},
		true
);

var splitTest = new TestCase(
		'Strings split()',
		function() {
			let pr = this.taint('Foo. Bar.');
			let code = "" + 
			"let x = pr.split('.');" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(x);
		},
		true
);

exports.tests = [creationTest, typeofTest, doubleEqualTest, tripleEqualTest, plusTest, evalTest, sliceTest, splitTest];
exports.testSuite = 'Strings test suite';
