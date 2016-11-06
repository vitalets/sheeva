
exports.it = function(pattern, count) {
  for (let i = 1; i <= count; i++) {
    const name = pattern.replace('{i}', i);
    it(name, () => console.log(name));
  }
};

exports.hooks = function(prefix = '') {
  before(() => console.log(`${prefix} before`));
  beforeEach(() => console.log(`${prefix} beforeEach`));
  afterEach(() => console.log(`${prefix} afterEach`));
  after(() => console.log(`${prefix} after`));
};
