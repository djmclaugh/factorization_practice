import MultipleChoiceComponent from './multiple_choice.js'
import TermInputComponent from './term_input.js'
import TwoNumbersInputComponent from './two_numbers_input.js'
import { format } from '../util/unicode_format.js'
import Problem from '../util/problem.js'
import { Expression } from '../util/expression.js'
import Flow from '../util/flow.js'
import Question from '../util/question.js'
import { parse } from './equation_parser.js'

// Stategies
const CF = Problem.STRATEGIES.CF;
const PST = Problem.STRATEGIES.PST;
const DS = Problem.STRATEGIES.DS;
const QE = Problem.STRATEGIES.QE;
const NA = Problem.STRATEGIES.NA;
const STRATEGIES = Problem.STRATEGIES_LIST;

function toItem(x, isCorrect) {
  const symbol = isCorrect ? " ✔️" : " ❌";
  const c = isCorrect ? "correct-animation" : "error-animation";
  let line = null;
  if (x instanceof Expression) {
    const equation = Vue.h('span', {
      class: 'equation'
    }, format(x.toString()));
    line = Vue.h('span', {class: c}, [equation, symbol])
  } else if (Array.isArray(x)) {
    line = Vue.h('span', {class: c}, [x[0], " and ", x[1], symbol])
  } else {
    line = Vue.h('span', {class: c}, parse(x).concat([symbol]))
  }
  return Vue.h('p', { key: x.toString() }, line);
}

export const ProblemComponent = {
  props: ['problem'],

  setup(props, {slots, attrs, emit}) {

    const data = Vue.reactive({
      currentProblem: props.problem.expression,
      flow: new Flow(props.problem.expression),
      strategy: null,
      incorectStrategies: [],
      commonFactor: null,
      wrongChoice: null,
      errorMessage: null,
    });

    function onAnswer(choice) {
      data.flow.answer(choice);
    }

    Vue.onUpdated(() => {
      window.scrollTo(0,document.body.scrollHeight);
    });

    return () => {
      const items = [];

      for (const h of data.flow.history) {
        if (h instanceof Expression) {
          items.push(Vue.h('p', {
            class: ['problem', 'equation'],
          }, h.toString()));
        } else if (Array.isArray(h)) {
          items.push(Vue.h('p', {
            class: ['question']
          }, parse(h[0].question)));
          const answer = h[1];
          items.push(toItem(answer, true));
        } else if (typeof h === 'string') {
          items.push(Vue.h('p', {}, parse(h)));
        } else {
          throw new Error("Unexpected history item: " + JSON.stringify(h));
        }
      }

      if (data.flow.currentQuestion) {
        items.push(Vue.h('p', {
          class: ['question'],
        }, parse(data.flow.currentQuestion.question)));

        switch(data.flow.currentQuestion.inputType) {
          case Question.MC:
            items.push(Vue.h(MultipleChoiceComponent, {
              key: "input_" + (data.flow.history.length + 1),
              choices: data.flow.currentQuestion.inputOptions,
              onChoice: onAnswer,
            }));
            break;
          case Question.ST:
            items.push(Vue.h(TermInputComponent, {
              key: "input_" + (data.flow.history.length + 1),
              variables: data.flow.currentQuestion.inputOptions,
              onInput: onAnswer,
            }));
            break;
          case Question.TN:
            items.push(Vue.h(TwoNumbersInputComponent, {
              key: "input_" + (data.flow.history.length + 1),
              onInput: onAnswer,
            }));
            break;
          default:
            throw new Error("Unsupported input type: " + data.flow.currentQuestion.inputType);
        }
      }

      if (data.flow.currentMistake) {
        const mistake = data.flow.currentMistake;
        items.push(toItem(mistake, false));
        items.push(Vue.h('p', {}, parse(data.flow.currentMistakeMessage)));
        items.push(Vue.h('p', {}, "Try again!"));
      }

      return Vue.h('div', {}, items);
    };
  },
}
