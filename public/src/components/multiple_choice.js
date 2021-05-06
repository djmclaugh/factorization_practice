import { parse } from './equation_parser.js'

export default {
  props: ['choices'],
  setup(props, {slots, attrs, emit}) {
    function click(event) {
      emit('choice', event.currentTarget.value);
    };

    return () => {
      const items = props.choices.map((choice) => {
        return Vue.h('button', {
          onClick: click,
          value: choice,
          //disabled: choiceObject.disabled,
        }, parse(choice));
      });
      return Vue.h('div', {}, items);
    };
  },
}
