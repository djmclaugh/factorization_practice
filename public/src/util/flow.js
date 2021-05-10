import Question from './question.js'
import { Expression, VariableGroup } from './expression.js'
import Problem from './problem.js'
import CommonFactorStrategy from './strategies/common_factor_strategy.js'
import PerfectSquareTrinomialStrategy from './strategies/perfect_square_trinomial_strategy.js'
import DifferenceOfSquaresStrategy from './strategies/difference_of_squares_strategy.js'
import QuadraticExpressionStrategy from './strategies/quadratic_expression_strategy.js'

// Stategies
const STRATEGIES = Problem.STRATEGIES_LIST;
const NAME_TO_STRATEGY = {};
NAME_TO_STRATEGY[Problem.STRATEGIES.CF] = CommonFactorStrategy;
NAME_TO_STRATEGY[Problem.STRATEGIES.PST] = PerfectSquareTrinomialStrategy;
NAME_TO_STRATEGY[Problem.STRATEGIES.DS] = DifferenceOfSquaresStrategy;
NAME_TO_STRATEGY[Problem.STRATEGIES.QE] = QuadraticExpressionStrategy;

function isFactorizable(expression, allowedStrategies) {
  if (expression.type != '+') {
    throw new Error('This function assumes that this is a simplified expression.');
  }
  for (let s of allowedStrategies) {
    if (NAME_TO_STRATEGY[s].canFactorize(expression)) {
      return true;
    }
  }
  return false;
}

export default class Flow {

  constructor(problem) {
    this.originalExpression = problem.expression;
    this.options = problem.options;
    // The expression that we are trying to factor further
    this.currentExpression = this.originalExpression;
    // The index of the specific factor in the expression that we are trying to factor further
    this.currentIndex = 0;
    this.history = [ this.originalExpression ];

    this.currentMistake = null;
    this.currentMistakeMessage = null;
    this.currentQuestion = this.generateStrategyQuestion(this.originalExpression, true);

    this.currentStrategy = null;
  }

  restartFrom(expression) {
    const index = this.history.indexOf(expression);
    if (index == -1) {
      throw new Error("Invalid expression to restart at: " + expression);
    }
    this.currentExpression = expression;
    this.currentIndex = -1;
    this.history = this.history.slice(0, index + 1);
    this.currentMistake = null;
    this.currentMistakeMessage = null;
    this.currentStrategy = null;
    if (index == 0) {
      this.currentIndex = 0;
      this.currentQuestion = this.generateStrategyQuestion(this.currentExpression, true);
    } else {
      this.currentQuestion = this.generateKeepGoingQuestion(this.currentExpression);
    }
  }

  currentFactor() {
    const f = this.fullCurrentFactor();
    if (f) {
      return f.stripCoefficientAndPower();
    }
    return undefined;
  }

  fullCurrentFactor() {
    if (this.currentIndex >= 0) {
      if (this.currentExpression.type == '+') {
        return this.currentExpression;
      }
      return this.currentExpression.expressions[this.currentIndex];
    }
    return undefined;
  }

  answer(a) {
    const result = this.currentQuestion.processAnswer(a);
    if (result[0]) {  // If correct
      this.currentMistake = null;
      this.currentMistakeMessage = null;
      this.history.push([this.currentQuestion, a]);
      this.onCorrectAnswer(a);
    } else {
      this.currentMistake = a;
      this.currentMistakeMessage = result[1];
    }
  }

  done() {
    this.history.push(`Correct! ${this.currentExpression.toDecoratedString()} can't be factorized any further with the given methods. We're done!`)
    this.currentQuestion = null;
  }

  onCorrectAnswer(a) {
    if (this.currentFactor() === undefined) {
      if (a == Problem.STRATEGIES.NA) {
        this.done();
      } else {
        if (this.currentExpression.type == "*") {
          for (let i = 0; i < this.currentExpression.expressions.length; ++i) {
            if (this.currentExpression.expressions[i].stripCoefficientAndPower().toDecoratedString() == a) {
              this.currentIndex = i;
            }
          }
        } else if (this.currentExpression.type == "+") {
          if (this.currentExpression.stripCoefficientAndPower().toDecoratedString() == a) {
            this.currentIndex = 0;
          }
        }
        if (this.currentIndex == -1) {
          throw new Error("Unexpected Answer: " + a);
        }
        this.currentQuestion = this.generateStrategyQuestion(this.currentFactor(), false);
      }
    } else if (this.currentStrategy == null) {
      if (NAME_TO_STRATEGY[a] !== undefined) {
        this.currentStrategy = new (NAME_TO_STRATEGY[a])();
        const start = this.currentStrategy.start(this.currentFactor());
        this.history = this.history.concat(start[0]);
        this.currentQuestion = start[1];
      } else if (a == Problem.STRATEGIES.NA) {
        this.done();
      } else {
        throw new Error("Unexpected Answer: " + a)
      }
    } else {
      const response = this.currentStrategy.onAnswer(a);
      this.history = this.history.concat(response[0]);
      if (response[1] instanceof Question) {
        this.currentQuestion = response[1];
      } else if (response[1] instanceof Expression) {
        this.doneSubStep(response[1]);
      } else {
        throw new Error('Unexpected response: ' + reponse);
      }
    }
  }

