/* This module contains ContextMonitor class, which is responsible
 * for monitoring of creation and destruction of contexts
 */

const { Cc, Ci, Cu, Cr } = require('chrome');
Cu.import('resource://gre/modules/Services.jsm');

// observer dependency
var dispatcher = require('dispatcher'),
    eventListenerService = Cc["@mozilla.org/eventlistenerservice;1"].getService(Ci.nsIEventListenerService);

function ContextMonitor() {
    if (ContextMonitor.prototype._instance === null) {
        ContextMonitor.prototype._instance = this;
        return this;
    }
    return ContextMonitor.prototype._instance;
}

ContextMonitor.prototype = (function () {
    var _prototype, _windowUnloadHandler, windows, running, events, observer;

    _prototype = {
        _instance: null
    };
    running = false;
    events = {
        document: {
            LOAD: 'document-element-inserted'
        },
        window: {
            LOAD: 'load',
            CONTENT_LOADED: 'DOMContentLoaded',
            UNLOAD: 'unload',
            BEFORE_UNLOAD: 'beforeunload'
        }
    };
    observer = {
        observe: observe
    };

    // starts the context monitor by registering observe() callback to event
    // 'document-element-inserted'
    // look here: https://developer.mozilla.org/en-US/docs/Observer_Notifications
    function start() {
        var observerService;

        if (!running) {
            windows = new WeakMap();
            observerService = Services.obs;
            running = true;
            observerService.addObserver(
                observer,
                events.document.LOAD,
                false
            );
            _windowUnloadHandler = function (win) {
                contextDestroyed(win);
            };
            dispatcher.on('window.unload', _windowUnloadHandler);
        }
    }

    function stop() {
        var observerService = Services.obs;

        observerService.removeObserver(
            observer,
            events.document.LOAD
        );

        dispatcher.off('window.unload', _windowUnloadHandler);
        running = false;
    }

    // saves the document's window
    // registers the events.window events for the window
    // emits window.created 
    function contextCreated(doc) {
        var win = doc.defaultView;

        if (running && !windows.has(win)) {
            windows.set(win, doc);
            for (let event in events.window) {
                if (events.window.hasOwnProperty(event)) {
                    _addEventListener(win, 'window', events.window[event]);
                }
            }
            dispatcher.emit('window.created', win);
        }
    }

    function contextDestroyed(win) {
        if (running) {
            if (windows.has(win)) {
                dispatcher.emit('window.destroyed', win);
                windows.delete(win);
            }
        }
    }

    // calls contextCreated() after the document's root element was created
    function observe(aSubject, aTopic, aData) {
        if (aTopic === events.document.LOAD && aSubject instanceof HTMLDocument) {
            contextCreated(aSubject);
        }
    }

    function _addEventListener(target, kind, event) {
        eventListenerService.addSystemEventListener(
            target,
            event,
            {
                handleEvent: (function (context) {
                    return function () {
                        dispatcher.emit('window.' + event, context);
                    }
                })(target)
            },
            false
        );
    }

    _prototype.start = start;
    _prototype.stop = stop;
    return _prototype;
})();

var contextMonitor = new ContextMonitor();
contextMonitor.start();

module.exports = contextMonitor;
