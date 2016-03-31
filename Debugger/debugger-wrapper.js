/**
 * @module debugger
 */
require('debugger').addDebuggerToGlobal(this);

var logger = require('logger');
var	config = require('config');
var	proxy = require('proxy');

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

	this.dbg.onEnterFrame = DebuggerWrapper.prototype.onEnterFrame.bind(this);

};

/**
 * A wrapper around Debugger.onEnterFrame handler.
 * For some frames (see Tracker.shouldRewriteFrame)
 * rewrites their code. This is done by stopping the
 * execution of current frame, launching its
 * rewritten (and marked) version and returning the
 * result of rewritten version.
 * See resumption values at 
 * {@link https://developer.mozilla.org/en-US/docs/Tools/Debugger-API/Conventions}
 * @method
 * @this DebuggerWrapper
 */
DebuggerWrapper.prototype.onEnterFrame = function(frame) {
	if (this.tracker.shouldStartTaint() === true) {
		// this is the first frame in which the HTML element is live
		// so, here the tainting process should be started
		this.tracker.startTaint();	
	}
	if (this.tracker.shouldRewriteFrame(frame) === true) {
		let source = frame.script.source.text;
		let	newSource = require('rewriter').rewrite(source);
		let markedNewSource = this.tracker.markFrameCode(newSource);
		let res = frame.eval(markedNewSource);
		return res;
	}
};

DebuggerWrapper.prototype.rewriteFrame = function(frame) {
	console.log('should rewrite frame');
};

DebuggerWrapper.prototype.addDebuggee = function(obj) {
	this.dbg.addDebuggee(obj);
};


/** The DebuggerWrapper class */

exports.DebuggerWrapper = DebuggerWrapper;
