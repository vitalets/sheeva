
module.exports = {
  envs: [
    {browser: 'chrome'},
    {browser: 'firefox'},
  ],
  createSession: env => {
    return {
      sessionId: Math.random(),
      env: env
    };
  },
  files: './examples/tests/**/*.js'
};

