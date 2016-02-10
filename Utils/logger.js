/**
 * @module logger
 */

var DEBUG = require('config').DEBUG;
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

/** The global logger object */
exports.logger = logger;
module.exports = logger;
