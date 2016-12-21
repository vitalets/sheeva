/**
 * Check config and apply defaults
 */

const defaults = require('./defaults');

exports.parse = function (inConfig) {
  const config = Object.assign({}, defaults, inConfig);
  config.files = toArray(config.files);
  config.reporters = toArray(config.reporters);
  return config;
};

exports.createEnvs = function (config) {
  let envs = config.createEnvs();
  if (!Array.isArray(envs)) {
    throw new Error('createEnvs should return array');
  }
  if (config.env) {
    envs = envs.filter(env => config.env === env.id);
  }
  if (!envs.length) {
    throw new Error('You should provide at least one env');
  } else {
    const envIds = new Set();
    envs.forEach(env => {
      if (!env || !env.id || envIds.has(env.id)) {
        throw new Error('Each env should have unique id property');
      }
      envIds.add(env.id);
    });
  }
  return envs;
};

function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
