
const escapeRe = require('escape-string-regexp');

describe('only', () => {

  it('should run only test by $only()', run => {
    const result = run(`
      describe('suite 1', () => {
        it('test 0', noop);
        describe('suite 2', () => {
          $only();
          it('test 1', noop);
          describe('suite 3', () => {
            it('test 2', noop);
          });
        });
      });
      
      describe('suite 4', () => {
        it('test 4', noop);
        it('test 5', noop);
      });
    `);

    return expectResolve(result, [
      'SESSION_START 0',
      'SUITE_START root',
      'SUITE_START suite 1',
      'SUITE_START suite 2',
      'TEST_END test 1',
      'SUITE_END suite 2',
      'SUITE_END suite 1',
      'SUITE_END root',
      'SESSION_END 0',
    ]);
  });

  it('should run only describe by $only()', run => {
    const result = run(`
      describe('suite 1', () => {
        it('test 0', noop);
        $only();
        describe('suite 2', () => {
          it('test 1', noop);
          describe('suite 3', () => {
            it('test 2', noop);
          });
        });
      });
      
      describe('suite 4', () => {
        it('test 4', noop);
        it('test 5', noop);
      });
    `);

    return expectResolve(result, [
      'SESSION_START 0',
      'SUITE_START root',
      'SUITE_START suite 1',
      'SUITE_START suite 2',
      'TEST_END test 1',
      'SUITE_START suite 3',
      'TEST_END test 2',
      'SUITE_END suite 3',
      'SUITE_END suite 2',
      'SUITE_END suite 1',
      'SUITE_END root',
      'SESSION_END 0',
    ]);
  });

  it('should run all only describe and it', run => {
    const result = run(`
      describe('suite', () => {
        $only();
        it('test 0', noop);
        it('test 1', noop);
      });
      
      describe('suite 2', () => {
        it('test 2', noop);
        $only();
        it('test 3', noop);
      });
      
      describe('suite 3', () => {
        $only();
        describe('suite 4', () => {
          it('test 4', noop);
        });
      });
    `);

    return expectResolve(result, [
      'SESSION_START 0',
      'SUITE_START root',
      'SUITE_START suite',
      'TEST_END test 0',
      'SUITE_END suite',
      'SUITE_START suite 2',
      'TEST_END test 3',
      'SUITE_END suite 2',
      'SUITE_START suite 3',
      'SUITE_START suite 4',
      'TEST_END test 4',
      'SUITE_END suite 4',
      'SUITE_END suite 3',
      'SUITE_END root',
      'SESSION_END 0',
    ]);
  });

  it('should throw error if $only disallowed by config noOnly flag', run => {
    const config = {noOnly: true};
    const result = run(`
      describe('suite', () => {
        $only();
        it('test 0', noop);
      });
    `, {config});

    return expectReject(result, {
      message: new RegExp('^' + escapeRe('ONLY is disallowed but found in 1 file(s):\n ./test/temp')),
    });
  });

});
