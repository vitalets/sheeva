
function wait(ms) {
  return new Promise(r => setTimeout(r, 5));
}

describe('username', function () {

  it('should not be empty', () => wait());
  it('should contain only letters', () => wait());

});

describe('password', function () {

  it('should not be empty', () => wait());
  it('should contain number', () => wait());
  it('should contain lower case letter', () => wait());
  it('should contain upper case letter', () => wait());
  it('should be at least 6 chars', () => wait());
  it('should not be too simple', () => wait());

});
