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
	this.win.eval(proxy.importCode);
	this.win.eval(replacer.importCode);
	this.win.eval(mocks.importCode);
	this.win.eval("mapMocksToObject(this);");
};

/**
 * Gets called when the Tracker finishes its work.
 * @method
 */
Tracker.prototype.endCallback = function() {
	logger.debugLog('Tracker finished');
};

Tracker.prototype.isElementCreated = function() {
	this.elementCreated = this.elementCreated || (this.win.document.forms[1] !== undefined);
	return this.elementCreated;
};

Tracker.prototype.shouldRewriteFrame = function() {
	return this.isElementCreated();
};


/** The Tracker class*/
exports.Tracker = Tracker;
