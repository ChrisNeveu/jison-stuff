var jison = require("jison");
var sourceMap = require("source-map");
var lex = require("./rpn/lex");
var bnf = require("./rpn/bnf");

console.log(bnf);
var parser = new jison.Parser({
	lex: lex,
	bnf: bnf
});
console.log(bnf);

var getPreamble = function () {
	return new sourceMap.SourceNode(null, null, null, "")
		.add("var __rpn = {};\n")
 
		.add("__rpn.print = function (val, repeat) {\n")
		.add("  var it = repeat;")
		.add("  while (it-- > 0) {\n")
		.add("    console.log(val);\n")
		.add("  }\n")
		.add("};\n");
};

exports.compile = function(input, data) {
	var expressions = parser.parse(input.toString());
	var preamble = getPreamble();

	var result = new sourceMap.SourceNode(null, null, null, preamble);
	result.add(expressions.map(function(exp) {
		return exp.compile(data);
	}));
	return result;
};