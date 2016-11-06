/**
 * Simple function to put into hooks and tests.
 * And assert later.
 */

const fn = module.exports = function (arg) {
  if (fn.onces.has(arg)) {
    const f = fn.onces.get(arg);
    fn.onces.delete(arg);
    return f;
  } else {
    return function () {
      fn.calls.push(arg);
    };
  }
};

fn.calls = [];
fn.onces = new Map();

fn.once = function (arg, newFn) {
  fn.onces.set(arg, newFn);
};

fn.clear = function (){
  fn.calls.length = 0;
  fn.onces.clear();
};
