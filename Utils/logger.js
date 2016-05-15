/**
 * @module logger
 */

var config = require('config');
var DEBUG = config.DEBUG;
var noColor = config.noColor;

var colors = require('colors');
if (noColor) {
	let tmp = function(msg) {return msg;};
	colors = {
		'red': tmp,
		'green': tmp
	};
}

var logger = {
	debugLog : function(msg) {
				   if (DEBUG) {
					   console.log(colors.green(msg) + '');
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
