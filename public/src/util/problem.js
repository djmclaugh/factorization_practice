import {VariableGroup, Expression} from './expression.js'

const CF = "Common Factor";
// const GR = "Grouping";
const PST = "Perfect Square Trinomial";
const DS = "Difference of Squares";
const QE = "Product-Sum";
const NA = "Already Fully Factorized";

// We don't use a, b, or c as variables since they are used to represent the coeficient of quadratic
// expressions.
// We don't use o because it can look like a 0.
// We don't use i because it could be mistaken for the imaginary unit.
const alphabet = 'defghjkmnpqrstuvwxyz';

function rand(min, max) {
  const value = min + Math.floor(Math.random() * Math.floor((1 + max - min)));
  if (Number.isNaN(value)) {
    debugger;
  }
  return value;
}

function randFromList(list) {
  return list[rand(0, list.length - 1)];
}

function randVars(maxAmount) {
  const amount = rand(1, maxAmount);
  const startIndex = rand(0, alphabet.length - 1 - amount);
  return alphabet.slice(startIndex, startIndex + amount);
}

function generateCFExpression(maxCoefficient, maxPower, maxVariables, maxTerms) {
  const variables = randVars(maxVariables);

  const factorC = rand(1, Math.floor(Math.sqrt(maxCoefficient)));
  const numberOfTerms = rand(2, maxTerms);
  const factorGroup = {};
  for (let v of variables) {
    factorGroup[v] = rand(0, maxPower -  (numberOfTerms / variables.length));
  }
  const factor = new Expression(factorC, 1, 'v', new VariableGroup(factorGroup));

  const terms = [];
  const alreadyChosenGroups = [];
  for (let i = 0; i < numberOfTerms; ++i) {
    let c = rand(1, Math.floor(maxCoefficient / factorC));
    if (Math.random() > 0.5) {
      c = -c;
    }
    let group = null;
    // This is O(infinity), but the odds of repeating more than 10 times are really low.
    // TODO: make this O(finite)
    while (group == null) {
      const g = {};
      for (let v of variables) {
        g[v] = rand(0, maxPower - (factorGroup[v] ? factorGroup[v] : 0));
      }
      group = new VariableGroup(g);
      for (let other of alreadyChosenGroups) {
        if (other.isLike(group)) {
          group = null;
          break;
        }
      }
    }

    alreadyChosenGroups.push(group);
    terms.push(new Expression(c, 1, 'v', group));
  }
  terms.sort((a, b) => VariableGroup.compare(a.group, b.group));
  terms[0] = terms[0].absCoefficient();
  const expression = new Expression(1, 1, '+', terms);
  return new Expression(1, 1, '*', [factor, expression]).simplified();
}

function generateDSExpression(maxCoefficient, maxPower, maxVariables) {
  const variables = randVars(maxVariables);

  let c1 = Math.pow(rand(1, Math.sqrt(maxCoefficient)), 2);
  let c2 = Math.pow(rand(1, Math.sqrt(maxCoefficient)), 2);

  const g1 = {}
  const g2 = {}

  let hasDifference = false;
  for (let v of variables) {
    g1[v] = rand(0, maxPower / 2) * 2
    g2[v] = rand(0, maxPower / 2) * 2
    if (g1[v] != g2[v]) {
      hasDifference = true;
    }
  }
  let randIndex = rand(0, variables.length - 1);
  if (!hasDifference) {
    if (g1[variables[randIndex]] == 0) {
      g1[variables[randIndex]] +=2;
    } else {
      g1[variables[randIndex]] -=2;
    }
  }

  // 10% chance of maybe making it not factorizable because of the coefficients.
  if (Math.random() < 0.1) {
    if (Math.random() < 0.5) {
      if (c1 > maxCoefficient / 2) {
        c1 -= rand(1, maxCoefficient/2);
      } else {
        c1 += rand(1, maxCoefficient/2);
      }
    } else {
      if (c2 > maxCoefficient / 2) {
        c2 -= rand(1, maxCoefficient/2);
      } else {
        c2 += rand(1, maxCoefficient/2);
      }
    }
  }

  // 10% chance of making it not factorizable because of the powers.
  if (Math.random() < 0.1) {
    const v = randFromList(variables);
    if (Math.random() < 0.5) {
      if (g1[v] > maxPower / 2) {
        g1[v] -= 1;
      } else {
        g1[v] += 1;
      }
    } else {
      if (g2[v] > maxPower / 2) {
        g2[v] -= 1;
      } else {
        g2[v] += 1;
      }
    }
  }

  let group1 = new VariableGroup(g1)
  let group2 = new VariableGroup(g2)
  if (VariableGroup.compare(group1, group2) > 0) {
    const temp = group1;
    group1 = group2;
    group2 = temp;
  }

  const t1 = new Expression(c1, 1, 'v', group1);
  const t2 = new Expression(-c2, 1, 'v', group2);

  return new Expression(1, 1, '+', [t1, t2]).simplified();
}

