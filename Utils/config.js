/** @module config **/


var parseArgs = require('minimist');
var fs = require('fs');
/**
 * Represents a configuration of the current launch.
 * @constructor
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
	
	// the list of names to be tainted
	this.names = [];
	if (conf.taint_names !== undefined) {
		this.names = conf.taint_names;
	}
	else if (conf.taint_name !== undefined) {
		this.names = [conf.taint_name];
	}
	if (conf.use_standard_names === true) {
		let builtInNames = require('names').builtInNames;
		this.names = this.names.concat(builtInNames);
	}

	// defined for no colors mode
	if (conf.no_color !== undefined) {
		this.noColor = true;
	}

	// true for unit tests mode, false/undefined for normal mode
	this.testMode = conf.test;

	// code to be ran at start of the taint process
	this.taintStartCode = conf.taint_start_code;

	// in DEBUG mode some more additional messages will get printed
	this.DEBUG = true;

	// the index of the name currently used
	this.currentNameIndex = 0;

	// the currently used name
	this.currentName = "";
};

Config.prototype.checkConfig = function() {
	if (this.names.length === 0) {
		throw 'Please provide at least one name for tainting!';
	}
	if (this.url === undefined) {
		throw 'Please provide an URL!';
	}
};

Config.prototype.setNextName = function() {
	if (this.currentNameIndex >= this.names.length) {
		return false;
	}
	this.currentName = this.names[this.currentNameIndex];
	this.currentNameIndex += 1;
	return true;
};

Config.prototype.getCurrentName = function() {
	return this.currentName;
};

var config = new Config();

/** The global object holding current configuration.**/
exports.config = config;
module.exports = config;
	
