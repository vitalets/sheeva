/**
 * Debug how tests read
 * todo: move to separate reporter
 */

/*
const treeify = require('treeify');

exports.printTree = function (suite) {
  console.log(treeify.asTree(getTree(suite)));
};

exports.printQueue = function (tests) {
  tests.forEach(test => {
    console.log(test.name, '-->', test.parents.map(s => s.name).join(' :: '))
  });
};

function getTree(suite) {
  return {
    [suite.name.toUpperCase()]: Object.assign(
      {},
      suite.tests.reduce((r, t) => Object.assign(r, {[t.name]: null}), {}),
      suite.suites.reduce((r, s) => Object.assign(r, getTree(s)), {})
    )
  };
}
*/
