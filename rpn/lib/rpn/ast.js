var SN = require("source-map").sourceNode;

var AstNode = function (line, column) {
	this._line = line;
	this._column = column;
};
AstNode.prototype._sn = function (originalFilename, chunk) {
	return new SN(this._line, this._column, originalFilename, chunk);
};
AstNode.prototype.compile = function (data) {
	throw new Error("Not Implemented");
};
AstNode.prototype.compileReference = function (data) {
	return this.compile(data);
};

exports.Number = function (line, column, numberText) {
	AstNode.call(this, line, column);
	/// this._value : Num
	this._value = Number(numberText);
};
exports.Number.prototype = Object.create(AstNode.prototype);
exports.Number.prototype.compile = function(data) {
	return this.sn(data.originalFilename, this._value);
};

exports.Variable = function (line, column, varText) {
	AstNode.call(this, line, column);
	/// this._name : String
	this._name = varText;
};
exports.Variable.prototype = Object.create(AstNode.prototype);
exports.Variable.prototype.compile = function(data) {
	return this.sn(data.originalFilename, this._name);
};


exports.Expression = function (line, column, op1, op2, operator) {
	AstNode.call(this, line, column);
	this._left = op1;
	this._right = op2;
	this._operator = operator;
};
exports.Expression.prototype = Object.create(AstNode.prototype);
exports.Expression.prototype.compile = function(data) {
	var output = this._sn(data.originalFilename, "");

	switch (this._operator.symbol) {
		case 'print':
			return output
				.add(["if (", this._right, " <= 0) throw new Error('Cannot print < 1 time."])
				.add([this._operator.compile(data), 
				      "(", this._left.compile(data), ", ", this._right.compile(data), ");"]);
		case '=':
			return output
				.add(["var ", this._left.compile(data), 
				      this._operator.compile(data), this._right.compile(data)]);
		case '/':
			return output
				.add(["if (", this._right, " <= 0) throw new Error('Division by zero"])
				.add([this._left.compile(data), 
				      this._operator.compile(data), this._right.compile(data)]);
		default:
			return output
				.add([this._left.compile(data), 
				      this._operator.compile(data), this._right.compile(data)]);
	}
};

exports.Operator = function (line, column, opName) {
	AstNode.call(this, line, column);
	this.symbol = opName;
};
exports.Operator.prototype = Object.create(AstNode.prototype);
exports.Operator.prototype.compile = function(data) {
	if (this.symbol === "print") {
		return this.sn(data.originalFilename, "__rpn.print");
	} else {
		return this.sn(data.originalFilename, this.symbol);
	}
};