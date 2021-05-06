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
          if (answer instanceof Expression) {
            const span = Vue.h('span', {
              class: 'equation'
            }, format(answer.toString()));
            items.push(Vue.h('p', {}, [span, " ✔️"]));
          } else if (Array.isArray(answer)) {
            items.push(Vue.h('p', {}, [answer[0], " and ", answer[1], " ✔️"]));
          } else {
            items.push(Vue.h('p', {}, parse(answer).concat([" ✔️"])));
          }
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
        if (mistake instanceof Expression) {
          const span = Vue.h('span', {
            class: 'equation'
          }, mistake.toString());
          items.push(Vue.h('p', {}, [span, " ❌"]));
        } else if (Array.isArray(mistake)) {
          items.push(Vue.h('p', {}, [mistake[0], " and ", mistake[1], " ❌"]));
        } else {
          items.push(Vue.h('p', {}, parse(mistake).concat([" ❌"])));
        }
        items.push(Vue.h('p', {}, parse(data.flow.currentMistakeMessage)));
        items.push(Vue.h('p', {}, "Try again!"));
      }

      return Vue.h('div', {}, items);
    };
  },
}
