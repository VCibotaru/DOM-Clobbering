require('context-monitor');

var webpage = require('webpage').create(),
    dispatcher = require('dispatcher'),
    config = require('config'),
	Tracker = require('tracker').Tracker;

dispatcher.onWindowCreated(function(win) {
    var tracker = new Tracker(win);
});

webpage.open(config.url, function() {});
