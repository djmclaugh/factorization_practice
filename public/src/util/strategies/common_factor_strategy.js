import Strategy from './strategy.js';

import { Expression } from '../expression.js';
import Question from '../question.js'

export default class CommonFactorStrategy extends Strategy {
  static canFactorize(expression) {
    return expression.hasCommonFactor();
  }

  constructor(options) {
    super();
  }

  currentTerm() {
    if (this.termIndex >= this.expression.expressions.length) {
      return undefined;
    }
    return this.expression.expressions[this.termIndex];
  }

  start(expression) {
    this.expression = expression;
    this.cf = null;
    this.termIndex = 0;
    this.newTerms = [];

    return [[], Question.generateCommonFactorQuestion(expression)];
  }

  onAnswer(a) {
    if (this.cf == null) {
      this.cf = a;
      return [
        ["Let's now divide each term by that common factor."],
        Question.generateRemovingCommonFactorQuestion(this.currentTerm(), this.cf),
      ];
    } else {
      if (this.currentTerm().coefficient < 0) {
        a = a.negativeCoefficient();
      }
      this.newTerms.push(a);
      this.termIndex += 1;
      if (this.currentTerm()) {
        return [[], Question.generateRemovingCommonFactorQuestion(this.currentTerm(), this.cf)]
      } else {
        const allTerms = new Expression(1, 1, '+', this.newTerms);
        const result = new Expression(1, 1, '*', [this.cf, allTerms]);
        return [
          [`Factoring ${this.cf.toDecoratedString()} out of ${this.expression.toDecoratedString()} leaves us with ${allTerms.toDecoratedString()}.`],
          result,
        ];
      }
    }
  }
}
