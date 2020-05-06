// Mocks during gatsby SSR rendering for docz.
global.document = {
  defaultView: {}
};
global.navigator = {
  userAgent: "node.js"
};
