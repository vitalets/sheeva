'use strict';

/**
 * Helper methods
 */

exports.getSubSheevaOptions = function (optionsFromTest, {session, context, target}) {
  const configFromHooks = context.runOptions && context.runOptions.config;
  const configFromTest = optionsFromTest.config;
  const config = Object.assign({}, configFromHooks, configFromTest);
  return Object.assign({
    sessionIndex: session.index,
    targetId: target.id,
    delay: target.delay,
  }, context.runOptions, optionsFromTest, {config});
};
