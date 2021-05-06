import Strategy from './strategy.js';

import { Expression } from '../expression.js';
import Question from '../question.js'

export default class PerfectSquareTrinomialStrategy extends Strategy {
  static canFactorize(expression) {
    if (expression.type != '+' || expression.expressions.length != 3) {
      return false;
    }
    // This assumes that the trinomial is in order
    // This strategy currently doesn't support the case where the "middle term" is not in the middle.
    const leading = expression.expressions[0];
    const middle = expression.expressions[1];
    const constant = expression.expressions[2];
    if (leading.isObviousPerfectSquare() && constant.isObviousPerfectSquare() && leading.isSameSign(constant)) {
      const root1 = leading.squareRoot();
      const root2 = constant.squareRoot();
      if (middle.absCoefficient().isSame(new Expression(2, 1, '*', [root1, root2]))) {
        return true;
      }
    }
    return false;
  }

  constructor(options) {
    super();
  }

  start(expression) {
    this.expression = expression;
    this.leading = expression.expressions[0];
    this.middle = expression.expressions[1];
    this.constant = expression.expressions[2];
    this.sqrt1 = null;
    this.sqrt2 = null;

    return [ [], Question.generateSquareRootQuestion(this.leading.absCoefficient()) ];
  }

  onAnswer(a) {
    if (this.sqrt1 == null) {
      this.sqrt1 = a;
      return [ [], Question.generateSquareRootQuestion(this.constant.absCoefficient()) ];
    } else {
      this.sqrt2 = a;

      let t2 = a;
      if (this.middle.coefficient < 0) {
        t2 = a.negativeCoefficient();
      }

      const factoredExpression = new Expression(1, 2, '+', [this.sqrt1, t2]);
      return [[
        `It's good to double check that ${this.sqrt1.toDecoratedString()} times ${this.sqrt2.toDecoratedString()} is indeed equal to half of ${this.middle.absCoefficient().toDecoratedString()}.`,
        `Since the square roots are ${this.sqrt1.toDecoratedString()} and ${this.sqrt2.absCoefficient().toDecoratedString()}, and that the middle term is ${this.middle.coefficient < 0 ? 'negative' : 'positive'}, we know that ${this.expression.toDecoratedString()} is the same as ${factoredExpression.toDecoratedString()}.`
      ], factoredExpression];
    }
  }
}