function generatePSTExpression(maxCoefficient, maxPower, maxVariables) {
  const variables = randVars(maxVariables);

  let c1 = Math.pow(rand(1, Math.sqrt(maxCoefficient)), 2);
  let c3 = Math.pow(rand(1, Math.sqrt(maxCoefficient)), 2);
  let c2 = Math.sqrt(c3) * Math.sqrt(c1) * 2;
  // 5% chance of maybe making it not factorizable because of the coefficients not being perfect squares.
  if (Math.random() < 0.05) {
    if (Math.random() < 0.5) {
      if (c1 > maxCoefficient / 2) {
        c1 -= rand(1, maxCoefficient/2);
      } else {
        c1 += rand(1, maxCoefficient/2);
      }
    } else {
      if (c3 > maxCoefficient / 2) {
        c3 -= rand(1, maxCoefficient/2);
      } else {
        c3 += rand(1, maxCoefficient/2);
      }
    }
  }

  // 10% chance of maybe making it not factorizable because of the middle coefficient.
  if (Math.random() < 0.1) {
    if (c2 > maxCoefficient / 2) {
      c2 -= 2;
    } else {
      c2 += 2;
    }
  }

  const g1 = {}
  const g2 = {}

  let hasDifference = false;
  for (let v of variables) {
    g1[v] = rand(0, maxPower / 2) * 2
    g2[v] = rand(0, maxPower / 2) * 2
    if (g1[v] != g2[v]) {
      hasDifference = true;
    }
  }
  let randIndex = rand(0, variables.length - 1);
  if (!hasDifference) {
    if (g1[variables[randIndex]] == 0) {
      g1[variables[randIndex]] +=2;
    } else {
      g1[variables[randIndex]] -=2;
    }
  }

  let group1 = new VariableGroup(g1)
  let group3 = new VariableGroup(g2)
  let group2 = group1.squareRoot().times(group3.squareRoot());

  if (VariableGroup.compare(group1, group3) > 0) {
    const temp = group1;
    group1 = group3;
    group3 = temp;
  }

  const t1 = new Expression(c1, 1, 'v', group1);
  const t2 = new Expression(Math.random() < 0.5 ? c2 : -c2, 1, 'v', group2);
  const t3 = new Expression(c3, 1, 'v', group3);

  return new Expression(1, 1, '+', [t1, t2, t3]).simplified();
}

function generateProductSumExpression(maxCoefficient, maxPower, maxVariables) {
  const variables = randVars(maxVariables);

  const possiblePairs = [];
  const roll = Math.random();
  if (roll < 0.1) {
    // 10% chance to make it not factorizable because negative discriminant
    // s^2 - 4p < 0
    for (let s = 1; s <= maxCoefficient / 2; ++s) {
      for (let p = -maxCoefficient; p <= maxCoefficient; ++p) {
        const d = Math.pow(s, 2) - (4 * p);
        if (p != 0 && d < 0 && !Number.isInteger(Math.sqrt(-d))) {
          possiblePairs.push([s, p]);
        }
      }
    }
  } else if (roll < 0.2) {
    // 10% chance to make it not factorizable because of non-square discriminant
    // s^2 - 4p >= 0, but not a perfect square.
    for (let s = 1; s <= maxCoefficient / 2; ++s) {
      for (let p = -maxCoefficient; p <= maxCoefficient; ++p) {
        const d = Math.pow(s, 2) - (4 * p);
        if (p != 0 && d >= 0 && !Number.isInteger(Math.sqrt(d))) {
          possiblePairs.push([s, p]);
        }
      }
    }
  } else {
    // s^2 - 4p >= 0, and s^2 - 4p is a perfect square.
    for (let s = 1; s <= maxCoefficient / 2; ++s) {
      for (let p = -maxCoefficient; p <= maxCoefficient; ++p) {
        const d = Math.pow(s, 2) - (4 * p);
        if (p != 0 && d >= 0 && Number.isInteger(Math.sqrt(d))) {
          possiblePairs.push([s, p]);
        }
      }
    }
  }
  const chosenPair = randFromList(possiblePairs);
  const s = chosenPair[0];
  const p = chosenPair[1];

  let possibleFactors = [];
  for (let i = 1; i <= Math.abs(p); ++i) {
    if (Math.abs(p) % i == 0) {
      possibleFactors.push(i);
    }
  }

  let c1 = randFromList(possibleFactors);
  let c2 = Math.random() < 0.5 ? -s : s;
  let c3 = p / c1;

  const g1 = {}
  const g2 = {}
  let hasDifference = false;
  for (let v of variables) {
    g1[v] = rand(0, maxPower / 2) * 2
    g2[v] = rand(0, maxPower / 2) * 2
    if (g1[v] != g2[v]) {
      hasDifference = true;
    }
  }
  let v = randFromList(variables);
  if (!hasDifference) {
    if (g1[v] == 0) {
      g1[v] +=2;
    } else {
      g1[v] -=2;
    }
  }

  let group1 = new VariableGroup(g1)
  let group3 = new VariableGroup(g2)
  let group2 = group1.squareRoot().times(group3.squareRoot());
  if (VariableGroup.compare(group1, group3) > 0) {
    const temp = group1;
    group1 = group3;
    group3 = temp;
  }

  const t1 = new Expression(c1, 1, 'v', group1);
  const t2 = new Expression(c2, 1, 'v', group2);
  const t3 = new Expression(c3, 1, 'v', group3);

  return new Expression(1, 1, '+', [t1, t2, t3]).simplified();
}

export default class Problem {
  static get STRATEGIES() { return { CF, DS, PST, QE, NA }; }
  static get STRATEGIES_LIST() { return [CF, DS, PST, QE, NA]; }

  constructor(options) {
    const strategy = randFromList(options.possibleStrategies);
    switch (strategy) {
      case CF:
        this.expression =  generateCFExpression(20, 4, 1, 3);
        break;
      case DS:
        this.expression = generateDSExpression(20, 4, 1);
        break;
      case PST:
      this.expression = generatePSTExpression(20, 4, 1);
        break;
      case QE:
        this.expression = generateProductSumExpression(20, 2, 1);
        break;
      default:
        throw new Error("This shouldn't happen");
    }
    this.options = options;
  }
}
