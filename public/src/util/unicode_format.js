const numbers = '0123456789';
const superscripts = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const variables = ['𝑎','𝑏','𝑐','𝑑','𝑒','𝑓','𝑔','ℎ','𝑖','𝑗','𝑘','𝑙','𝑚','𝑛','𝑜','𝑝','𝑞','𝑟','𝑠','𝑡','𝑢','𝑣','𝑤','𝑥','𝑦','𝑧'];

export function toSuperscript(numberString) {
  let newExpression = [];
  for (let character of numberString) {
    const numberIndex = numbers.indexOf(character);
    if (numberIndex == -1) {
      throw new Error("Invalid Input: Expected a string of just digits.");
    }
    newExpression.push(superscripts[numberIndex]);
  }
  return newExpression.join('');
}

export function toItalics(variable) {
  let newExpression = [];
  for (let character of variable) {
    const index = alphabet.indexOf(character);
    if (index == -1) {
      throw new Error("Invalid Input: Expected a string of just lowercase letters.");
    }
    newExpression.push(variables[index]);
  }
  return newExpression.join('');
}

export function format(expression) {
  let newExpression = [];
  let inExponent = false;
  for (let character of expression) {
    if (character == '^') {
      inExponent = true;
    } else {
      const numberIndex = numbers.indexOf(character);
      const alphabetIndex = alphabet.indexOf(character);
      if (numberIndex != -1) {
        newExpression.push(inExponent ? superscripts[numberIndex] : character)
      } else if (alphabetIndex != -1) {
        inExponent = false;
        newExpression.push(variables[alphabetIndex]);
      } else {
        inExponent = false;
        newExpression.push(character);
      }
    }
  }
  return newExpression.join('');
}
