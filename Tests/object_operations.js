var TestCase = require('./tests').TestCase;
var proxy = require('proxy');

var cleanup = proxy.clearTaintedObjects;
var test1 = new TestCase(
		'Property of a tainted object',
		function() {
			let obj = {'foo': {'bar': 'xyz'}};
			let pr = proxy.buildProxy(obj, 'base');
			let x = pr.foo;
			let y = x.bar;
			return proxy.getTaintedNames();
		},
		["base", "base.foo", "base.foo.bar"],
		cleanup
);

var test2 = new TestCase(
		'Assignment of a tainted property to an untainted object',
		function() {
			let obj = {};
			let pr = proxy.buildProxy('foo');
			obj.name = pr;
			let y = obj.name;
			return proxy.isObjectTainted(y);
		},
		true,
		cleanup
);

var test3 = new TestCase(
		'Assignment of a untainted property to an tainted object',
		function() {
			let pr = proxy.buildProxy({}, 'base');
			pr.x = 'foo';
			let y = pr.x;
			var set = pr[proxy.untaintedObjectNamesKey];
			return proxy.isObjectTainted(y);
		},
		false,
		cleanup
);

var test4 = new TestCase(
		'Assignment of a tainted property to a tainted object',
		function() {
			let pr = proxy.buildProxy({}, 'base');
			let str = proxy.buildProxy('foo', 'str');
			pr.str = str;
			let x = pr.str;
			return proxy.isObjectTainted(x);
		},
		true,
		cleanup
);

var test5 = new TestCase(
		'Replacement of a tainted property of a tainted object with an untainted value',
		function() {
			let pr = proxy.buildProxy({'foo': 'bar'}, 'base');
			pr.foo = 'asd';
			let x = pr.foo;
			return proxy.isObjectTainted(x);
		},
		false,
		cleanup
);

var test6 = new TestCase(
		'Replacement of an untainted property of a tainted object with a tainted value',
		function() {
			let pr = proxy.buildProxy({}, 'base');
			pr.foo = 'foo';
			pr.foo = proxy.buildProxy('bar');
			let x = pr.foo;
			return proxy.isObjectTainted(x);
		},
		true,
		cleanup
);

var test7 = new TestCase(
		'Replacement of a tainted property of a untainted object with an untainted value',
		function() {
			let obj = {};
			let pr = new proxy.buildProxy('bar');
			obj.foo = pr;
			obj.foo = 'foo';
			let x = obj.foo;
			return proxy.isObjectTainted(x);
		},
		false,
		cleanup
);

var test8 = new TestCase(
		'Replacement of an untainted property of a untainted object with a tainted value',
		function() {
			let obj = {'foo': 'bar'};
			let pr = new proxy.buildProxy('bar');
			obj.foo = pr;
			let x = obj.foo;
			return proxy.isObjectTainted(x);
		},
		true,
		cleanup
);

var test9 = new TestCase(
		'Return value of untainted object method which uses tainted value',
		function() {
			let TestObject = function(name) {
				this.name = name;
				TestObject.prototype.sayHello = function() {
					return 'Hello from: ' + toString(this.name);
				};
			};
			let pr = new proxy.buildProxy('name');
			let obj = new TestObject(pr);
			let x = TestObject.prototype.sayHello.call(obj);
			return proxy.isObjectTainted(x);
		},
		true,
		cleanup
);


var test10 = new TestCase(
		'Return value of tainted object method which uses tainted value',
		function() {
			let TestObject = function(name) {
				this.name = name;
				TestObject.prototype.sayHello = function() {
					return 'Hello from: ' + toString(this.name);
				};
			};
			let pr = new proxy.buildProxy('name');
			let obj = proxy.buildProxy(new TestObject(pr), 'base');
			let x = obj.sayHello();
			return proxy.isObjectTainted(x);
		},
		true,
		cleanup
);

exports.tests = [test1, test2, test3, test4, test5, test6, test7, test8, test9, test10];
exports.testSuite = 'Operations with tainted objects test suite';
