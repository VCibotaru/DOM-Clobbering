var TestCase = require('./tests').TestCase;
var rewrite = require('rewriter').rewrite;

require('mocks').mapMocksToObject(this);
// require('prototype-rewriter').rewritePrototypes(this);

var creationTest = new TestCase(
		'Array Proxy creation',
		function() {
			let pr = this.taint(['foo', 'bar']);
			let x = pr;
			return this.isObjectTainted(x);
		},
		true
);

var accessTest = new TestCase(
		'Array element access',
		function() {
			let pr = this.taint(['foo', 'bar']);
			let code = "" +
			"let x = pr[0];" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(x);
		},
		true
);

var indexOfTest = new TestCase(
		'Array indexOf function',
		function() {
			let pr = this.taint(['foo', 'bar']);
			return pr.indexOf('foo');
		},
		0
);

var joinTest = new TestCase(
		'Array join function',
		function() {
			let pr = this.taint(['foo', 'bar']);
			let code = "" +
			"let x = pr.join(',');	" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(x) && __triple_equal__(x, 'foo,bar');
		},
		true
);

exports.tests = [creationTest, accessTest, indexOfTest, joinTest];
exports.testSuite = 'Arrays test suite';
