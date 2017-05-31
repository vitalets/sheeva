'use strict';

/**
 * Helper methods
 */

exports.getSubSheevaOptions = function (optionsFromTest, {context, target}) {
  const configFromHooks = context.runOptions && context.runOptions.config;
  const configFromTest = optionsFromTest.config;
  const config = Object.assign({}, configFromHooks, configFromTest);
  return Object.assign({
    delay: target.delay,
  }, context.runOptions, optionsFromTest, {config});
};