  doneSubStep(factoredSubExpression) {
    const pastExpression = this.currentExpression;
    const pastFactor = this.currentFactor();
    const pastFullFactor = this.fullCurrentFactor();
    let replacement = null;

    if (factoredSubExpression.type == 'v') {
      throw new Error("This shouldn't happen");
    } else if (factoredSubExpression.type == '*') {
      const simpleFactors = factoredSubExpression.expressions.filter(f => f.type == 'v');
      let newCoefficient = factoredSubExpression.expressions.map(e => e.coefficient).reduce((a, b) => {
        return a * b;
      }, 1);
      newCoefficient = Math.pow(newCoefficient, pastFullFactor.power) * pastFullFactor.coefficient;
      const simpleFactorGroups = factoredSubExpression.expressions.filter(f => f.type == 'v').map(e => e.group);
      const group = simpleFactorGroups.reduce((a, b) => {
        return a.times(b);
      }, VariableGroup.CONSTANT);
      let newGroup = group;
      for (let i = 1 ; i < pastFullFactor.power; ++i) {
        newGroup = newGroup.times(group);
      }
      const replacementExpressions = factoredSubExpression.expressions.filter(e => e.type != 'v').map(e => e.replaceCoefficientAndPower(1, e.power * pastFullFactor.power))
      if (newCoefficient != 1 || !newGroup.isConstant()) {
        replacementExpressions.unshift(new Expression(newCoefficient, 1, 'v', newGroup));
      }
      replacement = new Expression(1, 1, '*', replacementExpressions);
    } else if (factoredSubExpression.type == '+') {
      let newCoefficient = pastFullFactor.coefficient * Math.pow(factoredSubExpression.coefficient, pastFullFactor.power);
      let newPower = pastFullFactor.power * factoredSubExpression.power;
      replacement = factoredSubExpression.replaceCoefficientAndPower(newCoefficient, newPower);
    } else {
      throw new Error("This also shouldn't happen");
    }
    if (this.currentExpression.type == '+') {
      // We were factoring the whole expression
      this.currentExpression = replacement;
    } else {
      // Replace the expression with the new factored expression
      let newFactors = this.currentExpression.expressions.concat();
      // Take out the coefficient and add it back a its own factor.
      if (replacement.coefficient != 1) {
        newFactors.push(new Expression(replacement.coefficient, 1, 'v', VariableGroup.CONSTANT));
      }
      if (replacement.type == '+') {
        newFactors.splice(this.currentIndex, 1, replacement.replaceCoefficientAndPower(1, replacement.power));
      } else {
        newFactors.splice(this.currentIndex, 1, ...replacement.expressions);
      }

      const simpleFactors = newFactors.filter(f => f.type == 'v');
      if (simpleFactors.length > 0) {
        const singleSimpleFactor = simpleFactors.reduce((a, b) => {
          return new Expression(a.coefficient * b.coefficient, 1, 'v', a.group.times(b.group));
        });
        newFactors = [singleSimpleFactor].concat(newFactors.filter(f => f.type != 'v'));
      }

      this.currentExpression = new Expression(1, 1, '*', newFactors);
    }

    // Check if any of the factors are the same and combine them.
    const unsimplifiedExpression = this.currentExpression;
    if (this.currentExpression.type == '*') {
      let foundMatch = false;
      let expressions = this.currentExpression.expressions.concat();
      for (let i = 0; i < expressions.length; ++i) {
        let e1 = expressions[i];
        if (e1.type == '+') {
          for (let j = i + 1; j < expressions.length; ++j) {
            let e2 = expressions[j];
            if (e1.stripCoefficientAndPower().isSame(e2.stripCoefficientAndPower())) {
              foundMatch= true;
              e1 = e1.replaceCoefficientAndPower(1, e1.power + e2.power);
              expressions.splice(i, 1, e1);
              expressions.splice(j, 1);
              --j
            }
          }
        }
      }
      if (foundMatch) {
        if (expressions.length == 1) {
          const newC = this.currentExpression.coefficient * Math.pow(expressions[0].coefficient, this.currentExpression.power);
          const newPower = this.currentExpression.power * expressions[0].power;
          this.currentExpression = expressions[0].replaceCoefficientAndPower(newC, newPower);
        } else {
          this.currentExpression = new Expression(this.currentExpression.coefficient, this.currentExpression.power, '*', expressions);
        }
      }
    }

    if (pastFullFactor.toString() != pastFactor.toString()) {
      this.history.push(`So ${pastFullFactor.toDecoratedString()} is the same thing as ${replacement.toDecoratedString()}.`)
    }
    if (pastExpression.toString() != pastFullFactor.toString()) {
      this.history.push(`So ${pastExpression.toDecoratedString()} is the same thing as ${unsimplifiedExpression.toDecoratedString()}.`)
    }
    if (unsimplifiedExpression.toString() != this.currentExpression.toString()) {
      this.history.push(`Note that ${unsimplifiedExpression.toDecoratedString()} can be written as ${this.currentExpression.toDecoratedString()}.`)
    }

    // Clear strategy
    this.currentStrategy = null;
    // Clear index
    this.currentIndex = -1;

    this.history.push(this.currentExpression)
    this.currentQuestion = this.generateKeepGoingQuestion(this.currentExpression);
  }

