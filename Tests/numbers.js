var TestCase = require('./tests').TestCase;
var rewrite = require('rewriter').rewrite;
var replacerNames = require('replacer').replacerNames;

require('mocks').mapMocksToObject(this);

var creationTest = new TestCase(
		'Number Proxy creation',
		function() {
			let x = this.taint(1, 'x');
			return this.isObjectTainted(x);
		},
		true
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
		let x = this.taint(init, 'x');
		let y = newOp(x);
		require('mocks').mapMocksToObject(this);
		let te = this[replacerNames['===']]; // triple equal mock
		let de = this[replacerNames['==']]; // double equal mock
		res = [this.isObjectTainted(y), te(res, y), te(res, y)];
		res = res.map((a) => a.valueOf());
		return res.reduce((a,b) => a && b, true);
	};
	return func;
};

var BinaryOperationTestFunctionFactory = function(op, initX, initY, XY, YX) {
	let func = function() {
			let newOp = lambdaToFunc(rewrite(op.toString()));
			let x = this.taint(initX, 'x');
			let y = this.taint(initY, 'y');
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
				this.isObjectTainted(xy), 
				this.isObjectTainted(yx),
				this.isObjectTainted(xz),
				this.isObjectTainted(zx),
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

var EqualityOperationTestFunctionFactory = function(op, initX, initY, XY, YX) {
	let func = function() {
			let newOp = lambdaToFunc(rewrite(op.toString()));
			let x = this.taint(initX, 'x');
			let y = this.taint(initY, 'y');
			let z = initY;
			let xy = newOp(x, y); 
			let yx = newOp(y, x); 
			let xz = newOp(x, z);
			let zx = newOp(z, x);
			require('mocks').mapMocksToObject(this);
			// all of following must be true
			let res = [
				xy == XY,
			   	xy === XY, 
				yx == YX,
				yx === YX,
				xz == XY,
				xz === XY, 
				zx == YX,
				zx === YX,
			];
			res = res.map((a) => a.valueOf());
			// console.log(res);
			return res.reduce((a,b) => a && b, true);
	};
	return func;
};

var OperationTestCaseFactory = function(description, testFunc) {
	return new TestCase(description, testFunc, true);
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
		UnaryOperationTestFunctionFactory((a) => !a, 1, false)
);

// comparison operations

var doubleEquality = OperationTestCaseFactory(
		'Numbers Double Equality (==)',
		EqualityOperationTestFunctionFactory((a, b) => (a == b), 1, 1, true, true)
);

var tripleEquality = OperationTestCaseFactory(
		'Numbers Triple Equality (===)',
		EqualityOperationTestFunctionFactory((a, b) => (a === b), 1, 1, true, true)
);

var doubleInequality = OperationTestCaseFactory(
		'Numbers Double IneEquality (!=)',
		EqualityOperationTestFunctionFactory((a, b) => (a != b), 1, 1, false, false)
);

var tripleInequality = OperationTestCaseFactory(
		'Numbers Triple Inequality (!==)',
		EqualityOperationTestFunctionFactory((a, b) => (a !== b), 1, 1, false, false)
);

var lessThan = OperationTestCaseFactory(
		'Numbers Less Than (<)',
		EqualityOperationTestFunctionFactory((a, b) => (a < b), 0, 1, true, false)
);

var lessOrEqualThan = OperationTestCaseFactory(
		'Numbers Less or Equal Than (<=)',
		EqualityOperationTestFunctionFactory((a, b) => (a <= b), 1, 1, true, true)
);

var greaterThan = OperationTestCaseFactory(
		'Numbers Greater Than (>)',
		EqualityOperationTestFunctionFactory((a, b) => (a > b), 0, 1, false, true)
);

var greaterOrEqualThan = OperationTestCaseFactory(
		'Numbers Greater or Equal Than (>=)',
		EqualityOperationTestFunctionFactory((a, b) => (a >= b), 1, 1, true, true)
);

var valueOfTest = new TestCase(
		'Numbers valueOf()',
		function() {
			let x = this.taint(1);
			let y = x.valueOf();
			return y;
		},
		1
);

var evalTest = new TestCase(
		'Numbers eval()',
		function() {
			let code = "" +
			"let x = this.taint(4);" +
			"eval(x);" +
			"";
			let newCode = rewrite(code);
			return eval(newCode);
		},
		4
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
	// unaryPlus,
	// unaryMinus,
	// prefixIncrement,
	// postfixIncrement,
	// prefixDecrement,
	// postfixDecrement,
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
	// eval
	evalTest,
];
exports.testSuite = 'Number Proxy Test Suite';
