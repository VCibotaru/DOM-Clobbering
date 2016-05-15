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
	config.checkConfig();
	var	Tracker = require('tracker').Tracker;
	var results = {};
	var mainLoop = function() {
		if (config.setNextName()) {
			logger.log('Trying name: ' + config.getCurrentName());
			webpage.open(config.url, function() {
				console.log(tracker.getResults());
				results[config.getCurrentName()] = tracker.getTaintedNames();
				mainLoop();
			});
		}
		else {
			logger.log('Taint results:');
			for (let name in results) {
				logger.log(name + ': ' + JSON.stringify(results[name]));
			}	
			slimer.exit();
		}
	};
	dispatcher.onWindowCreated(function(win) {
		logger.log('new window detected: ' + win.location);
		tracker = new Tracker(win);
	});
	mainLoop();
}
