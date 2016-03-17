var TestCase = require('./tests').TestCase;
var proxy = require('proxy');
var rewrite = require('rewriter').rewrite;
var replacerNames = require('replacer').replacerNames;
var cleanup = proxy.storage.clearTaintedObjects.bind(proxy.storage);

require('mocks').mapMocksToObject(this);

var creationTest = new TestCase(
		'Number Proxy creation',
		function() {
			let x = proxy.NumberProxy(1, 'x');
			return proxy.isObjectTainted(x);
		},
		true,
		cleanup
);

// some very dirty hacks!!!
var lambdaToFunc = function(lambda) {
	let funcCode = 'let l = ' + lambda + ' return l(a,b);';
	return Function('a', 'b', funcCode);
};

// following are just some shortenings

var UnaryOperationTestFunctionFactory = function(op, init, res) {
	let func = function() {
		let newOp = lambdaToFunc(rewrite(op.toString()));
		let x = proxy.NumberProxy(init, 'x');
		let y = newOp(x);
		// console.log(x + ' ' + typeof x);
		// console.log(y + ' ' + typeof y);
		require('mocks').mapMocksToObject(this);
		let te = this[replacerNames['===']]; // triple equal mock
		let de = this[replacerNames['==']]; // double equal mock
		res = [proxy.isObjectTainted(y), te(res, y), te(res, y)];
		res = res.map((a) => a.valueOf());
		return res.reduce((a,b) => a && b, true);
	};
	return func;
};

var BinaryOperationTestFunctionFactory = function(op, initX, initY, XY, YX) {
	let func = function() {
			let newOp = lambdaToFunc(rewrite(op.toString()));
			let x = proxy.NumberProxy(initX, 'x');
			let y = proxy.NumberProxy(initY, 'y');
			let z = initY;
			let xy = newOp(x, y); 
			let yx = newOp(y, x); 
			let xz = newOp(x, z);
			let zx = newOp(z, x);
			// console.log('x:' + x);
			// console.log('y:' + y);
			// console.log('z:' + z);
			// console.log('xy:' + xy + ' ' + XY);
			// console.log('yx:' + yx + ' ' + YX);
			// console.log('xz:' + xz + ' ' + XY);
			// console.log('zx:' + zx + ' ' + YX);
			require('mocks').mapMocksToObject(this);
			let te = this[replacerNames['===']]; // triple equal mock
			let de = this[replacerNames['==']]; // double equal mock
			// all of following must be true
			let res = [
				proxy.isObjectTainted(xy), 
				proxy.isObjectTainted(yx),
				proxy.isObjectTainted(xz),
				proxy.isObjectTainted(zx),
				de(xy, XY),
			   	te(xy, XY), 
				de(yx, YX),
				te(yx, YX),
				de(xz, XY),
				te(xz, XY), 
				de(zx, YX),
				te(zx, YX),
			];
			res = res.map((a) => a.valueOf());
			// console.log(res);
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

var unaryPlus = OperationTestCaseFactory( 
		'Numbers Unary Plus',
		UnaryOperationTestFunctionFactory((a) => +a, 1, 1)
);

var unaryMinus = OperationTestCaseFactory( 
		'Numbers Unary Minus',
		UnaryOperationTestFunctionFactory((a) => -a, 1, -1)
);

var prefixIncrement = OperationTestCaseFactory(
		'Numbers Prefix Increment',
		UnaryOperationTestFunctionFactory((a) => ++a, 1, 2)
);

var postfixIncrement = OperationTestCaseFactory(
		'Numbers Postfix Increment',
		UnaryOperationTestFunctionFactory((a) => a++, 1, 1)
);

var prefixDecrement = OperationTestCaseFactory(
		'Numbers Prefix Decrement',
		UnaryOperationTestFunctionFactory((a) => --a, 1, 0)
);

var postfixDecrement = OperationTestCaseFactory(
		'Numbers Postfix Decrement',
		UnaryOperationTestFunctionFactory((a) => a--, 1, 1)
);

// bitwise operations

var bitwiseAnd = OperationTestCaseFactory(
		'Numbers Bitwise And',
		BinaryOperationTestFunctionFactory((a, b) => a&b, 0xFA, 0xAF, 0xAA, 0xAA)
);

var bitwiseOr = OperationTestCaseFactory(
		'Numbers Bitwise Or',
		BinaryOperationTestFunctionFactory((a, b) => a|b, 0xFA, 0xAF, 0xFF, 0xFF)
);

var bitwiseXor = OperationTestCaseFactory(
		'Numbers Bitwise Xor',
		BinaryOperationTestFunctionFactory((a, b) => a^b, 0xFA, 0xAF, 0x55, 0x55)
);

var bitwiseNegation = OperationTestCaseFactory(
		'Numbers Bitwise Negation',
		UnaryOperationTestFunctionFactory((a) => ~a, 15, -16)
);

var bitwiseShiftLeft = OperationTestCaseFactory(
		'Numbers Bitwise Shift Left',
		BinaryOperationTestFunctionFactory((a, b) => a << b, 2, 16, 131072, 64)
);

var bitwiseShiftRight = OperationTestCaseFactory(
		'Numbers Bitwise Shift Right',
		BinaryOperationTestFunctionFactory((a, b) => a >> b, 2, 16, 0, 4)
);

// logical operations

var logicalAnd = OperationTestCaseFactory(
		'Numbers Logical And', 
		BinaryOperationTestFunctionFactory((a, b) => a && b, 1, 0, 0, 0)
);

var logicalOr = OperationTestCaseFactory(
		'Numbers Logical Or',
		BinaryOperationTestFunctionFactory((a, b) => a || b, 1, 0, 1, 1)
);

var logicalNot = OperationTestCaseFactory(
		'Numbers Logical Not',
		UnaryOperationTestFunctionFactory((a) => !a, 1, 0)
);


var doubleEquality = OperationTestCaseFactory(
		'Numbers Double Equality (==)',
		BinaryOperationTestFunctionFactory((a, b) => (a == b), 1, 1, true, true)
);

var tripleEquality = OperationTestCaseFactory(
		'Numbers Triple Equality (===)',
		BinaryOperationTestFunctionFactory((a, b) => (a === b), 1, 1, true, true)
);

var doubleInequality = OperationTestCaseFactory(
		'Numbers Double IneEquality (!=)',
		BinaryOperationTestFunctionFactory((a, b) => (a != b), 1, 1, false, false)
);

var tripleInequality = OperationTestCaseFactory(
		'Numbers Triple Inequality (!==)',
		BinaryOperationTestFunctionFactory((a, b) => (a !== b), 1, 1, false, false)
);

var lessThan = OperationTestCaseFactory(
		'Numbers Less Than (<)',
		BinaryOperationTestFunctionFactory((a, b) => (a < b), 0, 1, true, false)
);

var lessOrEqualThan = OperationTestCaseFactory(
		'Numbers Less or Equal Than (<=)',
		BinaryOperationTestFunctionFactory((a, b) => (a <= b), 1, 1, true, true)
);

var greaterThan = OperationTestCaseFactory(
		'Numbers Greater Than (>)',
		BinaryOperationTestFunctionFactory((a, b) => (a > b), 0, 1, false, true)
);

var greaterOrEqualThan = OperationTestCaseFactory(
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
