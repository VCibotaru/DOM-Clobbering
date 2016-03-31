require('context-monitor');

var webpage = require('webpage').create();
var	dispatcher = require('dispatcher');
var	config = require('config');
var	Tracker = require('tracker').Tracker;
var	logger = require('logger');
var	test = require('test-runner');
var tracker;

webpage.onConsoleMessage = function(message, line, file) {
	logger.debugLog('message from browser: ' + message);
};
if (config.testMode === true) {
	test.doTest();
	slimer.exit();
}
else {
	dispatcher.onWindowCreated(function(win) {
		tracker = new Tracker(win);
	});
	webpage.open(config.url, function() {
		let res = tracker.getResults();
		console.log(res);
	});
}
