
before(fn('before 1'));
before(fn('before 2'));

beforeEach(fn('beforeEach 1'));
beforeEach(fn('beforeEach 2'));

after(fn('after 1'));
after(fn('after 2'));

afterEach(fn('afterEach 1'));
afterEach(fn('afterEach 2'));

it('test 1', fn('test 1'));
it('test 2', fn('test 2'));
