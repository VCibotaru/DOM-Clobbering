/**
 * @module tracker
 */

var DebuggerWrapper = require('debugger-wrapper').DebuggerWrapper;
var config = require('config');
var	logger = require('logger');
// var proxy = require('proxy');
var tainter = require('tainter');
var replacer = require('replacer');
var mocks = require('mocks');

var rewritePrototypes = require('prototype-rewriter');
/**
 * Tracks the creation of required element and links the Debugger with the Tainter.
 * @constructor
 * @param {window} win - The global window object.
 * @property {window} win - The global window object.
 * @property {DebuggerWrapper} dbg - An instance of the debugger.
 * @property {boolean} elementCreated - True if needed HTML element is already created.
 */
var Tracker = function(win) {
	this.win = win;
	this.initBrowserContext();

	this.dbg = new DebuggerWrapper(this, win);
	this.dbg.addDebuggee(win);	
	
	this.elementCreated = false;
	this.taintStarted = false;
};

Tracker.prototype.initBrowserContext = function() {
	this.win.eval(this.markFrameCode(tainter.importCode));
	this.win.eval(this.markFrameCode(replacer.importCode));
	this.win.eval(this.markFrameCode(mocks.importCode));
	this.win.eval(this.markFrameCode("this.mapMocksToObject(this);"));
	// this.win.eval(this.markFrameCode(rewritePrototypes.importCode));
	// this.win.eval(this.markFrameCode("this.rewritePrototypes(this);"));
};

/**
 * Returns the results of taint analysis.
 * @method
 * @this Tracker
 * @return - an array of tainted names
 */
Tracker.prototype.getResults = function() {
	let code = this.markFrameCode('storage.getTaintedNames()');
	let result = this.win.eval(code);
	let names = Set(result);
	if (names.size === 0) {
		return 'No tainted objects!';
	}
	let str = 'Tainted objects:\n';
	for (let name of names) {
		str += name + '\n';
	}
	str += '===============================';
	return str;	
};

var mockFunctionKey = require('mocks').mockFunctionKey;
/**
 * Checks that the frame represents a mocked function.
 * @function isFrameMocked
 * @param {object} frame - the frame
 * @return - a boolean value
 */
var isFrameMocked = function(frame) {
	let isMock = (frame.type === 'call');
	if (isMock) {
		let prop = frame.callee.getOwnPropertyDescriptor(mockFunctionKey);
		let value = (prop === undefined) ? false : prop.value;
		isMock = isMock && value;
	}
	return isMock;
};

/**
 * Checks if a frame's text should be rewritten.
 * A frame text should NOT be rewritten in two cases:
 * 1. it is already marked as rewritten
 * 2. it is a mock function (see mocks module)
 * 3. the taint analysis wasn't started yet
 * @method
 * @this Tracker
 * @param {object} frame - the frame.
 * @return - a boolean value
 */
Tracker.prototype.shouldRewriteFrame = function(frame) {
	let shouldNotTaint = (this.shouldTaint() !== true);
	let isMock = (isFrameMocked(frame) === true);
	let source = frame.script.source.text;
	let isMarked = (this.isFrameCodeMarked(source) === true);
	return ((isMock || isMarked || shouldNotTaint) === false);
};

/**
 * Checks that the required HTML was created.
 * @method
 * @this Tracker
 * @return - a boolean value.
 */
Tracker.prototype.isElementCreated = function() {
	if (config.xpath) {
		let res = (this.win.document.evaluate(config.xpath, this.win.document, null,
				   XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
		return res !== null;
	}
	return true;
};

/**
 * Checks that the taint process should be started.
 * This is true only for the first frame in which the needed HTML elemenet is live.
 * @method
 * @this Tracker
 * @return - a boolean value
 */ 

Tracker.prototype.shouldStartTaint = function() {
	if (config.taintAtStart) {
		return (this.taintStarted === false);
	} 
	return (this.taintStarted === false && this.isElementCreated() === true);
};

/**
 * Checks that the taint should be propagated.
 * This is true in every frame since the creation of the HTML element.
 * @method
 * @this Tracker
 * @return - a boolean value
 */
Tracker.prototype.shouldTaint = function() {
	if (config.taintAtStart === true) {
		return true;
	}
	this.elementCreated = this.elementCreated || (this.isElementCreated() === true);
	return this.elementCreated;
};

var SECRET_TOKEN = '/* super_secret_token_16138153875123 */';
/**
 * Marks frame code, so it can be distinguished from native code.
 * We need this because of frame code rewritting (see DebuggerWrapper.onEnterFrame)
 * @method
 * @param {string} code - the code
 * @return - the marked version of code
 */
Tracker.prototype.markFrameCode = function(code) {
	return SECRET_TOKEN + code;
};

/**
 * Check if the given code is marked.
 * @method
 * @param {string} code - the code
 * @return - a boolean value
 */
Tracker.prototype.isFrameCodeMarked = function(code) {
	return (code.indexOf(SECRET_TOKEN) === 0);
};

/**
 * Starts the taint process by replacing the HTML element with a proxy
 * @method
 * @this Tracker
 */

Tracker.prototype.startTaint = function() {
	this.taintStarted = true;
	let name = config.elementName;
	let code;
	if (config.taintStartCode) {
		code = config.taintStartCode;
	} else {
		let xpath = config.xpath;
		code = "" +
			"var element = document.evaluate('" + 
			xpath +
			"' , document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;" +
			"element.name = '" + name + "';" + 
			"element = taint(element, '" + name + "');" +
			"";	
	}
	logger.debugLog('Code executed at start of taint:');
	logger.debugLog(code);
	
	code = this.markFrameCode(code);	
	this.win.eval(code);
};


/** The Tracker class*/
exports.Tracker = Tracker;
