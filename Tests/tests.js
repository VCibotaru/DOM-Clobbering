/**
 * @module test
 */

var _ = require('underscore');

// var workModule = require('proxy');
var workModule = require('tainter');
/**
 * Represents a test case.
 * @constructor
 * @property {String} description - The description of the test case.
 * @property {Object} result - The correct result of the test case run.
 * @property {Function} code - The code that needs to be run.
 * of the obtained results. Takes one parameter: the achieved result. 
 * @property {Function} cleanup - The function which gets called for cleaning 
 * after the test was run.
 */
var TestCase = function(description, code, result, cleanup) {
	this.description = description;
	this.code = code;
	this.result = result;

	// import all functions from the work module
	this.taint = workModule.taint;
	this.isObjectTainted = workModule.isObjectTainted;
	this.isWrapper = workModule.isWrapper;
	this.getTaintedName = workModule.getTaintedName;
	this.getWrappedObject = workModule.getWrappedObject;
	this.clearTaintedObjects = workModule.clearTaintedObjects;
	this.getTaintedNames = workModule.getTaintedNames;

	this.cleanup = this.clearTaintedObjects;

};

/**
 * Runs the test case.
 * @method
 * @this TestCase
 */
TestCase.prototype.runTest = function() {
	// run the code and save the achieved result
	var curResult;
	try {
		curResult = this.code();
	}
	catch(e) {
		console.log('Got Exception: ' + e);
		curResult = 'exception';
	}
	// check whether the test was passed successfully
	var testPassed = _.isEqual(curResult, this.result); 
	// do the cleanup
	this.cleanup();
	return {'passed': testPassed, 'result': curResult};
};

TestCase.prototype.getInfo = function() {
	return this.description;
};

exports.TestCase = TestCase;
