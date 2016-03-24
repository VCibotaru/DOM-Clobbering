/**
 * This module contains different useful function.
 * @module misc
 */

/**
 * Converts a variable definition to code.
 * @function variableDefToCode
 * @param {object} value - The value of the variable.
 * @param {string} name - The name of the variable.
 * @return - A string represententing the variable definition.
 */
var variableDefToCode = function(value, name) {
	let code = "var " + name + " = JSON.parse('" + JSON.stringify(value) + "');";
	return code;
};

/**
 * Converts a function definition to code.
 * @function functionDefToCode
 * @param {object} value - The function.
 * @param {string} name - The name of the function.
 * @return - A string represententing the function definition.
 */
var functionDefToCode = function(value, name) {
	let code = "var " + name + " = " + value + ";";
	return code;
};

exports.functionDefToCode = functionDefToCode;
exports.variableDefToCode = variableDefToCode;
