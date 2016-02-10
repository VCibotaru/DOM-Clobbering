/** @module config **/

/**
 * Represents a configuration of the current launch.
 * @constructor
 * @property {string} url - The url of the page to be checked.
 * @property {bool} DEBUG - Flag showing if the debug mode is on.
 * @property {string} elementName - The name for clobbering.
*/
var Config = function() {
	this.url = require('system').args.slice()[1];
	this.DEBUG = true;
	this.elementName = 'querySelector';
};


var config = new Config();

/** The object holding current configuration.**/
exports.config = config;
module.exports = config;
	
