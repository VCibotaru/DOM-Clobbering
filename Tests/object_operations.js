var TestCase = require('./tests').TestCase;
require('mocks').mapMocksToObject(this);
var rewrite = require('rewriter').rewrite;

var test1 = new TestCase(
		'Property of a tainted object',
		function() {
			let code = "" + 
			"let obj = {'foo': {'bar': 'xyz'}};" +
			"let pr = this.taint(obj, 'base');" +
			"let x = pr.foo;" +
			"let y = x.bar;" +
			"";
			eval(rewrite(code));
			return this.getTaintedNames();
		},
		["base", "base.foo", "base.foo.bar"]
);

var test2 = new TestCase(
		'Assignment of a tainted property to an untainted object',
		function() {
			let code = "" +
			"let obj = {};" +
			"let pr = this.taint('foo');" +
			"obj.name = pr;" +
			"let y = obj.name;" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(y);
		},
		true
);

var test3 = new TestCase(
		'Assignment of a untainted property to an tainted object',
		function() {
			let code = "" +
			"let pr = this.taint({}, 'base');" +
			"pr.x = 'foo';" +
			"let y = pr.x;" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(y);
		},
		false
);

var test4 = new TestCase(
		'Assignment of a tainted property to a tainted object',
		function() {
			let code = "" +
			"let pr = this.taint({}, 'base');" +
			"let str = this.taint('foo', 'str');" +
			"pr.str = str;" +
			"let x = pr.str;" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(x);
		},
		true
);

var test5 = new TestCase(
		'Replacement of a tainted property of a tainted object with an untainted value',
		function() {
			let code = "" +
			"let pr = this.taint({'foo': 'bar'}, 'base');" +
			"pr.foo = 'asd';" +
			"let x = pr.foo;" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(x);
		},
		false
);

var test6 = new TestCase(
		'Replacement of an untainted property of a tainted object with a tainted value',
		function() {
			let code = "" +
			"var pr = this.taint({}, 'base');" +
			"pr.foo = 'foo';" +
			"pr.foo = this.taint('bar');" +
			"var x = pr.foo;" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(x);
		},
		true
);

var test7 = new TestCase(
		'Replacement of a tainted property of a untainted object with an untainted value',
		function() {
			let code = "" +
			"let obj = {};" +
			"let pr = new this.taint('bar');" +
			"obj.foo = pr;" +
			"obj.foo = 'foo';" +
			"let x = obj.foo;" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(x);
		},
		false
);

var test8 = new TestCase(
		'Replacement of an untainted property of a untainted object with a tainted value',
		function() {
			let code = "" +
			"let obj = {'foo': 'bar'};" +
			"let pr = new this.taint('bar');" +
			"obj.foo = pr;" +
			"let x = obj.foo;" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(x);
		},
		true
);

var test9 = new TestCase(
		'Return value of untainted object method which uses tainted value',
		function() {
			let code = "" +
			"let TestObject = function(name) {" +
				"this.name = name;" +
				"TestObject.prototype.sayHello = function() {" +
					"return 'Hello from: ' + toString(this.name);" +
				"};" +
			"};" +
			"let pr = new this.taint('name');" +
			"let obj = new TestObject(pr);" +
			"let x = obj.sayHello();" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(x);
		},
		true
);


var test10 = new TestCase(
		'Return value of tainted object method which uses tainted value',
		function() {
			let code = "" +
			"let TestObject = function(name) {" +
				"this.name = name;" +
				"TestObject.prototype.sayHello = function() {" +
					"return 'Hello from: ' + toString(this.name);" +
				"};" +
			"};" +
			"let pr = new this.taint('name');" +
			"let obj = this.taint(new TestObject(pr), 'base');" +
			"let x = obj.sayHello();" +
			"";
			eval(rewrite(code));
			return this.isObjectTainted(x);
		},
		true
);

exports.tests = [test1, test2, test3, test4, test5, test6, test7, test8, test9, test10];
exports.testSuite = 'Operations with tainted objects test suite';
