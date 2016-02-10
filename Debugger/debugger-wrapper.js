/**
 * @module debugger
 */
require('debugger').addDebuggerToGlobal(this);

var logger = require('logger');
/**
 * A wrapper for the debugger provided my Mozilla.
 * @constructor
 * @param {Tracker} tracker - The instance of Tracker that created the debugger.
 * @property {Tracker} tracker - The instance of Tracker that created the debugger.
 * @property {Debugger} dbg - The debugger.
 */
var DebuggerWrapper = function (tracker) {
	this.tracker = tracker;
    this.dbg = new Debugger();

	// Save a pointer to this. It'll be used later.
	var self = this;

	// Gets called when debugger enters a new frame
	// Calls DebuggerWrapper.onEnterFrame with this=self.
    this.dbg.onEnterFrame = function(frame) {
		self.onEnterFrame.call(self, frame);
	};
};

/**
 * A wrapper around Debugger.onEnterFrame handler.
 * @method
 * @this DebuggerWrapper
 */
DebuggerWrapper.prototype.onEnterFrame = function(frame) {
	logger.debugLog('Frame Entered');
	// Set wrapper around Debbuger.Frame.onStep handler.
	frame.onStep = this.onStep.bind(this);
};

/**
 * A wrapper around Debugger.Frame.onStep handler. 
 * @method
 */
DebuggerWrapper.prototype.onStep = function() {
	// Check if the needed HTML element is already created.
	let elementCreated = this.tracker.isElementCreated.call(this.tracker);
	if (elementCreated) {
		// do the tainting here
	}

};

DebuggerWrapper.prototype.addDebuggee = function(obj) {
    this.dbg.addDebuggee(obj);
};


/** The DebuggerWrapper class */
exports.DebuggerWrapper = DebuggerWrapper;
