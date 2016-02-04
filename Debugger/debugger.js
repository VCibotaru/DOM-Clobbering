const { Cc, Ci, Cu, Cr } = require('chrome');
Cu.import("resource://gre/modules/jsdebugger.jsm");
addDebuggerToGlobal(this);
module.exports = Debugger;
module.exports.addDebuggerToGlobal = addDebuggerToGlobal;