export default {
  props: [ 'switchTimestamp', 'options' ],

  setup(props, {slots, attrs, emit}) {

    const data = Vue.reactive({
      strategiesError: null,
    });

    // Need to provide a different key each time so that even if the error is the same, Vue will
    // re-render the error element instead of recycling it, which will trigger the animation again.
    let strategiesErrorTimestamp = 0;

    function hasAtLeastOneStrategy() {
      for (let key in props.options.strategies) {
        if (props.options.strategies[key]) {
          return true;
        }
      }
      return false;
    }

    return () => {
      if (props.switchTimestamp > strategiesErrorTimestamp) {
        data.strategiesError = null;
      }
      const header = Vue.h('h2', {}, 'Options')
      const methodFields = Object.keys(props.options.strategies).map(s => {
        return [
          Vue.h('input', {
            id: 'method-to-practice-' + s,
            type: 'checkbox',
            value: s,
            checked: props.options.strategies[s],
            onInput: (e) => {
              props.options.strategies[s] = e.target.checked ? true : false;
              if (!hasAtLeastOneStrategy()) {
                e.target.checked = true;
                props.options.strategies[s] = true;
                data.strategiesError = "At least one method must be selected."
                strategiesErrorTimestamp = Date.now();
              } else {
                data.strategiesError = null;
              }
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
      const methodItems = [legend].concat(elementList);
      if (data.strategiesError) {
        methodItems.push(Vue.h('br'));
        methodItems.push(Vue.h('br'));
        methodItems.push(Vue.h('p', {
          key: "" + strategiesErrorTimestamp,
          class: 'error-animation'
        }, data.strategiesError))
      }
      const methods = Vue.h('fieldset', {}, methodItems);

      return Vue.h('div', {}, [header, methods]);
    }
  },
}
