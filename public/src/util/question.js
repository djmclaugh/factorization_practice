import { Expression } from './expression.js'

export default class Question {
  static get MC() { return "Multiple Choice"; }
  static get ST() { return "Simple Term"; }
  static get TN() { return "Two Numbers"; }

  constructor(question, inputType, inputOptions, processAnswer) {
    this.question = question;
    this.inputType = inputType;
    this.inputOptions = inputOptions;
    this.processAnswer = processAnswer;
  }

  static generateCommonFactorQuestion(expression) {
    if (expression.type != '+') {
      throw new Error("Can only take out common factor from a sum of simple terms");
    }
    let group = expression.expressions.map(e => e.group).reduce((a, b) => a.times(b));
    const variables = Object.keys(group.variables);
    return new Question(`What is the largest factor we can take out of ${expression.toDecoratedString()}?`, Question.ST, variables, (a) => {
      for (let e of expression.expressions) {
        if (Math.abs(e.coefficient) % Math.abs(a.coefficient) !== 0) {
          if (!e.group.isConstant() || !a.group.isConstant()) {
            return [false, `${e.toDecoratedString()} is not divisible by ${a.toDecoratedString()} because @E@${e.coefficient}@E@ is not divisible by @E@${a.coefficient}@E@.`];
          } else {
            return [false, `${e.toDecoratedString()} is not divisible by ${a.toDecoratedString()}.`];
          }
        }
        if (!e.group.isDivisibleBy(a.group)) {
          if (e.coefficient != 1 || a.coefficient != 1) {
            return [false, `${e.toDecoratedString()} is not divisible by ${a.toDecoratedString()} because @E@${e.group.toString()}@E@ is not divisible by @E@${a.group.toString()}@E@.`];
          } else {
            return [false, `${e.toDecoratedString()} is not divisible by ${a.toDecoratedString()}.`];
          }
        }
      }
      if (!a.absCoefficient().isSame(expression.commonFactor())) {
        return [false, `${a.toDecoratedString()} is indeed a common factor, but not the largest one.`];
      }

      if (expression.expressions[0].coefficient < 0 && a.coefficient > 0) {
        return [false, "You are technically correct, but it's usually a good idea to factor out a negative coefficient if the leading coefficient is negative."];
      }
      if (expression.expressions[0].coefficient > 0 && a.coefficient < 0) {
        return [false, "You are technically correct, but factoring out a negative coefficient is usually only a good idea if the leading coefficient is negative."];
      }
      return [true, null];
    });
  }

  static generateRemovingCommonFactorQuestion(expression, commonFactor) {
    const question = `What is ${expression.toDecoratedString()} divided by ${commonFactor.toDecoratedString()}?`;
    if (expression.type != 'v') {
      throw new Error("Currently assuming that common factors are taken out of a simple term.");
    }
    const variables = Object.keys(expression.group.variables);
    return new Question(question, Question.ST, variables, (a) => {
      if (a.coefficient * commonFactor.coefficient != expression.coefficient) {
        return [false, "Not quite. The coefficient would be different."];
      } else if (!a.group.times(commonFactor.group).isLike(expression.group)) {
        return [false, "Not quite. The variables or their powers would be different."];
      }
      return [true, null];
    });
  }

  static generateSquareRootQuestion(expression) {
    const question = `What is the square root of ${expression.toDecoratedString()}?`;
    if (expression.type != 'v') {
      throw new Error("Currently assuming that square roots are taken out of a simple term.");
    }
    const variables = Object.keys(expression.group.variables);
    return new Question(question, Question.ST, variables, (a) => {
      if (a.isSame(expression.squareRoot())) {
        return [true, null];
      }
      const aSquared = new Expression(1, 1, '*', [a, a]).simplified();
      return [false, `${a.toDecoratedString()} squared is equal to ${aSquared.toDecoratedString()}, not ${expression.toDecoratedString()}.`];
    });
  }

  static generateProductSumQuestion(p, s) {
    const question = `Which two numbers add up to ${s} and multiply to ${p}?`;
    return new Question(question, Question.TN, null, (a) => {
      if (a[0] + a[1] != s) {
        return [false, `${a[0]} and ${a[1]} do not add up to ${a[0] + a[1]}, not ${s}.`];
      }
      if (a[0] * a[1] != p) {
        return [false, `${a[0]} and ${a[1]} do not multiply to ${a[0] * a[1]}, not ${p}.`];
      }
      return [true, null];
    });
  }
}
