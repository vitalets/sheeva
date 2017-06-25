'use strict';

describe('flatten and sort', () => {

  it('should flatten suites on same level and sort by before/after hooks count', run => {
    const output = run(`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      describe('suite 2', () => {
        before(noop);
        after(noop);
        it('test 2', noop);
      });      
      describe('suite 3', () => {
        before(noop);
        it('test 3', noop);
      });
    `);

    return expectResolve(output, [
      'TEST_END test 2',
      'TEST_END test 3',
      'TEST_END test 1',
    ]);
  });

  it('should flatten and sort suites inside parent suite', run => {
    const output = run(`
      describe('parent suite', () => {
        describe('suite 1', () => {
          it('test 1', noop);
        });
        describe('suite 2', () => {
          before(noop);
          after(noop);
          it('test 2', noop);
        });      
        describe('suite 3', () => {
          before(noop);
          it('test 3', noop);
        });
      });
    `);

    return expectResolve(output, [
      'TEST_END test 2',
      'TEST_END test 3',
      'TEST_END test 1',
    ]);
  });

  it('should flatten suites and sort by nested before/after hooks count', run => {
    const output = run(`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      describe('suite 2', () => {
        before(noop);
        after(noop);
        it('test 2', noop);
      });      
      describe('suite 3', () => {
        before(noop);
        describe('suite 4', () => {
          before(noop);
          after(noop);
          it('test 3', noop);
        }); 
      });
    `);

    return expectResolve(output, [
      'TEST_END test 3',
      'TEST_END test 2',
      'TEST_END test 1',
    ]);
  });

  it('should move tests after suites', run => {
    const output = run(`
      describe('suite 1', () => {
        it('test 1', noop);
        describe('suite 2', () => {
          it('test 2', noop);
        });
      });
    `);

    return expectResolve(output, [
      'TEST_END test 2',
      'TEST_END test 1',
    ]);
  });

  it('should split on flatten phase and sort suites between files', run => {
    const config = {
      newSessionPerFile: false,
    };
    const output = run([`
      describe('suite 1', () => {
        before(noop);
        it('test 1', noop);
      });
      `, `
      describe('suite 2', () => {
        it('test 2', noop);
      });
      describe('suite 3', () => {
        before(noop);
        after(noop);
        it('test 3', noop);
      });      
    `], {config});

    return expectResolve(output, [
      'TEST_END test 3',
      'TEST_END test 1',
      'TEST_END test 2',
    ]);
  });

  it('should not split on flatten phase and sort suites between files if newSessionPerFile = true', run => {
    const config = {
      newSessionPerFile: true,
    };
    const include = ['SESSION', 'TEST_END'];
    const output = run([`
      describe('suite 1', () => {
        before(noop);
        it('test 1', noop);
      });
      `, `
      describe('suite 2', () => {
        it('test 2', noop);
      });
      describe('suite 3', () => {
        before(noop);
        after(noop);
        it('test 3', noop);
      });      
    `], {config, include});

    return expectResolve(output, [
      'SESSION_START 0',
      'TEST_END test 3',
      'TEST_END test 2',
      'SESSION_END 0',
      'SESSION_START 1',
      'TEST_END test 1',
      'SESSION_END 1'
    ]);
  });
});
