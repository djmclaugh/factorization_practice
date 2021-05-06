let uuid = 0;

export default {
  props: [ 'expectedAnswer' ],
  setup(props, {slots, attrs, emit}) {
    const inputId = 'expression-input-' + uuid;
    uuid += 1;

    const input = Vue.ref("");

    Vue.onMounted(() => {
      const inputElement = document.getElementById(inputId);
      inputElement.focus();
    });

    function submit() {
      emit('expression', input.value);
    }

    return () => {
      const inputNode = Vue.h('input', {
        id: inputId,
        value: input.value,
        onInput: (e) => { input.value = e.target.value; },
        onKeydown: (e) => {
          if (e.key == 'Enter' && input.value.length > 0) {
            submit();
          }
        },
      });
      const confirm = Vue.h('button', {
        disabled: input.value.length == 0,
        onClick: submit,
      }, 'OK');

      return Vue.h('div', {}, [inputNode, confirm]);
    };
  },
}
