import Strategy from './strategy.js';

import { Expression } from '../expression.js';
import Question from '../question.js'

export default class DifferenceOfSquaresStrategy extends Strategy {
  static canFactorize(expression) {
    if (expression.type != '+' || expression.expressions.length != 2) {
      return false;
    }
    const a = expression.expressions[0];
    const b = expression.expressions[1];
    return a.isObviousPerfectSquare() && b.isObviousPerfectSquare() && !a.isSameSign(b);
  }

  constructor(options) {
    super();
  }

  start(expression) {
    this.expression = expression;
    this.a = expression.expressions[0];
    this.b = expression.expressions[1];
    this.sqrt1 = null;
    this.sqrt2 = null;

    return [ [], Question.generateSquareRootQuestion(this.a.absCoefficient())];
  }

  onAnswer(a) {
    if (this.sqrt1 == null) {
      if (this.a.coefficient < 0) {
        this.sqrt1 = a.negativeCoefficient();
      } else {
        this.sqrt1 = a;
      }
      return [ [], Question.generateSquareRootQuestion(this.b.absCoefficient()) ];
    } else {
      if (this.b.coefficient < 0) {
        this.sqrt2 = a.negativeCoefficient();
      } else {
        this.sqrt2 = a;
      }

      const t1 = new Expression(1, 1, '+', [this.sqrt1.absCoefficient(), this.sqrt2.absCoefficient()]);
      const t2 = new Expression(1, 1, '+', [this.sqrt1, this.sqrt2]);
      const factoredExpression = new Expression(1, 1, '*', [t1, t2]);

      return [[
        `Since the square roots are ${this.sqrt1.absCoefficient().toDecoratedString()} and ${this.sqrt2.absCoefficient().toDecoratedString()}, we know that ${this.expression.toDecoratedString()} is the same as ${factoredExpression.toDecoratedString()}.`,
      ], factoredExpression];
    }
  }
}
