var TestCase = require('./tests').TestCase;
var rewrite = require('rewriter').rewrite;


require('mocks').mapMocksToObject(this);
var typeofTest = new TestCase(
		'Typeof rewriting',
		function() {
			var objProxy  = this.taint({});
			var strProxy  = this.taint('a');
   			var numProxy  = this.taint(1);
			var boolProxy = this.taint(true);
			var funcProxy = this.taint(function(){});
			var code = "" +
			"(function() {" +
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
		 'object', 'string', 'number', 'boolean', 'function']
);	

var tripleEqualTest = new TestCase(
		'Triple equal rewriting',
		function() {
			var objProxy  = this.taint({});
			var strProxy  = this.taint('a');
   			var numProxy  = this.taint(1);
			var boolProxy = this.taint(true);
			var funcProxy = this.taint(function(){});
			var code = "" +
			"(function() {" +
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
		[false, true, true, true, false, false, true, true, true]
);

var memberFunctionsTest = new TestCase(
	   'Member function rewriting',
		function() {
	 		let code = "" +
			"var a = 'string'.slice(1, 3).slice(1);" +
			"var obj = {'f': function(){return this.asd;}, 'asd': 'asd'};" +
			"var b = obj.f();" +
			"var func = obj.f;" +
			"var c = func(); " +
			"var func = func.bind(obj);" +
			"var d = func();" + 
			"";
			eval(rewrite(code));
			return (__triple_equal__(a, 'r') && __triple_equal__(b, 'asd') &&
					__triple_equal__(c, undefined) && __triple_equal__(d, 'asd'));
		},
		true
);


exports.tests = [typeofTest, tripleEqualTest, memberFunctionsTest];
exports.testSuite = 'Rewriting test suite';
