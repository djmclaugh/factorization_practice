import { Expression, VariableGroup } from '../util/expression.js'
import { toItalics } from '../util/unicode_format.js'

let uuid = 0;

export default {
  props: [ 'variables' ],
  setup(props, {slots, attrs, emit}) {
    const inputIdBase = 'term-input-' + uuid;
    uuid += 1;

    props.variables.sort();

    const vars = {};
    for (const v of props.variables) {
      vars[v] = '';
    }

    const input = Vue.reactive({
      coefficient: '',
      vars: vars,
    });

    function onCoefficientKeypress(e) {
      if (e.key != '-' && (e.key < '0' ||  '9' < e.key)) {
        // If the key is not a digit or the minus sign, don't enter it.
        e.preventDefault();
        if ('a' < e.key && e.key < 'z') {
          // If the user enters a letter, go to that variable if it exists.
          const expInput = document.getElementById(inputIdBase + "-" + e.key);
          if (expInput) {
            expInput.value = '1';
            input.vars[e.key] = '1';
            expInput.select();
          }
        } else if (e.key == 'Enter') {
          // If the user presses the enter key, then behave the same way as if they pressed the 'OK' button.
          submit();
        }
      }
    }

    function onKeypress(e) {
      if (e.key < '0' ||  '9' < e.key) {
        // If the key is not a digit, don't enter it.
        e.preventDefault();
        if ('a' < e.key && e.key < 'z') {
          // If the user enters a letter, go to that variable if it exists.
          const expInput = document.getElementById(inputIdBase + "-" + e.key);
          if (expInput) {
            expInput.value = '1';
            input.vars[e.key] = '1';
            expInput.select();
          }
        } else if (e.key == 'Enter') {
          // If the user presses the enter key, then behave the same way as if they pressed the 'OK' button.
          submit();
        }
      }
    }

    function submit() {
      const group = {};
      for (const v of props.variables) {
        group[v] = Number.parseInt(input.vars[v]);
        if (isNaN(group[v])) {
          group[v] = 0;
        }
      }
      let c = Number.parseInt(input.coefficient);
      if (isNaN(c)) {
        if (input.coefficient == '-') {
          c = -1;
        } else {
          c = 1;
        }
      }
      emit('input', new Expression(c, 1, 'v', new VariableGroup(group)));
    }

    Vue.onMounted(() => {
      const c = document.getElementById(inputIdBase + "-coefficient");
      c.focus();
      window.scrollTo(0,document.body.scrollHeight);
    })

    return () => {
      const items = [];
      const inputNode = Vue.h('input', {
        id: inputIdBase + "-coefficient",
        value: input.coefficient,
        inputmode: 'numeric',
        min: '1',
        max: '99',
        placeholder: '1',
        autofocus: true,
        class: ['coefficient-input'],
        onInput: (e) => {
          e.stopPropagation();
          input.coefficient = e.target.value;
        },
        onKeypress: onCoefficientKeypress,
      });
      items.push(inputNode);

      for (const v of Object.keys(input.vars)) {
        items.push(Vue.h('label', {
          for: inputIdBase + "-" + v,
          style: {
            opacity: input.vars[v] == "" ? 0.5 : 1,
          },
        }, " " + toItalics(v)));
        const exponentInput = Vue.h('input', {
          id: inputIdBase + "-" + v,
          type: 'number',
          min: '0',
          max: '9',
          placeholder: '0',
          value: input.vars[v],
          class: ['exponent-input'],
          onInput: (e) => {
            e.stopPropagation();
            if (e.target.value == "") {
              input.vars[v] = "";
            } else {
              input.vars[v] = e.target.value % 10;
            }
          },
          onKeypress: onKeypress,
        });
        items.push(Vue.h('sup', {}, exponentInput));
      }

      const confirm = Vue.h('button', {
        style: {
          'margin-left': '8px',
        },
        onClick: submit,
      }, 'OK');
      items.push(confirm);

      return Vue.h('div', {
        class: ['term-input', 'equation'],
      }, items);
    };
  },
}
