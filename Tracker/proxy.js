/**
 * @module proxy
 */
var stringValueKey = '__string_value_key';
var objectNameKey = '__object_descriptor_key';

/**
 * A class for storing the results of the tainting.
 * @constructor
 */
var ProxyStorage = function() {
	this.tainted = [];
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
		this.tainted.push(obj);
	};

	/**
	 * Checks whether the object is stored.
	 * @method
	 * @param {Object} object - The object to be checked.
	 * @this ProxyStorage
	 * @return boolean
	 */
	ProxyStorage.prototype.isObjectTainted = function(obj) {
		return this.tainted.indexOf(obj) !== -1;
	};

	/**
	 * Get the array of names of all tainted objects.
	 * @method
	 * @this ProxyStorage
	 * @return Array
	 */
	ProxyStorage.prototype.getTaintedNames = function() {
		return this.tainted.map(function(obj) {return obj[objectNameKey];});
	};

	/**
	 * Clears the set of tainted objects.
	 * @method
	 * @this ProxyStorage
	 */
	ProxyStorage.prototype.clearTaintedObjects = function() {
		this.tainted = [];
	};
};

var storage = new ProxyStorage();

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
				 // this property corresponds to the name of object given by the tainting system
				 if (name === objectNameKey) {
					 return target[objectNameKey];
				 }
				 if (name === 'toString') {
					 return function(){return 'Tainted Proxy Object';};
				 }
				 if (name === 'valueOf') {
					 return target.toString;
				 }
				 let objectName = target[objectNameKey] + '.' + name;
				 let actions = {
					 'string': function() {return StringProxy(target[name], objectName);},
					 'object': function() {return ObjectProxy(target[name], objectName);},
					 'undefined': function() {return undefined;},
					 'number': function() {return NumberProxy(target[name], objectName);},
					 // boolean
					 // null
					 // function
				 };
				 // return different proxies depending on the property type
				 let type = typeof target[name];
				 if (type in actions) {
					 return actions[type]();
				 }
				 throw 'Unknown type in BaseHandler.get()';
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
exports.storage = storage;
exports.importCode = importCode;
