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
	// xpath expression for the needed HTML element
	this.xpath = conf.xpath;
	// url of the page
	this.url = conf.url;
	// the name that shall be assigned to the HTML element
	this.elementName = conf.taint_name;
	// true for unit tests mode, false/undefined for normal mode
	this.testMode = conf.test;
	// code to be ran at start of the taint process
	this.taintStartCode = conf.taint_start_code;
	// if true then taint begins immediately after window creation
	// else the script waits for needed HTML element creation
	this.taintAtStart = conf.taint_at_start;
	this.DEBUG = true;
};


var config = new Config();

/** The object holding current configuration.**/
exports.config = config;
module.exports = config;
	
