export default {
  props: [ 'options' ],

  setup(props, {slots, attrs, emit}) {
    return () => {
      const header = Vue.h('h2', {}, 'About')
      const link1 = Vue.h('a', {href: 'https://github.com/djmclaugh/factorization_practice'}, 'https://github.com/djmclaugh/factorization_practice');
      const link2 = Vue.h('a', {href: 'https://github.com/djmclaugh/factorization_practice/issues'}, 'https://github.com/djmclaugh/factorization_practice/issues');
      const source = Vue.h('p', {}, ['Source Code: ', link1])
      const feedback = Vue.h('p', {}, ['Report Bug / Leave Feedback: ', link2])
      return Vue.h('div', {}, [header, source, feedback]);
    }
  },
}
