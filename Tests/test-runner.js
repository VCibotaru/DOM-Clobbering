var logger = require('logger');
var splitLineLength = 50;


var doTest = function() {
	let testNames = ['./proxy_creation', './literals', './object_operations', './numbers', './rewriting', './strings', './arrays'];
	let testNumber = 1;
	let failedTests = 0;
	for (let i = 0 ; i < testNames.length; i++) {
		let tests = require(testNames[i]).tests;
		logger.log('-'.repeat(splitLineLength));
		logger.log(`Running test suite: ${require(testNames[i]).testSuite} (file: ${testNames[i]})`);
		for (let j = 0 ; j < tests.length ; j++) {
			let test = tests[j];
			let res = test.runTest();
			logger.testLog(testNumber, res.passed, test.getInfo(), res.result, test.result); 
			testNumber++;
			if (res.passed === false) {
				failedTests += 1;
			}
		}
		logger.log('-'.repeat(splitLineLength));
	}
	logger.log(`Total tests: ${testNumber - 1}. Failed: ${failedTests}`);
};

exports.doTest = doTest;
