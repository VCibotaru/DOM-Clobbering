var TestCase = require('./tests').TestCase;

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
			let x = pr[0];
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
			let x = pr.join(',');	
			return this.isObjectTainted(x) && __triple_equal__(x, 'foo,bar');
		},
		true
);

exports.tests = [creationTest, accessTest, indexOfTest, joinTest];
exports.testSuite = 'Arrays test suite';
