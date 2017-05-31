'use strict';

describe('errors (multi)', () => {

  beforeEach(context => {
    context.runOptions.include = ['HOOK_END', 'TEST_END'];
  });

  it('before + after', run => {
    const output = run(`
      describe('suite 1', () => {
        before(() => { throw new Error('err1') });
        after(() => { throw new Error('err2') });
        it('test 0', noop);
      });
    `);

    return expectResolve(output, [
      'HOOK_END suite 1 before err1',
      'HOOK_END suite 1 after err2'
    ]);
  });

  it('after + after', run => {
    const output = run(`
      describe('suite 1', () => {
        after(() => { throw new Error('err1') });
        describe('suite 2', () => {
          after(() => { throw new Error('err2') });
          it('test 0', noop);
        });
      });
    `);

    return expectResolve(output, [
      'TEST_END test 0',
      'HOOK_END suite 2 after err2',
      'HOOK_END suite 1 after err1'
    ]);
  });

  it('test + after + after', run => {
    const output = run(`
      describe('suite 1', () => {
        after(() => { throw new Error('err1') });
        describe('suite 2', () => {
          after(() => { throw new Error('err2') });
          it('test 0', () => { throw new Error('err3') });
        });
      });
    `);

    return expectResolve(output, [
      'TEST_END test 0 err3',
      'HOOK_END suite 2 after err2',
      'HOOK_END suite 1 after err1'
    ]);
  });

  it('beforeEach + afterEach + after', run => {
    const output = run(`
      describe('suite 1', () => {
        beforeEach(() => { throw new Error('err1') });
        afterEach(() => { throw new Error('err2') });
        after(() => { throw new Error('err3') });
        describe('suite 2', () => {
          beforeEach(() => { throw new Error('err4') });
          afterEach(() => { throw new Error('err5') });
          after(() => { throw new Error('err6') });
          it('test 0', noop);
        });
      });
    `);

    return expectResolve(output, [
      'HOOK_END suite 1 beforeEach err1',
      'HOOK_END suite 1 afterEach err2',
      'HOOK_END suite 2 after err6',
      'HOOK_END suite 1 after err3'
    ]);
  });

  it('beforeEach (nested) + afterEach + after', run => {
    const output = run(`
      describe('suite 1', () => {
        afterEach(() => { throw new Error('err2') });
        after(() => { throw new Error('err3') });
        describe('suite 2', () => {
          beforeEach(() => { throw new Error('err4') });
          afterEach(() => { throw new Error('err5') });
          after(() => { throw new Error('err6') });
          it('test 0', noop);
        });
      });
    `);

    return expectResolve(output, [
      'HOOK_END suite 2 beforeEach err4',
      'HOOK_END suite 2 afterEach err5',
      'HOOK_END suite 1 afterEach err2',
      'HOOK_END suite 2 after err6',
      'HOOK_END suite 1 after err3'
    ]);
  });

  it('afterEach * 2 + after * 2', run => {
    const output = run(`
      describe('suite 1', () => {
        afterEach(() => { throw new Error('err2') });
        after(() => { throw new Error('err3') });
        describe('suite 2', () => {
          afterEach(() => { throw new Error('err5') });
          after(() => { throw new Error('err6') });
          it('test 0', noop);
        });
      });
    `);

    return expectResolve(output, [
      'TEST_END test 0',
      'HOOK_END suite 2 afterEach err5',
      'HOOK_END suite 1 afterEach err2',
      'HOOK_END suite 2 after err6',
      'HOOK_END suite 1 after err3'
    ]);
  });

  it('should collect all errors', run => {
    const processOutput = result => {
      return result.errors.toArray().map(item => item.error.message).join(' ');
    };
    const output = run(`
      describe('suite 1', () => {
        afterEach(() => { throw new Error('err2') });
        after(() => { throw new Error('err3') });
        describe('suite 2', () => {
          beforeEach(() => { throw new Error('err4') });
          afterEach(() => { throw new Error('err5') });
          after(() => { throw new Error('err6') });
          it('test 0', noop);
        });
      });
    `, {output: 'result', processOutput});

    return expectResolve(output, 'err4 err5 err2 err6 err3');
  });


});
