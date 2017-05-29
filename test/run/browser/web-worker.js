/**
 * Web worker uses sub-sheeva to run tests
 */

const SubSheeva = require('../sub-sheeva');
const FN_RE = /(^function)|(=>)/;

self.addEventListener('message', function (e) {
  const {code, subSheevaOptions} = e.data;
  unstringifyFunctions(subSheevaOptions);
  unstringifyFunctions(subSheevaOptions.config);
  new SubSheeva(code, subSheevaOptions).run()
    .then(result => self.postMessage({result}))
    .catch(e => self.postMessage({errorMsg: e.message, report: e.report, result: e.result}));
});

function unstringifyFunctions(config) {
  Object.keys(config).forEach(key => {
    if (typeof config[key] === 'string' && FN_RE.test(config[key])) {
      config[key] = new Function(`return ${config[key]}`)();
    }
  });
}
