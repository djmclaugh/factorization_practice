/*
 * A choice is an array of a certain data type, say T.
 * choices is an array of choices (so an array of arrays of Ts).
 * forEach is a function that takes in an array that contains a selection from each choice.
 * iterate will call forEach for each possible series of choices.
 *
 * For example, if choices is [ [1, 2], [1, 2, 3], [1] ], iterate will call forEach 6 times with the
 * following arrays:
 * - [1, 1, 1]
 * - [1, 2, 1]
 * - [1, 3, 1]
 * - [2, 1, 1]
 * - [2, 2, 1]
 * - [2, 3, 1]
 */
export function iterate(choices, forEach) {
  const counters = choices.map(c => 0);
  while (counters[0] < choices[0].length) {
    const selection = [];
    for (let i = 0; i < choices.length; ++i) {
      selection.push(choices[i][counters[i]]);
    }
    forEach(selection);
    counters[counters.length - 1] += 1;
    for (let i = counters.length - 1; i > 0; --i) {
      if (counters[i] >= choices[i].length) {
        counters[i] = 0;
        counters[i-1] += 1;
      } else {
        break;
      }
    }
  }
}
