function applyTemplate(messageBody, template) {
  return template.replace("*msg*", messageBody);
}

export default {
  applyTemplate,
};
