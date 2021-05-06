import { Expression } from './expression.js'

export default class Question {
  static MC = "Multiple Choice";
  static ST = "Simple Term";
  static TN = "Two Numbers";

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
    return new Question(`What can we factor out of ${expression.toDecoratedString()}?`, Question.ST, variables, (a) => {
      if (a.coefficient == 1 && a.group.isConstant()) {
        return [false, "@E@1@E@ is technically a common factor, but removing it won't change anything"];
      } else if (expression.isCommonFactor(a)) {
        return [true, null];
      }
      return [false, "This factor doesn't divide every term."];
    });
  }

  static generateRemovingCommonFactorQuestion(expression, commonFactor) {
    const question = `What is ${expression.absCoefficient().toDecoratedString()} divided by ${commonFactor.toDecoratedString()}?`;
    if (expression.type != 'v') {
      throw new Error("Currently assuming that common factors are taken out of a simple term.");
    }
    const variables = Object.keys(expression.group.variables);
    return new Question(question, Question.ST, variables, (a) => {
      if (a.coefficient * commonFactor.coefficient != Math.abs(expression.coefficient)) {
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
