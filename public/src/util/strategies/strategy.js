// Abstract class hack based on https://stackoverflow.com/questions/29480569/does-ecmascript-6-have-a-convention-for-abstract-classes
export default class Strategy {
  constructor(expression) {
    if (new.target === Strategy) {
      throw new TypeError("Cannot construct Strategy instances directly.");
    }
    this.expression = expression;
    // The start function takes in an expression
    if (typeof this.start !== 'function') {
      throw new TypeError("Must override method");
    }
    // THe onAnswer function take in the answer from the previous question
    if (typeof this.onAnswer !== 'function') {
      throw new TypeError("Must override method");
    }

    // The output of both these functions is an array containing two things, a list of messages to
    // display, and (the next question to ask || the final expression).
  }
}
