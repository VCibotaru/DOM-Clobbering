var TestCase = require('./tests').TestCase;
var proxy = require('proxy');

var cleanup = proxy.storage.clearTaintedObjects.bind(proxy.storage);

var creationTest = new TestCase(
		'Number Proxy creation',
		function() {
			let x = proxy.NumberProxy(1, 'x');
			return proxy.isObjectTainted(x);
		},
		true,
		cleanup
);

var typeofTest = new TestCase(
		'Number Proxy typeof operator',
		function() {
			let x = proxy.NumberProxy(1, 'x');
			return typeof x;
		},
		'number',
		cleanup
);


// following are just some shortenings

var UnaryOperationTestFunctionFactory = function(op, init, res) {
	let func = function() {
		let x = proxy.NumberProxy(init, 'x');
		let y = op(x);
		return proxy.isObjectTainted(y) && (y === res);
	};
	return func;
};

var BinaryOperationTestFunctionFactory = function(op, initX, initY, XY, YX) {
	let func = function() {
			let x = proxy.NumberProxy(initX, 'x');
			let y = proxy.NumberProxy(initY, 'y');
			let z = initY;
			let xy = op(x, y); 
			let yx = op(y, x); 
			let xz = op(x, z);
			let zx = op(z, x);
			// console.log(x);
			// console.log(y);
			// console.log(xy);
			// console.log(xz);
			// console.log(xy === XY);
			// all of following must be true
			let res = [
				// proxy.isObjectTainted(xy), 
				// proxy.isObjectTainted(yx),
				// proxy.isObjectTainted(xz),
				// proxy.isObjectTainted(zx),
				xy == XY, xy === XY, yx == YX, yx === YX,
				xz == XY, xz === XY, zx == YX, zx === YX,
			];
			return res.reduce((a,b) => a && b, true);
	};
	return func;
};

var OperationTestCaseFactory = function(description, testFunc) {
	return new TestCase(description, testFunc, true, cleanup);
};


// arithmetical tests
var addition = OperationTestCaseFactory(
		'Numbers addition',
		BinaryOperationTestFunctionFactory((a, b) => a+b, 1, 2, 3, 3)
);

var subtraction = OperationTestCaseFactory(
		'Numbers subtraction',
		BinaryOperationTestFunctionFactory((a, b) => a-b, 1, 2, -1, 1)
);

var multiplication = OperationTestCaseFactory(
		'Numbers multiplication',
		BinaryOperationTestFunctionFactory((a, b) => a*b, 1, 2, 2, 2)
);

var division = OperationTestCaseFactory(
		'Numbers division',
		BinaryOperationTestFunctionFactory((a, b) => a/b, 1, 2, 0.5, 2)
);

var modulus = OperationTestCaseFactory(
		'Numbers modulus',
		BinaryOperationTestFunctionFactory((a, b) => a%b, 1, 2, 1, 0)
);

var unaryPlus = new OperationTestCaseFactory( 
		'Numbers Unary Plus',
		UnaryOperationTestFunctionFactory((a) => +a, 1, 1)
);

var unaryMinus = new OperationTestCaseFactory( 
		'Numbers Unary Minus',
		UnaryOperationTestFunctionFactory((a) => -a, 1, -1)
);

var prefixIncrement = new OperationTestCaseFactory(
		'Numbers Prefix Increment',
		UnaryOperationTestFunctionFactory((a) => ++a, 1, 2)
);

var postfixIncrement = new OperationTestCaseFactory(
		'Numbers Postfix Increment',
		UnaryOperationTestFunctionFactory((a) => a++, 1, 1)
);

var prefixDecrement = new OperationTestCaseFactory(
		'Numbers Prefix Decrement',
		UnaryOperationTestFunctionFactory((a) => --a, 1, 0)
);

var postfixDecrement = new OperationTestCaseFactory(
		'Numbers Postfix Decrement',
		UnaryOperationTestFunctionFactory((a) => a--, 1, 1)
);

// bitwise operations

var bitwiseAnd = new OperationTestCaseFactory(
		'Numbers Bitwise And',
		BinaryOperationTestFunctionFactory((a, b) => a&b, 0xFA, 0xAF, 0xAA, 0xAA)
);

