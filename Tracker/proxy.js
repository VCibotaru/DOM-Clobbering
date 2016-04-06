/**
 * This module contains different proxies objects.
 * See {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy}
 * @module proxy
 */

// proxy[stringValueKey] == the string value of the wrapped object
var stringValueKey = '__string_value__';

// proxy[objectNameKey] == the string identifier assigned by the tainting
// system to the wrapped object

var objectNameKey = '__object_name__';

/**
 * Returns the name of the object assigned by the tainting system
 * @function getTaintedName
 * @param {object} obj - the proxy
 * @return - the name of the wrapped object
 */
var getTaintedName = function(obj) {
	return obj[objectNameKey];
};

// proxy[untaintedObjectNamesKey] == the set of the properties of the object
// that are not tainted (e.g., they were assigned after the initial taint of the object)
var untaintedObjectNamesKey = '__untainted_objects__'; 

// proxy[wrappedObjectKey] == the object wrapped by the proxy
var wrappedObjectKey = '__wrapped_object__';

/**
 * A class for storing the results of the tainting.
 * @constructor
 */
var ProxyStorage = function() {
	this.tainted = Set(); 
	// all the following methods are included directly in the 
	// constructor to allow a more easy obtaining of the 
	// function's code as a string

	/**
	 * Adds a tainted object to the storage.
	 * @method
	 * @param {Object} object - The object to be stored.
	 * @this ProxyStorage
	 */
	ProxyStorage.prototype.addTaintedObject = function(obj) {
		this.tainted.add(obj);
	};

	/**
	 * Checks whether the object is stored.
	 * @method
	 * @param {Object} object - The object to be checked.
	 * @this ProxyStorage
	 * @return boolean
	 */
	ProxyStorage.prototype.isObjectTainted = function(obj) {
		return this.tainted.has(obj);
	};

	/**
	 * Get the array of names of all tainted objects.
	 * @method
	 * @this ProxyStorage
	 * @return Array
	 */
	ProxyStorage.prototype.getTaintedNames = function() {
		let tmp = Array.from(this.tainted);
		return tmp.map(getTaintedName);
	};

	/**
	 * Clears the set of tainted objects.
	 * @method
	 * @this ProxyStorage
	 */
	ProxyStorage.prototype.clearTaintedObjects = function() {
		this.tainted = Set();
	};
};

var storage = new ProxyStorage();

/**
 * Creates a proxy object.
 * To add a workaround for non-configurable and non-writable 
 * properties handling, the proxy is wrapped around a dummy 
 * shadow object (see {@link https://github.com/tvcutsem/harmony-reflect/issues/25}).
 * @function buildProxy
 * @param {Object} obj - The object to be wrapped with a proxy.
 * @param {String} name - See proxy[objectNameKey].
 * @return - A proxy object.
 */
var buildProxy = function(object, name) {
	// let objectWrapper = objectConstructor(object);
	let objectWrapper = {};
	if (typeof object === 'function') {
		// If the object is a function, then the proxy is wrapped around it,
		// not the shadow object.
		// This is done for keeping the proxy object callable. If we will do
		// something like proxy = Proxy({}, handler), then the code "proxy()"
		// will raise a "Not a function error". Another workaround would be
		// to try to make the {} object callable, but it appears not possible. 
		// The downside of our approach is that we will be able to return 
		// wrapped non-configurable and non-writable properties for function
		// objects. There is only two of them actually (name and length).
		objectWrapper = object;
	}
	let handler = buildHandler();

	// do the objectWrapper initialization
	objectWrapper[objectNameKey] = name;
	objectWrapper[untaintedObjectNamesKey] = new Set();
	objectWrapper[wrappedObjectKey] = object;

	//TODO: add some more custom fields initialization
	let proxy = new Proxy(objectWrapper, handler);
	storage.addTaintedObject(proxy);
	return proxy; 
};

/**
 * Creates a handler for a proxy.
 * @function buildHandler
 * @param {Object} customActions - The object that stores key-value pairs of form
 * {name:action}, where action is a function that shall be called in the proxy's getter
 * for the property with corresponding name.
 * @return Proxy handle
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler | handlers}
 */
