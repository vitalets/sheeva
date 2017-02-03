/**
 * Sub run of Sheeva
 * Injects needed props to global
 */

Object.assign(
  global,
  require('./globals'),
  {run: require('./run')}
);
