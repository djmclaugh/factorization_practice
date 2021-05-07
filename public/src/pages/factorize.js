import { ProblemComponent } from '../components/problem.js'
import Problem from '../util/problem.js'
import {VariableGroup, Expression} from '../util/expression.js'

export default {
  props: [ 'options' ],

  setup(props, {slots, attrs, emit}) {
    return () => {
      const header = Vue.h('h2', {}, 'Factorize the following expression:');
      const t = Vue.h(ProblemComponent, {
        problem: new Problem({
          possibleStrategies: [Problem.STRATEGIES.CF],
        }),
      });
      return Vue.h('div', {}, [header, t]);
    }
  },
}
