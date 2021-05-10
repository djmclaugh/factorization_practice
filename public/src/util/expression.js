import { format, toSuperscript, toItalics } from '../util/unicode_format.js'
import { iterate } from '../util/iteration.js'

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b)
  if (b == 0) {
    return a;
  }
  if (a < b) {
    return gcd(b, a);
  }
  return gcd(b, a % b);
}

function gcdOfList(list) {
  if (list.length == 0) {
    return Infinity;
  } else if (list.length == 1) {
    return list[0];
  } else {
    return gcd(list[0], gcdOfList(list.slice(1, list.length)));
  }
}

export class VariableGroup {
  static CONSTANT = new VariableGroup({});
  static X = new VariableGroup({x:1});
  static Y = new VariableGroup({x:1});

  // Lexicographical ordering
  static compare(a, b) {
    const vSet = new Set(Object.keys(a.variables).concat(Object.keys(b.variables)));
    const allVariables = [...vSet].sort();
    for (let v of allVariables) {
      const aPower = a.variables[v] ? a.variables[v] : 0;
      const bPower = b.variables[v] ? b.variables[v] : 0;
      if (aPower != bPower) {
        // We actually want bigger powers in front of lower powers so we'll do b-a instead of the
        // usual a-b
        return bPower - aPower
      }
    }
    return 0;
  }

  constructor(variables) {
    const keys = Object.keys(variables);
    for (const key of keys) {
      if (variables[key] == 0) {
        delete variables[key];
      }
    }
    this.variables = variables;
  }

  isConstant() {
    return Object.keys(this.variables).length == 0;
  }

  isLike(other) {
    return this.isDivisibleBy(other) && other.isDivisibleBy(this);
  }

  isDivisibleBy(other) {
    for (let v in other.variables) {
      if (this.variables[v] === undefined || other.variables[v] > this.variables[v]) {
        return false;
      }
    }
    return true;
  }

  times(other) {
    const newGroup  = {};
    for (let v in this.variables) {
      newGroup[v] = this.variables[v];
    }
    for (let v in other.variables) {
      if (newGroup[v] === undefined) {
        newGroup[v] = 0;
      }
      newGroup[v] += other.variables[v];
    }
    return new VariableGroup(newGroup);
  }

  commonFactor(other) {
    const newGroup  = {};
    for (let v in this.variables) {
      if (other.variables[v] !== undefined) {
        newGroup[v] = Math.min(this.variables[v], other.variables[v]);
      }
    }
    return new VariableGroup(newGroup);
  }

  isSquare() {
    for (let v in this.variables) {
      if (this.variables[v] % 2 == 1) {
        return false;
      }
    }
    return true;
  }

  squareRoot() {
    if (!this.isSquare()) {
      throw new Error("Can only take the square root of perfect squares.");
    }
    const newGroup  = {};
    for (let v in this.variables) {
      newGroup[v] = this.variables[v] / 2;
    }
    return new VariableGroup(newGroup);
  }

  toString() {
    let result = "";
    const keys = Object.keys(this.variables).sort();
    for (let v of keys) {
      result += toItalics(v);
      if (this.variables[v] != 1) {
        result += toSuperscript(this.variables[v].toString());
      }
    }
    return result;
  }
}

export class Expression {
  static constant(c) {
    return new Expression(c, 1, 'v', VariableGroup.CONSTANT);
  }

  constructor(coefficient, power, type, value) {
    this.coefficient = coefficient;
    this.power = power;
    this.type = type;
    if (type === 'v') {
      if (!(value instanceof VariableGroup)) {
         throw new Error("Expected variable group");
      }
      this.group = value;
    } else if (type === '+' || type === '*') {
      if (!Array.isArray(value)) {
         throw new Error("Expected array");
      }
      this.expressions = value;
    } else {
      throw new Error("Expected a type of 'v', '+', or '*'.");
    }
  }

