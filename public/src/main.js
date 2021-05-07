import AboutPage from './pages/about.js'
import FactorizePage from './pages/factorize.js'
import OptionsPage from './pages/options.js'
import Problem from './util/problem.js'

const App = {
  setup() {
    const data = Vue.reactive({
      tab: 1,
      options: {
        strategies: {
          [Problem.STRATEGIES.CF]: true,
          [Problem.STRATEGIES.DS]: true,
          [Problem.STRATEGIES.PST]: true,
          [Problem.STRATEGIES.QE]: true,
        },
      },
    });

    function switchTab(index) {
      return () => {
        data.tab = index;
      }
    }

    return () => {
      const links = ['Factorize!', 'Options', 'About'].map((name, index) => {
        return Vue.h('a', {
          href: '#',
          class: {
            'nav-link': true,
            'nav-selected': data.tab == index,
          },
          onClick: switchTab(index),
        }, name);
      });
      const navigation = Vue.h('nav', {}, links);
      const factorizePage = Vue.h(FactorizePage, {
        options: data.options,
        hidden: data.tab != 0,
      });
      const optionsPage = Vue.h(OptionsPage, {
        options: data.options,
        hidden: data.tab != 1,
      });
      const aboutPage = Vue.h(AboutPage, {
        hidden: data.tab != 2,
      });
      return Vue.h('div', {}, [navigation, factorizePage, optionsPage, aboutPage]);
    };
  },
};

Vue.createApp(App).mount('app');