var bitwiseOr = new OperationTestCaseFactory(
		'Numbers Bitwise Or',
		BinaryOperationTestFunctionFactory((a, b) => a|b, 0xFA, 0xAF, 0xFF, 0xFF)
);

var bitwiseXor = new OperationTestCaseFactory(
		'Numbers Bitwise Xor',
		BinaryOperationTestFunctionFactory((a, b) => a^b, 0xFA, 0xAF, 0x55, 0x55)
);

var bitwiseNegation = new OperationTestCaseFactory(
		'Numbers Bitwise Negation',
		UnaryOperationTestFunctionFactory((a) => ~a, 15, -16)
);

var bitwiseShiftLeft = new OperationTestCaseFactory(
		'Numbers Bitwise Shift Left',
		BinaryOperationTestFunctionFactory((a, b) => a << b, 2, 16, 131072, 64)
);

var bitwiseShiftRight = new OperationTestCaseFactory(
		'Numbers Bitwise Shift Right',
		BinaryOperationTestFunctionFactory((a, b) => a >> b, 2, 16, 0, 4)
);

// logical operations

var logicalAnd = new OperationTestCaseFactory(
		'Numbers Logical And', 
		BinaryOperationTestFunctionFactory((a, b) => a && b, 1, 0, 0, 0)
);

var logicalOr = new OperationTestCaseFactory(
		'Numbers Logical Or',
		BinaryOperationTestFunctionFactory((a, b) => a || b, 1, 0, 1, 1)
);

var logicalNot = new OperationTestCaseFactory(
		'Numbers Logical Not',
		UnaryOperationTestFunctionFactory((a) => !a, 1, 0)
);


var doubleEquality = new OperationTestCaseFactory(
		'Numbers Double Equality (==)',
		BinaryOperationTestFunctionFactory((a, b) => (a == b), 1, 1, true, true)
);

var tripleEquality = new OperationTestCaseFactory(
		'Numbers Triple Equality (===)',
		BinaryOperationTestFunctionFactory((a, b) => (a === b), 1, 1, true, true)
);

var doubleInequality = new OperationTestCaseFactory(
		'Numbers Double IneEquality (!=)',
		BinaryOperationTestFunctionFactory((a, b) => (a != b), 1, 1, false, false)
);

var tripleInequality = new OperationTestCaseFactory(
		'Numbers Triple Inequality (!==)',
		BinaryOperationTestFunctionFactory((a, b) => (a !== b), 1, 1, false, false)
);

var lessThan = new OperationTestCaseFactory(
		'Numbers Less Than (<)',
		BinaryOperationTestFunctionFactory((a, b) => (a < b), 0, 1, true, false)
);

var lessOrEqualThan = new OperationTestCaseFactory(
		'Numbers Less or Equal Than (<=)',
		BinaryOperationTestFunctionFactory((a, b) => (a <= b), 1, 1, true, true)
);

var greaterThan = new OperationTestCaseFactory(
		'Numbers Greater Than (>)',
		BinaryOperationTestFunctionFactory((a, b) => (a > b), 0, 1, false, true)
);

var greaterOrEqualThan = new OperationTestCaseFactory(
		'Numbers Greater or Equal Than (>=)',
		BinaryOperationTestFunctionFactory((a, b) => (a >= b), 1, 1, true, true)
);

var valueOfTest = new TestCase(
		'Numbers valueOf()',
		function() {
			let x = proxy.NumberProxy(1);
			let y = x.valueOf();
			return y;
		},
		1,
		cleanup
);
exports.tests = [
	creationTest,
	typeofTest, 
	valueOfTest,
	// comparison
	doubleEquality,
	tripleEquality,
	doubleInequality,
	tripleInequality,
	lessThan,
	lessOrEqualThan,
	greaterThan,
	greaterOrEqualThan,
	// arithmetical
   	addition,
	subtraction,
	multiplication,
	division,
	modulus,
	unaryPlus,
	unaryMinus,
	prefixIncrement,
	postfixIncrement,
	prefixDecrement,
	postfixDecrement,
	// bitwise
	bitwiseAnd,
	bitwiseOr,
	bitwiseXor,
	bitwiseNegation,
	bitwiseShiftLeft,
	bitwiseShiftRight,
	// logical
	logicalAnd,
	logicalOr,
	logicalNot,

];
exports.testSuite = 'Number Proxy Test Suite';
