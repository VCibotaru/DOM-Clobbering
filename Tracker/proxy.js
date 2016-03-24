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

// proxy[untaintedObjectNamesKey] == the set of the properties of the object
// that are not tainted (e.g., they were assigned after the initial taint of the object)
var untaintedObjectNamesKey = '__untainted_objects__'; 

// proxy[wrappedObjectKey] == the object wrapped by the proxy
var wrappedObjectKey = '__wrapped_object__';

// proxy[proxyTypeKey] == the type of the proxy (e.g., StringProxy, NumberProxy, ...)
var proxyTypeKey = '__proxy_type__';
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
		return tmp.map(function(obj) {return obj[objectNameKey];});
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
 * Returns a proxy constructor corresponding to object's type.
 * @function getProxyConstructorForObject
 * @param {Object} obj - The object.
 * @return A constructor or a trivial function that returns undefined.
 */
var getProxyConstructorForObject = function(obj) {
	let actions = {
		'string': StringProxy,
		'object': ObjectProxy,
		'undefined': function() {return undefined;},
		'number': NumberProxy,
		'boolean': BooleanProxy,
		'null': function() {return null;},
		'function': FunctionProxy,
	};
	let type = typeof obj;
	if (type in actions) {
		return actions[type];
	}
	throw 'Unknown type in BaseHandler.get(): ' + type;
};

/**
 * Creates a proxy of one of the special types (StringProxy, ...)
 * depending on the object's type.
 * @function buildProxy
 * @param {Object} obj - The object to be wrapped with a proxy.
 * @param {String} name - See proxy[objectNameKey].
 * @return - A proxy object.
 */
var buildProxy = function(obj, name) {
	// return different proxies depending on the object type
	let proxyConstructor = getProxyConstructorForObject(obj);
	return proxyConstructor(obj, name);
};

/**
 * Creates a handler for a proxy.
 * @function HandlerFactory
 * @param {Object} customActions - The object that stores key-value pairs of form
 * {name:action}, where action is a function that shall be called in the proxy's getter
 * for the property with corresponding name.
 * @return Proxy handle
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler | handlers}
 */
var HandlerFactory = function(customActions) {

	let handler = {
		get: function(target, name, receiver) {
				 // call the custom action if specified
				 if (customActions.hasOwnProperty(name)) {
					 return customActions[name]();
				 }
				 // the following properties correspond to metadata stored on object
				 let metanames = [objectNameKey, untaintedObjectNamesKey, wrappedObjectKey];
				 if (metanames.indexOf(name) !== -1) {
					 return target[name];
				 }
				 // if toString or valueOf methods are called, then we need to 
				 // pass the call to the primitive value stored, not to the wrapper
				 if (name === 'toString' || name === 'valueOf') {
					 let obj = getWrappedObject(target);
					 let val = obj[name](); 
					 return function() {return val;};
				 }
				 // the following properties correspond to object's data

				 // if target[name] is untainted then return it
				 if (target[untaintedObjectNamesKey].has(name)) {
					 return target[name];
				 }
				 // else wrap it in a proxy, and return the proxy
				 let newName = target[objectNameKey] + '.' + name;
				 return buildProxy(target[name], newName);
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
				 target[property] = value;
			 },
		apply: function(target, thisArg, argsList) {
				   let result = target.apply(thisArg, argsList);
				   // HERE we always taint the result.
				   // However, there is another option: to not do this and let the 
				   // code itself taint the result or not.
				   let proxyConstructor = getProxyConstructorForObject(result);
				   // TODO:
				   // let objName = `${target[objectNameKey]}.apply(${thisArg},${argsList})`;
				   let objName = `${target[objectNameKey]}.apply()`;
				   let proxy = proxyConstructor(result, objName);
				   return proxy;
			   }			

	};
	return handler;
};

/**
 * A factory for proxy creation.
 * @function ProxyFactory
 * @param {Function} objectConstructor - The function that constructs a wrapper for 
 * the object, if the object is of a primitive type (string, number, boolean).
 * Else it may just return the object unmodified.
 * @param {Object} customActions - The custom actions needed for proxy handler's 
 * get function. See {@link HandlerFactory}.
 * @return A function that when called returns the needed proxy object.
 */
