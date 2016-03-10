/**
 * @module tracker
 */

var DebuggerWrapper = require('debugger-wrapper').DebuggerWrapper,
	config = require('config'),
	logger = require('logger');

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
	this.dbg = new DebuggerWrapper(this, win);
	this.elementCreated = false;



	this.dbg.addDebuggee(win);	
};

/**
 * Gets called when the Tracker finishes its work.
 * @method
 */
Tracker.prototype.endCallback = function() {
	logger.debugLog('Tracker finished');
};

/**
 * Checks whether the needed HTML element is already created.
 * @method
 * @this Tracker
 */
Tracker.prototype.isElementCreated = function () {
	if (this.elementCreated === true) {
		// if the element was created during previous steps just return true
		return true;
	}
	else if (this.win.document.forms[1] !== undefined) {
		// if the element was created at this step change its name and return true
		this.elementCreated = true;
		return true;

	}
	return false;
};


/** The Tracker class*/
exports.Tracker = Tracker;
