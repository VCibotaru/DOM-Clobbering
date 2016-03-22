var TestCase = require('./tests').TestCase;
var rewrite = require('rewriter').rewrite;
var proxy = require('proxy');

var cleanup = proxy.clearTaintedObjects;

require('mocks').mapMocksToObject(this);
var typeofTest = new TestCase(
		'Typeof rewriting',
		function() {
			var code = "" +
			"(function() {" +
			"var objProxy  = proxy.buildProxy({});" +
			"var strProxy  = proxy.buildProxy('a');" +
   			"var numProxy  = proxy.buildProxy(1);" +
			"var boolProxy = proxy.buildProxy(true);" +
			"var funcProxy = proxy.buildProxy(function(){});" + 
			"var o = typeof objProxy;" +
			"var s = typeof strProxy;" +
			"var n = typeof numProxy;" +
			"var b = typeof boolProxy;" +
			"var f = typeof funcProxy;" +
			"var O = typeof {};" +
			"var S = typeof 'a';" + 
			"var N = typeof 1;" +
			"var B = typeof true;" +
			"var F = typeof function(){};" +
			"return [o, s, n, b, f, O, S, N, B, F];" +
			"})();";
			var newCode = rewrite(code);
			return eval(newCode); 
		},
		['object', 'string', 'number', 'boolean', 'function',
		 'object', 'string', 'number', 'boolean', 'function'],
		cleanup
);	

var tripleEqualTest = new TestCase(
		'Triple equal rewriting',
		function() {
			var code = "" +
			"(function() {" +
			"var objProxy  = proxy.buildProxy({});" +
			"var strProxy  = proxy.buildProxy('a');" +
   			"var numProxy  = proxy.buildProxy(1);" +
			"var boolProxy = proxy.buildProxy(true);" +
			"var funcProxy = proxy.buildProxy(function(){});" + 
			"var O = {};" +
			"var S = 'a';" + 
			"var N = 1;" +
			"var B = true;" +
			"var F = function(){};" +
			"var o = (objProxy === O);" +  
			"var s = (strProxy === S);" +
			"var n = (numProxy === N);" +
			"var b = (boolProxy === B);" +
			"var f = (funcProxy === F);" +
			"var o1 = ({} === {});" +
			"var s1 = ('str' === 'str');" + 
			"var n1 = (1 === 1);" + 
			"var b1 = (true === true);" +
			"return [o, s, n, b, f, o1, s1, n1, b1];" + 
			"})();";
			var newCode = rewrite(code);
			return eval(newCode); 
		},
		[false, true, true, true, false, false, true, true, true],
		cleanup
);

exports.tests = [typeofTest, tripleEqualTest];
exports.testSuite = 'Rewriting test suite';
