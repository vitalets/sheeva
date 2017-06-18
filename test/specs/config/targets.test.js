'use strict';

describe('config targets', () => {

  beforeEach(context => {
    context.options.include = ['SESSION', 'TEST_END'];
  });

  it('should run tests in all targets', run => {
    const config = {
      createTargets: function () {
        return [
          {id: 'target1'},
          {id: 'target2'},
        ];
      },
    };
    const output = run(`
      describe('suite', () => {
        it('test 0', noop);
        it('test 1', noop);
      });
    `, {config, output: 'treeReport'});

    return expectResolve(output, {
      target1: {
        session0: [
          'SESSION_START 0',
          'TEST_END test 0',
          'TEST_END test 1',
          'SESSION_END 0'
        ]
      },
      target2: {
        session1: [
          'SESSION_START 1',
          'TEST_END test 0',
          'TEST_END test 1',
          'SESSION_END 1'
        ]
      }
    });
  });

  it('should fail in case of no targets', run => {
    const config = {
      createTargets: function () {
        return [];
      },
    };
    const output = run(`
        describe('suite', () => {
          it('test 0', noop);
        });
      `, {config});

    return expectReject(output, 'You should provide at least one target');
  });

  it('should fail for invalid config.target', run => {
    const config = {
      target: 'abc',
      createTargets: function () {
        return [
          {id: 'target1'},
          {id: 'target2'},
        ];
      },
    };
    const output = run(`
        describe('suite', () => {
          it('test 0', noop);
        });
      `, {config});

    return expectReject(output, 'Provided target \'abc\' not found');
  });

  it('should filter targets by target option', run => {
    const config = {
      target: 'target1',
      createTargets: function () {
        return [
          {id: 'target1'},
          {id: 'target2'},
        ];
      },
    };
    const output = run(`
      describe('suite', () => {
        it('test 0', noop);
      });
    `, {config});

    return expectResolve(output, [
      'SESSION_START 0',
      'TEST_END test 0',
      'SESSION_END 0'
    ]);
  });

  it('should use id as label', run => {
    const assertions = {
      'config.targets.0.label': 'target1',
      'config.targets.1.label': 'target2',
    };
    const config = {
      createTargets: function () {
        return [
          {id: 'target1'},
          {id: 'target2'},
        ];
      },
    };
    const output = run(`
      describe('suite', () => {
        it('test 0', noop);
      });
    `, {config, output: 'result', keys: assertions});

    return expectResolve(output, assertions);
  });

});