  /*
   * An expression is simplified if it falls into one of the following two groups:
   * 1. The power is exactly 1 and it is of type 'v'.
   * 2. The power is exactly 1, the coefficient is exactly 1, it is of type '+',
   *    and all expressions in the sum have power 1 and are of type 'v'
   */
  simplified() {
    if (this.type === 'v') {
      // If this is just a variable group, expand the power and we're done.
      let newGroup = this.group;
      for (let i = 1; i < this.power; ++i) {
        newGroup = newGroup.times(this.group);
      }
      return new Expression(this.coefficient, 1, 'v', newGroup);
    }

    // Otherwise, recursivly simplify the subexpressions.
    const simplifiedExpressions = this.expressions.map(e => e.simplified());

    if (this.type === '*') {
      let expanded = simplifiedExpressions
      for (let i = 1; i < this.power; ++i) {
        expanded = expanded.concat(simplifiedExpressions);
      }

      const choices = [];
      for (const expression of expanded) {
        if (expression.type == 'v') {
          choices.push([expression]);
        } else if (expression.type == '+') {
          choices.push(expression.expressions);
        } else {
          throw new Error("Simplified expressions should be of type 'v' or '+'.");
        }
      }

      const allTerms = [];
      iterate(choices, (selection) => {
        let group = VariableGroup.CONSTANT;
        let coefficient = 1;
        for (const expression of selection) {
          coefficient *= expression.coefficient;
          group = group.times(expression.group);
        }
        allTerms.push(new Expression(coefficient, 1, 'v', group));
      });
      return (new Expression(this.coefficient, 1, '+', allTerms)).simplified();
    }

    if (this.type == '+') {
      // Get rid of the power by expanding it as a product.
      if (this.power > 1) {
        let toMultiply = [];
        const copyWithoutPower = new Expression(1, 1, '+', simplifiedExpressions);
        for (let i = 0; i < this.power; ++i) {
          toMultiply.push(copyWithoutPower);
        }
        return (new Expression(this.coefficient, 1, '*', toMultiply)).simplified();
      }

      // Since all terms are simplified, they are either of type + or v.
      // If of type +, flatten them first.
      // Note even if they are of type +, since they are simplified, their coefficient is 1, their
      // power is 1, and all of their expressions are of type 'v', so only one level of flattening
      // is needed.
      for (let i = 0; i < simplifiedExpressions.length; ++i) {
        if (simplifiedExpressions[i].type == '+') {
          simplifiedExpressions.splice(i, 1, ...simplifiedExpressions[i].expressions);
        }
      }

      const terms = [];
      const coefficients = [];
      for (const expression of simplifiedExpressions) {
        let likeTermIndex = -1;
        for (let i = 0; i < terms.length; ++i) {
          if (expression.group.isLike(terms[i])) {
            likeTermIndex = i;
            break;
          } else {
          }
        }
        if (likeTermIndex == -1) {
          terms.push(expression.group);
          coefficients.push(expression.coefficient);
        } else {
          coefficients[likeTermIndex] += expression.coefficient;
        }
      }

      const allTerms = [];
      for (let i = 0; i < terms.length; ++i) {
        if (coefficients[i] != 0) {
          allTerms.push(new Expression(coefficients[i] * this.coefficient, 1, 'v', terms[i]));
        }
      }
      allTerms.sort((a, b) => VariableGroup.compare(a.group, b.group));


      if (allTerms.length == 0) {
        return new Expression(0, 1, 'v', VariableGroup.CONSTANT);
      } else if (allTerms.length == 1) {
        return allTerms[0];
      } else {
        return new Expression(1, 1, '+', allTerms);
      }
    }

    throw new Error("This should never be reached");
  }

  isSame(expression) {
    const a = this.simplified();
    const b = expression.simplified();
    if (a.type != b.type) {
      return false;
    }
    if (a.type == 'v') {
      return a.coefficient == b.coefficient && a.group.isLike(b.group);
    } else if (a.type == '+') {
      if (a.expressions.length != b.expressions.length) {
        return false;
      }
      for (let ae of a.expressions) {
        // Since a and b are simplified expressions, all of their sub-expressions should be of type
        // 'v'.
        let foundMatch = false;
        for (let be of b.expressions) {
          if (ae.coefficient == be.coefficient && ae.group.isLike(be.group)) {
            foundMatch = true;
            break;
          }
        }
        if (!foundMatch) {
          return false;
        }
      }
      return true;
    }
    throw new Error("This should never happen, simplified expressions should be of type '+' or 'v'.");
  }

  absCoefficient() {
    return this.replaceCoefficientAndPower(Math.abs(this.coefficient), this.power);
  }

  negativeCoefficient() {
    return this.replaceCoefficientAndPower(-1 * Math.abs(this.coefficient), this.power);
  }

  stripCoefficientAndPower() {
    return this.replaceCoefficientAndPower(1, 1);
  }

  replaceCoefficientAndPower(c, p) {
    return new Expression(c, p, this.type, this.group || this.expressions);
  }

  isCommonFactor(expression) {
    if (expression.type != 'v') {
      throw new Error('This function assumes that the expression is a simple expression.');
    }
    if (this.type != '+') {
      throw new Error('This function assumes that this is a sum.');
    }
    for (let term of this.expressions) {
      if (term.coefficient % expression.coefficient !== 0) {
        return false;
      }
      if (!term.group.isDivisibleBy(expression.group)) {
        return false;
      }
    }
    return true;
  }

  commonFactor() {
    if (this.type != '+') {
      throw new Error('This function assumes that this is a simplified expression.');
    }
    const coefficient = gcdOfList(this.expressions.map(e => e.coefficient));
    const group =  this.expressions.map(e => {
      if (e.group === undefined) {
        throw new Error('This function assumes that this is a simplified expression.');
      }
      return e.group;
    }).reduce((a, b) => a.commonFactor(b));
    return new Expression(coefficient, 1, 'v', group);
  }

