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
    const expression1 = new Expression(1, 1, '+', [
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
    // const expression2 = new Expression(-1, 4, '+', [
    //   new Expression(-1, 1, 'v', new VariableGroup({x: 1, y: 0})),
    //   new Expression(-1, 1, 'v', new VariableGroup({x: 1, y: 0})),
    //   // new Expression(1, 1, 'v', new VariableGroup({x: 0, y: 0})),
    //   // new Expression(1 + Math.floor(Math.random() * 4), 1, 'v', new VariableGroup({x: 2, y: 0})),
    //   // new Expression(-5 + Math.floor(Math.random() * 10), 1, 'v', new VariableGroup({x: 1, y: 0})),
    //   // new Expression(-5 + Math.floor(Math.random() * 10), 1, 'v', new VariableGroup({x: 0, y: 0})),
    // ]);
    this.expression = expression1;
  }
}
