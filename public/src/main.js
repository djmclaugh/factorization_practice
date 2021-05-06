import { ProblemComponent } from './components/problem.js'
import Problem from './util/problem.js'
import {VariableGroup, Expression} from './util/expression.js'

const App = {
  setup() {
    const data = Vue.reactive({
      value: 1
    });

    return () => {
      const t = Vue.h(ProblemComponent, {
        problem: new Problem({
          possibleStrategies: [Problem.STRATEGIES.CF],
        }),
      });
      return Vue.h('div', {}, [t]);
    };
  },
};

Vue.createApp(App).mount('app');
