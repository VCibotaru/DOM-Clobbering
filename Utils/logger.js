/**
 * @module logger
 */

var DEBUG = require('config').DEBUG;
var colors = require('colors');
var logger = {
	debugLog : function(msg) {
				   if (DEBUG) {
					   console.log(msg);
				   }
			   },
	log : function(msg) {
			  console.log(msg);
		  }
};

logger.testLog = function(testNumber, testPassed, testDescription, testResult, testExpected) {
	var msg = `Test: ${testDescription}.`;
	if (testPassed === true) {
		msg = colors.green('[  PASSED  ] ') + msg;
	}
	else {
		msg = colors.red('[  FAILED  ] ') + msg;
		msg += ` Expected: ${testExpected} ; Got: ${testResult}`;
	}
	console.log(msg);
};


/** The global logger object */
exports.logger = logger;
module.exports = logger;