  hasCommonFactor() {
    const cf = this.commonFactor();
    return cf.coefficient != 1 || !cf.group.isConstant();
  }

  // Returns whether or not an expression is "obviously" a perfect square.
  //
  // Checking if a simple term is a perfect square or not is "obvious".
  // For example: 16 x^2 y^4 is obviously a perfect square since the coefficient is a perfect square
  // and the powers are even.
  //
  // If the expression is an even power of another expression, then it is also "obviously" a perfect square.
  // For example: (x + 1)^2 is obviously a perfect square.
  //
  // Anything else however is not "obvious".
  // For example: x^2 + 2x + 1 is not obviously a perfect square even though it's just (x + 1)^2.
  //
  // Note, I consider -x^2 to be a perfect square evne though it technically isn't.
  // It makes things easier when deciding if difference of two squares can be applied to something
  // like 4 - x^2.
  isObviousPerfectSquare() {
    const isCoefficientSquare = Number.isInteger(Math.sqrt(Math.abs(this.coefficient)));
    if (!isCoefficientSquare) {
      return false;
    }
    if (this.power % 2 == 0) {
      return true;
    }
    if (this.type == 'v' && this.group.isSquare()) {
      return true;
    }
    return false;
  }

  // Note, this ignores the sign of the coefficient.
  // This will return -x if used on -x^2 even though technically -x^2 doesn't have a square root.
  squareRoot() {
    if (!this.isObviousPerfectSquare()) {
      throw new Error("Can only take the square root of expressions that are obviously perfect squares.")
    }
    const c = this.coefficient / Math.sqrt(Math.abs(this.coefficient));
    if (this.power % 2 == 0) {
      return new Expression(c, this.power / 2, this.type, this.group || this.expressions);
    }
    if (this.type == 'v' && this.group.isSquare()) {
      return new Expression(c, this.power, this.type, this.group.squareRoot());
    }
    throw new Error("This line should never be reached.");
  }

  isSameSign(expression) {
    return this.coefficient * expression.coefficient > 0;
  }

  toDecoratedString() {
    return "@E@" + this.toString() + "@E@";
  }

  toString() {
    if (this.type == 'v') {
      let result = "";
      if (this.coefficient < 0) {
        result += '−';
      }
      const groupString = this.group.toString();
      if (Math.abs(this.coefficient) != 1 || groupString.length == 0) {
        result += Math.abs(this.coefficient);
      }
      if (this.power > 1 && groupString.length > 0) {
        result += '(' + groupString + ')' + toSuperscript(this.power);
      } else {
        result += groupString;
      }
      return result;
    } else if (this.type === '*') {
      let result = "";
      if (this.coefficient < 0) {
        result += '−';
      }
      if (Math.abs(this.coefficient) != 1) {
        result += Math.abs(this.coefficient);
      }
      if (Math.abs(this.coefficient) != 1 || this.power > 1) {
        result += '('
      }
      for (let i = 0; i < this.expressions.length; ++i) {
        const expression = this.expressions[i];
        if (i == 0 && expression.type == 'v') {
          if (expression.coefficient < 0 && expression.power == 1 ) {
            result += '(' + expression.toString() + ')';
          } else {
            result += expression.toString();
          }
        } else {
          if (expression.coefficient == 1 && expression.power == 1 ) {
            result += '(' + expression.toString() + ')';
          } else {
            result += expression.toString();
          }
        }
      }
      if (Math.abs(this.coefficient) != 1 || this.power > 1) {
        result += ')';
      }
      if (this.power > 1) {
        result += toSuperscript(this.power);
      }
      return result;
    } else if (this.type === '+') {
      let result = "";
      if (this.coefficient < 0) {
        result += '−';
      }
      if (Math.abs(this.coefficient) != 1) {
        result += Math.abs(this.coefficient);
      }
      if (this.power != 1 || this.coefficient != 1) {
        result += '('
      }

      if (this.expressions[0].type == '+' && this.expressions[0].coefficient == 1 && this.expressions[0].power == 1) {
        result += '('
      }
      result += this.expressions[0].toString();
      if (this.expressions[0].type == '+' && this.expressions[0].coefficient == 1 && this.expressions[0].power == 1) {
        result += ')'
      }

      for (let i = 1; i < this.expressions.length; ++i) {
        const e = this.expressions[i];
        result += e.coefficient < 0 ? ' − ' : ' + ';
        let absE = e.absCoefficient();
        if (absE.type == '+' && absE.coefficient == 1 && absE.power == 1) {
          result += '('
        }
        result += absE.toString();
        if (absE.type == '+' && absE.coefficient == 1 && absE.power == 1) {
          result += ')'
        }
      }
      if (this.power != 1 || this.coefficient != 1) {
        result += ')'
      }
      if (this.power > 1) {
        result += toSuperscript(this.power.toString());
      }
      return result;
    }
    throw new Error("Something went wrong");
  }
}
