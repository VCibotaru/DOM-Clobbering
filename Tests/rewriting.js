var TestCase = require('./tests').TestCase;
var rewrite = require('rewriter').rewrite;
var proxy = require('proxy');

var cleanup = proxy.storage.clearTaintedObjects.bind(proxy.storage);

var typeofTest = new TestCase(
		'Typeof rewriting',
		function() {
			var __typeof__ = require('mocks').__typeof__;
			var code = "" +
			"(function() {" +
			"var objProxy  = proxy.ObjectProxy({});" +
			"var strProxy  = proxy.StringProxy('a');" +
   			"var numProxy  = proxy.NumberProxy(1);" +
			"var boolProxy = proxy.BooleanProxy(true);" +
			"var funcProxy = proxy.FunctionProxy(function(){});" + 
			"var o = typeof objProxy;" +
			"var s = typeof strProxy;" +
			"var n = typeof numProxy;" +
			"var b = typeof boolProxy;" +
			"var f = typeof funcProxy;" +
			"return [o, s, n, b, f];" +
			"})();";
			var newCode = rewrite(code);
			return eval(newCode); 
		},
		['object', 'string', 'number', 'boolean', 'function'],
		cleanup
);	

exports.tests = [typeofTest];
exports.testSuite = 'Rewriting test suite';