var buildHandler = function() {
	let handler = {
		get: function(target, name, receiver) {
			// the following properties correspond to metadata stored on object
			let metanames = [objectNameKey, untaintedObjectNamesKey, wrappedObjectKey];
			if (metanames.indexOf(name) !== -1) {
				return target[name];
			}
			let wrappedObject = getWrappedObject(target);
			// if toString or valueOf methods are called, then we need to 
			// pass the call to the primitive value stored, not to the wrapper
			if (name === 'toString' || name === 'valueOf') {
				let val = wrappedObject[name](); 
				return function() {return val;};
			}
			// the following properties correspond to object's data
			
			// if target[name] is untainted then return it
			if (target[untaintedObjectNamesKey].has(name)) {
				return wrappedObject[name];
			}
			// else wrap it in a proxy, and return the proxy
			let newName = getTaintedName(target) + '.' + name;
			
			// if property is not configurable and not writable,
			// then some more black magic is needed
			let pd = Object.getOwnPropertyDescriptor(wrappedObject, name);
			if (pd !== undefined && !pd.configurable && !pd.writable) {
				if (typeof wrappedObject === 'function') {
					// if the wrappedObject is a function, then return
					// non-wrapped value of the property.
					// See buildProxy code for explanation.
					return wrappedObject[name];
				}

				// see buildProxy comment for explanation of the code below
				Object.defineProperty(target, name, {
					value: buildProxy(wrappedObject[name], newName),
					writable: false,
					configurable: false,
					enumerable: pd.enumerable
				});
				return target[name];
			}
			return buildProxy(wrappedObject[name], newName);
		},
		set: function(target, property, value, receiver) {
			if (storage.isObjectTainted(value) === false) {
				// if value is not tainted
				target[untaintedObjectNamesKey].add(property);
			}
			else {
				// if value is tainted
				target[untaintedObjectNamesKey].delete(property);
			}
			let wrappedObject = getWrappedObject(target);
			wrappedObject[property] = value;
		},
		apply: function(target, thisArg, argsList) {
			let wrappedObject = getWrappedObject(target);
			let result = wrappedObject.apply(thisArg, argsList);
			// HERE we always taint the result.
			// However, there is another option: to not do this and let the 
			// code itself taint the result or not.
			// TODO:
			// let objName = `${target[objectNameKey]}.apply(${thisArg},${argsList})`;
			let objName = `${target[objectNameKey]}.apply()`;
			let proxy = buildProxy(result, objName);
			return proxy;
		},
		has: function(target, prop) {
			let wrappedObject = getWrappedObject(target);
			return prop in wrappedObject;
		}

	};
	return handler;
};

/**
 * Return the wrapped object from a proxy.
 * If the proxy is wrapped around a primitive value then it returns the primitive value.
 * @function
 * @param {proxy} pr - the proxy
 * @return The wrapped object or value. 
 */
var getWrappedObject = function(pr) {
	return pr[wrappedObjectKey];
};

var variableDefToCode = require('misc').variableDefToCode;
var functionDefToCode = require('misc').functionDefToCode;

// the code which if evaled imports the whole module
var importCode = "";
var stringImports = [
	"stringValueKey", 
	"objectNameKey", 
	"untaintedObjectNamesKey",
	"wrappedObjectKey",
];
var funcImports = [
	"ProxyStorage",
	"buildProxy",
	"buildHandler",
	"getWrappedObject",
	"getTaintedName",
];

for (let i of stringImports) {
	importCode += variableDefToCode(this[i], i);
}

for (let i of funcImports) {
	importCode += functionDefToCode(this[i], i);
}

importCode += "var storage = new ProxyStorage();";
importCode += "" +
"var isObjectTainted = ProxyStorage.prototype.isObjectTainted.bind(storage);" +
"var clearTaintedObjects = ProxyStorage.prototype.clearTaintedObjects.bind(storage);" +
"var getTaintedNames = ProxyStorage.prototype.getTaintedNames.bind(storage);" +
"";

exports.importCode = importCode;


exports.getWrappedObject = getWrappedObject;
exports.buildProxy = buildProxy;
exports.isObjectTainted = ProxyStorage.prototype.isObjectTainted.bind(storage);
exports.clearTaintedObjects = ProxyStorage.prototype.clearTaintedObjects.bind(storage);
exports.getTaintedNames = ProxyStorage.prototype.getTaintedNames.bind(storage);
exports.getTaintedName = getTaintedName;