  generateStrategyQuestion(expression, isStartOfFlow) {
    const choices = this.options.possibleStrategies.concat();
    if (isStartOfFlow) {
      choices.push(Problem.STRATEGIES.NA);
    }
    return new Question(`What method can we use to factorize ${expression.toDecoratedString()}?`, Question.MC, choices, (a) => {
      switch (a) {
        case Problem.STRATEGIES.CF:
          if (CommonFactorStrategy.canFactorize(expression)) {
            return [true, null];
          } else {
            return [false, "These terms do not share a common factor, so we won't be able to take one out."];
          }
        case Problem.STRATEGIES.PST:
          if (PerfectSquareTrinomialStrategy.canFactorize(expression)) {
            return [true, null];
          } else {
            if (expression.expressions.length != 3) {
              return [false, "This method can only be used on trinomials; it can only be used on expressions with exactly 3 terms."];
            } else if (!expression.expressions[0].isObviousPerfectSquare()) {
              return [false, "This method can only be used if the leading term is a perfect square."];
            } else if (!expression.expressions[2].isObviousPerfectSquare()) {
              return [false, "This method can only be used if the last term is a perfect square."];
            } else {
              const sqrt1 = expression.expressions[0].squareRoot();
              const sqrt2 = expression.expressions[2].squareRoot();
              const middle = expression.expressions[1];
              if (!middle.isSame(new Expression(2, 1, '*', [sqrt1, sqrt2]))) {
                return [false, "This method can only be used if the middle term is twice the product of the square roots of the other two terms."];
              }
            }
            return [false, "This isn't a perfect square trinomial."];
          }
        case Problem.STRATEGIES.DS:
          if (DifferenceOfSquaresStrategy.canFactorize(expression)) {
            return [true, null];
          } else {
            if (expression.expressions.length != 2) {
              return [false, "This method can only be used on binomials; it can only be used on expressions with exactly 2 terms."];
            } else if (!expression.expressions[0].isObviousPerfectSquare() || !expression.expressions[1].isObviousPerfectSquare()) {
              return [false, "This method can only be used if both terms are perfect squares."];
            } else if (expression.expressions[0].coefficient * expression.expressions[1],coefficient >= 0) {
              return [false, "This method can only be used if one of the terms is positive and the other is negative."];
            }
            return [false, "This isn't a difference of squares."];
          }
        case Problem.STRATEGIES.QE:
          if (QuadraticExpressionStrategy.canFactorize(expression)) {
            return [true, null];
          } else {
            if (expression.expressions.length != 3) {
              return [false, "This method can only be used on trinomials; it can only be used on expressions with exactly 3 terms."];
            }
            return [false, "Product-Sum won't work."];
          }
        case Problem.STRATEGIES.NA:
          if (isFactorizable(expression, this.options.possibleStrategies)) {
            return [false, "There's a way to factorize this expression further..."];
          } else {
            return [true, null];
          }
        default:
          throw new Error("Unexpected Answer: " + a)
      }
      throw new Error("This should never happen");
    });
  }

  generateKeepGoingQuestion(expression) {
    const question = `Which factor can be factorized further?`;
    let choices = [];
    if (expression.type == '*') {
      choices = expression.expressions.filter(e => e.type == '+').map(e => e.stripCoefficientAndPower());
    } else if (expression.type == '+' && (Math.abs(expression.coefficient) != 1 || expression.power > 1)) {
      choices = [expression.stripCoefficientAndPower()];
    } else {
      throw new Error("Currently assuming that the expression has more than one factor.");
    }
    const choicesString = choices.map(e => e.toDecoratedString());
    choicesString.push(Problem.STRATEGIES.NA)
    return new Question(question, Question.MC, choicesString, (a) => {
      const index = choicesString.indexOf(a);
      if (index == choicesString.length - 1) {
        // The user selected "None of the above". So check if any of the expressions are factorizable.
        for (const c of choices) {
          if (isFactorizable(c, this.options.possibleStrategies)) {
            return [false, "One of these can be factored further..."];
          }
        }
        return [true, null];
      }
      if (isFactorizable(choices[index], this.options.possibleStrategies)) {
        return [true, null];
      }
      return [false, `${a} is already fully factorized.`];
    });
  }
}
