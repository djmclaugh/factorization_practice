export default {
  props: [ 'options' ],

  setup(props, {slots, attrs, emit}) {

    function onChange() {
      //emit('change', props.options);
    }

    return () => {
      const header = Vue.h('h2', {}, 'Options')
      const methodFields = Object.keys(props.options.strategies).map(s => {
        return [
          Vue.h('input', {
            id: 'method-to-practice-' + s,
            type: 'checkbox',
            value: s,
            checked: props.options.strategies[s],
            onInput: (e) => {
              props.options.strategies[s] = e.checked ? true : false;
            }
          }, ''),
          Vue.h('label', {for: 'method-to-practice-' + s}, s),
        ]
      })
      const elementList = methodFields.reduce((a, b) => {
        a.push(Vue.h('br'));
        return a.concat().concat(b);
      });
      const legend = Vue.h('legend', {}, 'Methods to Practice');
      const methods = Vue.h('fieldset', {}, [legend].concat(elementList));

      return Vue.h('div', {}, [header, methods]);
    }
  },
}
