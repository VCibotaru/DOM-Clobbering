/** @module config **/


var parseArgs = require('minimist');
var fs = require('fs');
/**
 * Represents a configuration of the current launch.
 * @constructor
 * @property {string} url - The url of the page to be checked.
 * @property {bool} DEBUG - Flag showing if the debug mode is on.
 * @property {string} elementName - The name for clobbering.
*/
var Config = function() {
	this.args = parseArgs(require('system').args.slice(1));
	let conf = this.args;
	if (this.args.config_file !== undefined) {
		let f = fs.read(this.args.config_file);
		conf = JSON.parse(f);
	}
	this.url = conf.url;
	this.elementName = conf.taint_name;
	this.testMode = conf.test;
};


var config = new Config();

/** The object holding current configuration.**/
exports.config = config;
module.exports = config;
	
