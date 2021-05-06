import Strategy from './strategy.js';

import { Expression } from '../expression.js';
import Question from '../question.js'

export default class QuadraticExpressionStrategy extends Strategy {
  static canFactorize(expression) {
    if (expression.type != '+' || expression.expressions.length != 3) {
      return false;
    }
    // This assumes that the trinomial is in order.
    // This strategy currently doesn't support out of order cases.
    const leading = expression.expressions[0];
    const middle = expression.expressions[1];
    const constant = expression.expressions[2];

    if (!leading.group.isSquare()
        || !constant.group.isSquare()
        || !leading.group.times(constant.group).isLike(middle.group.times(middle.group))) {
      return false;
    }
    const a = leading.coefficient;
    const b = middle.coefficient;
    const c = constant.coefficient;
    const discriminant = Math.sqrt(Math.pow(b, 2) -  (4 * a * c));
    return discriminant >= 0  && Number.isInteger(discriminant);
  }

  constructor(options) {
    super();
  }

  start(expression) {
    this.expression = expression;
    this.a = expression.expressions[0].coefficient;
    this.b = expression.expressions[1].coefficient;
    this.c = expression.expressions[2].coefficient;
    this.g1 = expression.expressions[0].group.squareRoot();
    this.g2 = expression.expressions[2].group.squareRoot();
    this.numbers = null;
    this.split1 = null;
    this.split2 = null;
    this.half1 = null;
    this.half2 = null;
    this.tempExpression = null;
    this.cf1 = null;
    this.cf2 = null;
    this.re1 = null;
    this.re2 = null;

    return [[
      `@E@𝑎=${this.a}@E@, @E@𝑏=${this.b}@E@, and @E@𝑐=${this.c}@E@.`,
      `We need to find two numbers with a sum of @E@𝑏@E@ and a product of @E@𝑎𝑐@E@.`,
    ], Question.generateProductSumQuestion(this.a * this.c, this.b)];
  }

  onAnswer(answer) {
    if (this.numbers == null) {
      this.numbers = answer;
      if (this.a == 1) {
        const t1 = new Expression(1, 1, '+', [new Expression(1, 1, 'v', this.g1), new Expression(answer[0], 1, 'v', this.g2)])
        const t2 = new Expression(1, 1, '+', [new Expression(1, 1, 'v', this.g1), new Expression(answer[1], 1, 'v', this.g2)])
        const factoredExpression = new Expression(1, 1, '*', [t1, t2]);
        return [[
          "Since @E@𝑎=1@E@, we can simply use these two numbers to get the factorization.",
          `${this.expression.toDecoratedString()} is the same thing as ${factoredExpression.toDecoratedString()}.`
        ], factoredExpression];
      } else {
        const terms = this.expression.expressions;
        const split1 = terms[1].replaceCoefficientAndPower(answer[0], 1);
        this.split1 = split1;
        const split2 = terms[1].replaceCoefficientAndPower(answer[1], 1);
        this.split2 = split2;
        this.half1 = new Expression(1, 1, '+', [terms[0], split1]);
        this.half2 = new Expression(1, 1, '+', [split2, terms[2]]);
        this.tempExpression = new Expression(1, 1, '+', [this.half1, this.half2]);
        const together = new Expression(1, 1, '+', [split1, split2]);

        return [[
          `We can use these two numbers to split the middle term, ${terms[1].toDecoratedString()}, as ${together.toDecoratedString()}.`,
          `Now let's take out a common factor out of the first group of ${this.tempExpression.toDecoratedString()}.`
        ], Question.generateCommonFactorQuestion(this.half1)];
      }
    } else {
      if (this.cf1 == null) {
        this.cf1 = answer;
        return [[
          `We now need to divide each term of ${this.half1.toDecoratedString()} by ${this.cf1.toDecoratedString()}.`
        ], Question.generateRemovingCommonFactorQuestion(this.half1.expressions[0], this.cf1)];
      } else if (this.re1 == null) {
        this.re1 = answer;
        return [[], Question.generateRemovingCommonFactorQuestion(this.half1.expressions[1], this.cf1)];
      } else if (this.re2 == null) {
        this.re2 = answer;
        const re = new Expression(1, 1, '+', [this.re1, this.re2]);
        const temp1 = new Expression(1, 1, '*', [this.cf1, re]);
        return [[
          `So the first group, ${this.half1.toDecoratedString()}, can be factorized as ${temp1.toDecoratedString()}.`,
          `Now let's take out a common factor out of the last group of ${this.tempExpression.toDecoratedString()}.`
        ], Question.generateCommonFactorQuestion(this.half2)];
      } else if (this.cf2 == null) {
        this.cf2 = answer;
        const re = new Expression(1, 1, '+', [this.re1, this.re2]);
        this.re = re;

        const temp1 = new Expression(1, 1, '*', [this.cf1, re]);
        const temp2 = new Expression(1, 1, '*', [this.cf2, re]);
        const temp = new Expression(1, 1, '+', [temp1, temp2]);
        const f1 = new Expression(1, 1, '+', [this.cf1, this.cf2]);

        const factoredExpression = new Expression(1, 1, '*', [f1, re]);

        return [[
          `If we divide ${this.half2.toDecoratedString()} by ${this.cf2.toDecoratedString()}, we should get ${re.toDecoratedString()} as well. It's good to double check.`,
          `So the last group, ${this.half2.toDecoratedString()}, can be factored as ${temp2.toDecoratedString()}.`,
          `So we can rewrite ${this.tempExpression.toDecoratedString()} as ${temp.toDecoratedString()}.`,
          `We can now factor out ${re.toDecoratedString()} and get ${factoredExpression.toDecoratedString()}.`,
          `${this.expression.toDecoratedString()} is the same thing as ${factoredExpression.toDecoratedString()}.`
        ], factoredExpression];
      }
    }
  }
}
