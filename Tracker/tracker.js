/**
 * @module tracker
 */

var DebuggerWrapper = require('debugger-wrapper').DebuggerWrapper;
var config = require('config');
var	logger = require('logger');
var proxy = require('proxy');
var replacer = require('replacer');
var mocks = require('mocks');
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
};

Tracker.prototype.initBrowserContext = function() {
	this.win.eval(this.markFrameCode(proxy.importCode));
	this.win.eval(this.markFrameCode(replacer.importCode));
	this.win.eval(this.markFrameCode(mocks.importCode));
	this.win.eval(this.markFrameCode("mapMocksToObject(this);"));
};

/**
 * Gets called when the Tracker finishes its work.
 * @method
 */
Tracker.prototype.endCallback = function() {
	logger.debugLog('Tracker finished');
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
	let shouldTaint = (this.shouldTaint() === true);
	let isMock = (isFrameMocked(frame) === true);
	let source = frame.script.source.text;
	let isMarked = (this.isFrameCodeMarked(source) === true);
	return ((isMock || isMarked || shouldTaint) === false);
};

/**
 * Checks that the required HTML was created.
 * @method
 * @this Tracker
 * @return - a boolean value.
 */
Tracker.prototype.isElementCreated = function() {
	return (this.win.document.forms[1] !== undefined);
};

/**
 * Checks that the taint process should be started.
 * This is true only for the first frame in which the needed HTML elemenet is live.
 * @method
 * @this Tracker
 * @return - a boolean value
 */ 
Tracker.prototype.shouldStartTaint = function() {
	return (this.elementCreated === false && this.isElementCreated() === true);
};

/**
 * Checks that the taint should be propagated.
 * This is true in every frame since the creation of the HTML element.
 * @method
 * @this Tracker
 * @return - a boolean value
 */
Tracker.prototype.shouldTaint = function() {
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


/** The Tracker class*/
exports.Tracker = Tracker;
