/**
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
				 if (name in customActions) {
					 return customActions[name]();
				 }
				 // the following properties correspond to metadata stored on object
				 if (name === objectNameKey) {
					 return target[objectNameKey];
				 }
				 if (name == untaintedObjectNamesKey) {
					 return target[untaintedObjectNamesKey];
				 }
				 if (name === 'toString') {
					 return function(){return 'Tainted Proxy Object';};
				 }
				 if (name === 'valueOf') {
					 return target.toString;
				 }
				 // the following properties correspond to object's data

				 // if target[name] is untainted then return it
				 if (target[untaintedObjectNamesKey].has(name)) {
					 return target[name];
				 }
				 // else wrap it in a proxy, and return the proxy
				 let objectName = target[objectNameKey] + '.' + name;
				 // return different proxies depending on the property type
				 let proxyConstructor = getProxyConstructorForObject(target[name]);
				 return proxyConstructor(target[name], objectName);
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
		{}
		);

/**
 * A constructor of proxies for values of the Object type.
 * @function ObjectProxy
 */
var ObjectProxy = ProxyFactory(
		function(object) {return object;},
		{}
);

var NumberProxy = ProxyFactory(
		function(number) {return new Number(number);},
		{}
		// TODO: work on number here
);

var BooleanProxy = ProxyFactory(
		function(bool) {return new Boolean(bool);},
		{}
		// TODO: work on bools here
);

var FunctionProxy = ProxyFactory(
		function(func) {return func;},
		{}
);
// the code which if evaled import this module
var importCode = "" +
"var stringValueKey = '__string_value_key';" + 
"var objectNameKey = '__object_descriptor_key';" +
"var ProxyStorage = " + ProxyStorage + ";" + 
"var storage = new ProxyStorage();" +
"var HandlerFactory = " + HandlerFactory + ";" +
"var ProxyFactory = " + ProxyFactory + ";" +
"var StringProxy = ProxyFactory(function(string){return new String(string);}, {});" +
"var ObjectProxy = ProxyFactory(function(object){return object;}, {}); "; 

exports.StringProxy = StringProxy;
exports.ObjectProxy = ObjectProxy;
exports.NumberProxy = NumberProxy;
exports.BooleanProxy = BooleanProxy;
exports.storage = storage;
exports.importCode = importCode;

exports.stringValueKey = stringValueKey;
exports.objectNameKey = objectNameKey;
exports.untaintedObjectNamesKey = untaintedObjectNamesKey;
