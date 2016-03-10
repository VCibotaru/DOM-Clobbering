require('context-monitor');

var webpage = require('webpage').create(),
	dispatcher = require('dispatcher'),
	config = require('config'),
	Tracker = require('tracker').Tracker,
	logger = require('logger'),
	test = require('test-runner');

webpage.onConsoleMessage = function(message, line, file) {
	logger.debugLog('message from browser: ' + message);
};

var testing = true;
if (testing !== true) {
	dispatcher.onWindowCreated(function(win) {
		var tracker = new Tracker(win);
	});
	webpage.open(config.url, function() {});
}
else {
	test.doTest();
}
