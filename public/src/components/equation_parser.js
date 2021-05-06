export function parse(message) {
  const sections = message.split("@E@");
  const result = [];
  for (let i = 0; i < sections.length; ++i) {
    if (i % 2 == 0) {
      result.push(sections[i]);
    } else {
      result.push(Vue.h('span', { class: 'equation'}, sections[i]));
    }
  }
  return result;
}
