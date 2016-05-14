
/**
 * A class for storing the results of the tainting.
 * @constructor
 */
var TaintedStorage = function() {
	this.tainted = Set(); 
	// all the following methods are included directly in the 
	// constructor to allow a more easy obtaining of the 
	// function's code as a string

	/**
	 * Adds a tainted object to the storage.
	 * @method
	 * @param {Object} object - The object to be stored.
	 * @this TaintedStorage
	 */
	TaintedStorage.prototype.addTaintedObject = function(obj) {
		this.tainted.add(obj);
	};

	/**
	 * Checks whether the object is stored.
	 * @method
	 * @param {Object} object - The object to be checked.
	 * @this TaintedStorage
	 * @return boolean
	 */
	TaintedStorage.prototype.isObjectTainted = function(obj) {
		return this.tainted.has(obj);
	};

	/**
	 * Get the array of names of all tainted objects.
	 * @method
	 * @this TaintedStorage
	 * @return Array
	 */
	TaintedStorage.prototype.getTaintedNames = function() {
		let tmp = Array.from(this.tainted);
		return tmp.map(getTaintedName);
	};

	/**
	 * Clears the set of tainted objects.
	 * @method
	 * @this TaintedStorage
	 */
	TaintedStorage.prototype.clearTaintedObjects = function() {
		this.tainted = Set();
	};
};

var storage = new TaintedStorage();

var isObjectTaintedKey = '__is_tainted__';
var taintedNameKey = '__tainted_name__';
var isWrapperKey = '__is_wrapper__';
var wrappedObjectKey = '__wrapped_object__';

var taint = function(obj, name) {
	if (obj === undefined || obj === null) {
		console.log('Tried to access an invalid value: ' + name + ' is ' + obj);
		return obj;
	}	   
	if (isObjectTainted(obj)) {
		return obj;
	}
	types = {
		'string'  : String,
		'number'  : Number,
		'boolean' : Boolean,
	};
	let oldObj = obj;
	if ((typeof obj) in types) {
		obj = new types[typeof obj](obj);
		obj[isWrapperKey] = true;
		obj[wrappedObjectKey] = oldObj;
	}
	obj[isObjectTaintedKey] = true;
	obj[taintedNameKey] = name;
	storage.addTaintedObject(obj);
	return obj;
};

var isObjectTainted = function(obj) {
	if (obj === undefined || obj === null) {
		return false;
	}
	return (obj[isObjectTaintedKey] === true);
};

var isWrapper = function(obj) {
	return (obj[isWrapperKey] === true);
};

var getTaintedName = function(obj) {
	return obj[taintedNameKey];
};

var getWrappedObject = function(obj) {
	if (isWrapper(obj) === false) {
		return obj;
	}
	return obj[wrappedObjectKey];
};

importFuncs = [
	'TaintedStorage',
	'taint',
	'isObjectTainted',
	'isWrapper',
	'getTaintedName',
	'getWrappedObject',
];

importStrings = [
	'isObjectTaintedKey',
	'isWrapperKey',
	'taintedNameKey',
	'wrappedObjectKey',
];

var importCode = require('misc').buildModuleCode(this, importFuncs, importStrings);
importCode += "var storage = new TaintedStorage();";
importCode += "" +
"var clearTaintedObjects = TaintedStorage.prototype.clearTaintedObjects.bind(storage);" +
"var getTaintedNames = TaintedStorage.prototype.getTaintedNames.bind(storage);" +
"";

exports.storage = storage;

exports.taint = taint;
exports.isObjectTainted = isObjectTainted;
exports.isWrapper = isWrapper;
exports.getTaintedName = getTaintedName;
exports.getWrappedObject = getWrappedObject;

exports.clearTaintedObjects = TaintedStorage.prototype.clearTaintedObjects.bind(storage);
exports.getTaintedNames = TaintedStorage.prototype.getTaintedNames.bind(storage);

exports.importCode = importCode;
