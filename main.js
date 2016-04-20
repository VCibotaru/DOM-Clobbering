require('context-monitor');

var webpage = require('webpage').create();
var	dispatcher = require('dispatcher');
var	config = require('config');
var	logger = require('logger');
var	test = require('test-runner');
var tracker;

webpage.onConsoleMessage = function(message, line, file) {
	red = require('colors').red;
	logger.log(red('message from browser: ' + message));
};

if (config.testMode === true) {
	test.doTest();
	slimer.exit();
}
else {
	var	Tracker = require('tracker').Tracker;
	dispatcher.onWindowCreated(function(win) {
		console.log('new window detected: ' + win.location);
		tracker = new Tracker(win);
	});
	webpage.open(config.url, function() {
		console.log(tracker.getResults());
	});
}