var ProxyFactory = function(objectConstructor, customActions) {
	let proxyBuilder = function(object, name) {
		let objectWrapper = objectConstructor(object);
		let handler = HandlerFactory(customActions);

		// do the objectWrapper initialization
		objectWrapper[objectNameKey] = name;
		objectWrapper[untaintedObjectNamesKey] = new Set();
		objectWrapper[wrappedObjectKey] = object;

		//TODO: add some more custom fields initialization
		let pr = new Proxy(objectWrapper, handler);
		storage.addTaintedObject(pr);
		return pr; 
	};
	return proxyBuilder;
};

/**
 * A constructor of proxies for string primitive values.
 * It wraps the primitive value inside a String object.
 * This is needed because the proxies can't be used with primitive values.
 * @function StringProxy.
 */
var StringProxy = ProxyFactory(
		// TODO: change the toString implementation to make eval() work
		function(string) {return new String(string);},
		{proxyTypeKey: 'string'}
		);

/**
 * A constructor of proxies for values of the Object type.
 * @function ObjectProxy
 */
var ObjectProxy = ProxyFactory(
		function(object) {return object;},
		{proxyTypeKey: 'object'}
);

/**
 * A constructor of proxies for number primitive values.
 * It wraps the primitive value inside a Number object.
 * This is needed because the proxies can't be used with primitive values.
 * @function NumberProxy.
 */
var NumberProxy = ProxyFactory(
		function(number) {return new Number(number);},
		{proxyTypeKey: 'number'}
		// TODO: work on number here
);

/**
 * A constructor of proxies for boolean primitive values.
 * It wraps the primitive value inside a Boolean object.
 * This is needed because the proxies can't be used with primitive values.
 * @function BooleanProxy.
 */
var BooleanProxy = ProxyFactory(
		function(bool) {return new Boolean(bool);},
		{proxyTypeKey: 'boolean'}
		// TODO: work on bools here
);

var FunctionProxy = ProxyFactory(
		function(func) {return func;},
		{proxyTypeKey: 'function'}
);

/**
 * Return the wrapped object from a proxy.
 * If the proxy is wrapped around a primitive value then it returns the primitive value.
 * @function
 * @param {proxy} pr - the proxy
 * @return The wrapped object or value. 
 */
var getWrappedObject = function(pr) {
	let isPrimitive = (['string', 'number', 'boolean'].indexOf(pr[proxyTypeKey]) !== -1);
	if (isPrimitive === false) {
		return pr[wrappedObjectKey];
	}
	// if proxy wraps an object that wraps a primitive value then return the value
	return pr[wrappedObjectKey].valueOf();
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
	"proxyTypeKey",
];
var funcImports = [
	"ProxyStorage",
	"getProxyConstructorForObject",
	"buildProxy",
	"HandlerFactory",
	"ProxyFactory",
	"getWrappedObject",
];

for (let i of stringImports) {
	importCode += variableDefToCode(this[i], i);
}

for (let i of funcImports) {
	importCode += functionDefToCode(this[i], i);
}

importCode += "var storage = new ProxyStorage();";
importCode += "" + 
"var StringProxy = ProxyFactory(" +
"function(string) {return new String(string);}," +
"{proxyTypeKey: 'string'}" +
");" +
"var ObjectProxy = ProxyFactory(" +
"function(object) {return object;}," +
"{proxyTypeKey: 'object'}" +
");" +
"var NumberProxy = ProxyFactory(" +
"function(number) {return new Number(number);}," +
"{proxyTypeKey: 'number'}" +
");" +
"var BooleanProxy = ProxyFactory(" +
"function(bool) {return new Boolean(bool);}," +
"{proxyTypeKey: 'boolean'}" +
");" +
"var FunctionProxy = ProxyFactory(" +
"function(func) {return func;}," +
"{proxyTypeKey: 'function'}" +
");"; 

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
