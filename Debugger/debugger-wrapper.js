/**
 * @module debugger
 */
require('debugger').addDebuggerToGlobal(this);

var logger = require('logger'),
	config = require('config'),
	proxy = require('proxy');
/**
 * A wrapper for the debugger provided my Mozilla.
 * @constructor
 * @param {Tracker} tracker - The instance of Tracker that created the debugger.
 * @property {Tracker} tracker - The instance of Tracker that created the debugger.
 * @property {Debugger} dbg - The debugger.
 * @property {Window} win - The window of the page.
 */
var DebuggerWrapper = function (tracker, win) {
	this.tracker = tracker;
	this.dbg = new Debugger();
	this.win = win;

	// Save a pointer to this. It'll be used later.
	var self = this;

	this.elementCreated = false;

	// Gets called when debugger enters a new frame
	// Calls DebuggerWrapper.onEnterFrame with this=self.
	this.dbg.onEnterFrame = function(frame) {
		self.onEnterFrame.call(self, frame);
	};
	this.dbg.onDebuggerStatement = function() {
		var evalResult = this.win.eval('__triple_equal__(1, 1);');
		console.log(evalResult);
	}.bind(this);

};

/**
 * A wrapper around Debugger.onEnterFrame handler.
 * @method
 * @this DebuggerWrapper
 */
DebuggerWrapper.prototype.onEnterFrame = function(frame) {
	this.currentFrame = frame;
	// if (this.tracker.shouldInitContext() === true) {
	// 	this.initBrowserContext();
	// }
	// if (this.tracker.shouldRewriteFrame() === true) {
	// 	this.rewriteFrame(frame);
	// }
};

DebuggerWrapper.prototype.initBrowserContext = function() {
};

DebuggerWrapper.prototype.rewriteFrame = function(frame) {
	console.log('should rewrite frame');
};

DebuggerWrapper.prototype.addDebuggee = function(obj) {
	this.dbg.addDebuggee(obj);
};


/** The DebuggerWrapper class */

exports.DebuggerWrapper = DebuggerWrapper;
