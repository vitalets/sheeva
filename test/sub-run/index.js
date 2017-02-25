/**
 * Sub run of Sheeva
 * Injects needed props to global
 */

Object.assign(
  global,
  require('./assertions'),
  {
    noop: function () {},
    run: require('./run'),
  }
);
