'use strict';


const escapeRe = require('escape-string-regexp');

describe('annotation: only', () => {

  it('should run only test by $only()', run => {
    const result = run(`
      describe('suite 1', () => {
        it('test 0', noop);
        $only();
        it('test 1', noop);
        it('test 2', noop);
      });

      describe('suite 2', () => {
        it('test 3', noop);
      });
    `);

    return expectResolve(result, [
      'TEST_END test 1',
    ]);
  });

  it('should run only describe by $only()', run => {
    const result = run(`
      $only();
      describe('suite 1', () => {
        it('test 2', noop);
        it('test 3', noop);
      });
      describe('suite 4', () => {
        it('test 4', noop);
      });
    `);

    return expectResolve(result, [
      'TEST_END test 2',
      'TEST_END test 3',
    ]);
  });

  it('should run nested describes and its by $only()', run => {
    const result = run(`
      describe('suite 1', () => {
        it('test 0', noop);
        $only();
        describe('suite 2', () => {
          describe('suite 3', () => {
            it('test 1', noop);
          });
          it('test 2', noop);
          it('test 3', noop);
        });
      });
    `);

    return expectResolve(result, [
      'TEST_END test 1',
      'TEST_END test 2',
      'TEST_END test 3',
    ]);
  });

  it('should run several describes and its by $only', run => {
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
        $only();
        it('test 4', noop);
      });

      describe('suite 3', () => {
        $only();
        describe('suite 4', () => {
          it('test 5', noop);
        });
        $only();
        describe('suite 5', () => {
          it('test 6', noop);
        });
      });
    `);

    return expectResolve(result, [
      'TEST_END test 0',
      'TEST_END test 3',
      'TEST_END test 4',
      'TEST_END test 5',
      'TEST_END test 6',
    ]);
  });

  it('should correctly apply nested $only', run => {
    const result = run(`
      $only();
      describe('suite 1', () => {
        $only();
        it('test 2', noop);
        it('test 3', noop);
      });
    `);

    return expectResolve(result, [
      'TEST_END test 2',
      'TEST_END test 3',
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
      message: new RegExp('^' + escapeRe('ONLY is disallowed but found in 1 file(s):')),
    });
  });

  it('should have only items summary in RUNNER_START', run => {
    const assertions = {
      'length': 1,
      '0.data.result.only.files.size': 1
    };
    const result = run([`
      $only();
      describe('suite 1', () => {
        it('test 1', noop);
      });
    `, `
      describe('suite 2', () => {
        it('test 2', noop);
      });
    `], {include: ['RUNNER_START'], rawEvents: Object.keys(assertions)});

    return expectResolve(result)
      .then(res => expect(res, 'to equal', assertions));
  });
});
