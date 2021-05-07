import {VariableGroup, Expression} from './expression.js'

const CF = "Common Factor";
// const GR = "Grouping";
const PST = "Perfect Square Trinomial";
const DS = "Difference of Squares";
const QE = "Product-Sum";
const NA = "Already Fully Factorized";

export default class Problem {
  static STRATEGIES = { CF, DS, PST, QE, NA };
  static STRATEGIES_LIST = [CF, DS, PST, QE, NA];

  constructor(options) {
    const n = options.possibleStrategies.length;
    const strategy = options.possibleStrategies[Math.floor(Math.random() * n)];
    switch (strategy) {
      case CF:
        this.expression =  new Expression(1, 1, '+', [
          new Expression(3, 1, 'v', new VariableGroup({x: 4, y: 1})),
          new Expression(6, 1, 'v', new VariableGroup({x: 2, y: 1})),
        ]);
        break;
      case DS:
        this.expression =  new Expression(1, 1, '+', [
          new Expression(4, 1, 'v', new VariableGroup({x: 0, y: 4})),
          new Expression(-9, 1, 'v', new VariableGroup({x: 2, y: 0})),
        ]);
        break;
      case PST:
        this.expression =  new Expression(1, 1, '+', [
          new Expression(4, 1, 'v', new VariableGroup({x: 0, y: 4})),
          new Expression(12, 1, 'v', new VariableGroup({x: 1, y: 2})),
          new Expression(9, 1, 'v', new VariableGroup({x: 2, y: 0})),
        ]);
        break;
      case QE:
        this.expression =  new Expression(1, 1, '+', [
          new Expression(2, 1, 'v', new VariableGroup({x: 2, y: 0})),
          new Expression(5, 1, 'v', new VariableGroup({x: 1, y: 0})),
          new Expression(3, 1, 'v', new VariableGroup({x: 0, y: 0})),
        ]);
        break;
      default:
        this.expression = new Expression(1, 1, '+', [
          new Expression(1, 1, 'v', new VariableGroup({x: 4, y: 1})),
          new Expression(-1, 1, 'v', new VariableGroup({x: 2, y: 1})),
          new Expression(-12, 1, 'v', new VariableGroup({x: 0, y: 1})),
          // new Expression(-1, 1, 'v', new VariableGroup({x: 1, y: 0})),
          // new Expression(-1, 1, 'v', new VariableGroup({x: 1, y: 0})),
          // new Expression(1, 1, 'v', new VariableGroup({x: 0, y: 0})),
          // new Expression(1 + Math.floor(Math.random() * 4), 1, 'v', new VariableGroup({x: 2, y: 0})),
          // new Expression(-5 + Math.floor(Math.random() * 10), 1, 'v', new VariableGroup({x: 1, y: 0})),
          // new Expression(-5 + Math.floor(Math.random() * 10), 1, 'v', new VariableGroup({x: 0, y: 0})),
        ]);
    }
  }
}
