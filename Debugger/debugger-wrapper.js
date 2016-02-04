require('Debugger/debugger').addDebuggerToGlobal(this);

var dbg = new Debugger();
dbg.onDebuggerStatement = function (frame) {
    console.log('hit debugger statement; x = ' + frame.eval('x').return);
}
