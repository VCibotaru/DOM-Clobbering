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

/**
 * Builds a module's code for importing into other modules via eval.
 * @function buildModuleCode
 * @param {object} funcs - a dictionary of module's functions: {functionName: function}
 * @param {object} vars  - a dictionary of module's variables: {variableName: variable}
 * @return - A string representing the module's code
 */
var buildModuleCode = function(module, funcNames, varNames) {
	let importCode = "";
	for (let funcName of funcNames) {
		importCode += functionDefToCode(module[funcName], funcName);
	}
	for (let varName of varNames) {
		importCode += variableDefToCode(module[varName], varName);
	}
	return importCode;
};

exports.functionDefToCode = functionDefToCode;
exports.variableDefToCode = variableDefToCode;
exports.buildModuleCode = buildModuleCode;
