var proxy = require('proxy');
var logger = require('logger');

var splitLineLength = 50;
var doTest = function() {
	let testNames = ['./proxy_creation', './literals', './object_operations', './numbers'];
	let testNumber = 1;
	for (let i = 0 ; i < testNames.length; i++) {
		let tests = require(testNames[i]).tests;
		logger.log('-'.repeat(splitLineLength));
		logger.log(`Running test suite: ${require(testNames[i]).testSuite} (file: ${testNames[i]})`);
		for (let j = 0 ; j < tests.length ; j++) {
			let test = tests[j];
			let res = test.runTest();
			logger.testLog(testNumber, res.passed, test.getInfo(), res.result, test.result); 
			testNumber++;
		}
		logger.log('-'.repeat(splitLineLength));
	}
};

exports.doTest = doTest;
