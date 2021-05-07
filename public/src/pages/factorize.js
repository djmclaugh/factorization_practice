import { ProblemComponent } from '../components/problem.js'
import Problem from '../util/problem.js'
import {VariableGroup, Expression} from '../util/expression.js'

let uuid = 0;

export default {
  props: [ 'options' ],

  setup(props, {slots, attrs, emit}) {

    function strategies() {
      return Object.keys(props.options.strategies).filter(k => props.options.strategies[k]);
    }

    const data = Vue.reactive({
      problem: new Problem({possibleStrategies: strategies()}),
      hasStarted: false,
      hasFinished: false,
    });

    function makeButton() {
      return Vue.h('button', {
        disabled: data.hasStarted && !data.hasFinished,
        onClick: () => {
          ++uuid;
          data.problem = new Problem({possibleStrategies: strategies()});
          data.hasStarted = false;
          data.hasFinished = false;
        }
      }, 'Generate New Expression');
    }

    return () => {
      const button = makeButton();
      const header = Vue.h('h2', {}, 'Factorize the following expression');
      const t = Vue.h(ProblemComponent, {
        key: "" + uuid,
        problem: data.problem,
        onStart: () => {data.hasStarted = true},
        onReset: () => {
          data.hasStarted = false,
          data.hasFinished = false
        },
        onUndo: () => {data.hasFinished = false},
        onDone: () => {data.hasFinished = true},
      });
      const items = [header, button, t];
      if (data.hasFinished) {
        const button2 = makeButton()
        items.push(button2);
      }
      return Vue.h('div', {}, items);
    }
  },
}
