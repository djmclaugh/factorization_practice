import { toItalics } from '../util/unicode_format.js'

let uuid = 0;

export default {
  props: [],
  setup(props, {slots, attrs, emit}) {
    const inputIdBase = 'two_numbers-input-' + uuid;
    uuid += 1;

    const input = Vue.reactive({
      r: '',
      s: '',
    });

    function onKeypress(e) {
      if (e.key == 'Enter') {
        // If the user presses the enter key, then behave the same way as if they pressed the 'OK' button.
        submit();
      }
    }

    function submit() {
      emit('input', [Number.parseInt(input.r) || 0, Number.parseInt(input.s) || 0]);
    }

    Vue.onMounted(() => {
      const i = document.getElementById(inputIdBase + "-1");
      i.focus();
      window.scrollTo(0,document.body.scrollHeight);
    })

    return () => {
      const input1 = Vue.h('input', {
        id: inputIdBase + "-1",
        value: input.coefficient,
        type: 'number',
        min: '-99',
        max: '99',
        placeholder: '0',
        class: ['number-input'],
        onInput: (e) => {
          e.stopPropagation();
          input.r = e.target.value;
        },
        onKeypress: onKeypress,
      });
      const input2 = Vue.h('input', {
        id: inputIdBase + "-2",
        value: input.coefficient,
        type: 'number',
        min: '-99',
        max: '99',
        placeholder: '0',
        class: ['number-input'],
        onInput: (e) => {
          e.stopPropagation();
          input.s = e.target.value;
        },
        onKeypress: onKeypress,
      });

      const confirm = Vue.h('button', {
        style: {
          'margin-left': '8px',
        },
        onClick: submit,
      }, 'OK');

      return Vue.h('div', {}, [input1, " and ", input2, confirm]);
    };
  },
}
