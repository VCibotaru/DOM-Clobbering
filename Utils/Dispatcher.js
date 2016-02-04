var {on, once, off, emit} = require('sdk/event/core');

var dispatcher = {
    on: on.bind(null, this),
    off: off.bind(null, this),
    emit: emit.bind(null, this)
}

exports.dispatcher = dispatcher;
module.exports = dispatcher;
