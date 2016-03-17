var TestCase = require('./tests').TestCase;
var rewrite = require('rewriter').rewrite;
var proxy = require('proxy');
var mapMocksToObject = require('mocks').mapMocksToObject;

var cleanup = proxy.storage.clearTaintedObjects.bind(proxy.storage);

mapMocksToObject(this);

var typeofTest = new TestCase(
		'Typeof rewriting',
		function() {
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
			"var O = typeof {};" +
			"var S = typeof 'a';" + 
			"var N = typeof 1;" +
			"var B = typeof true;" +
			"var F = typeof function(){};" +
			"return [o, s, n, b, f, O, S, N, B, F];" +
			"})();";
			var newCode = rewrite(code);
			console.log(newCode);
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
			"var objProxy  = proxy.ObjectProxy({});" +
			"var strProxy  = proxy.StringProxy('a');" +
   			"var numProxy  = proxy.NumberProxy(1);" +
			"var boolProxy = proxy.BooleanProxy(true);" +
			"var funcProxy = proxy.FunctionProxy(function(){});" + 
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
			"return [o, s, n, b, f];" + 
			"})();";
			var newCode = rewrite(code);
			return eval(newCode); 
		},
		[false, true, true, true, false],
		cleanup
);

exports.tests = [typeofTest, tripleEqualTest];
exports.testSuite = 'Rewriting test suite';
