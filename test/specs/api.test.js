'use strict';

const getSheeva = require('../helpers/sub-sheeva/get-sheeva');
const Reporter = require('../helpers/sub-sheeva/reporter');

describe('api', () => {

  beforeEach(context => {
    context.Sheeva = getSheeva();
    context.reporter = new Reporter();
    context.config = {
      files: {
        content: `it('test 1', noop);`
      },
      reporters: context.reporter,
      createTargets: () => [{id: 'target 1'}]
    };
    context.sheeva = new context.Sheeva(context.config);
  });

  it('run', (run, context) => {
    const {sheeva, reporter} = context;
    return sheeva.run().then(() => {
      expect(reporter.getFlatLog(), 'to equal', [
          'RUNNER_START',
          'RUNNER_STARTED',
          'EXECUTER_START',
          'WORKER_ADD 0',
          'TARGET_START target 1',
          'SESSION_START 0',
          'SUITE_START root',
          'TEST_START test 1',
          'TEST_END test 1',
          'SUITE_END root',
          'SESSION_END 0',
          'TARGET_END target 1',
          'WORKER_DELETE 0',
          'EXECUTER_END',
          'RUNNER_END'
        ]
      );
    });
  });

  it('prepare', (run, context) => {
    const {sheeva, reporter} = context;
    return sheeva.prepare().then(() => {
      expect(reporter.getFlatLog(), 'to equal', [
          'RUNNER_START',
          'RUNNER_STARTED',
        ]
      );
    });
  });

  it('prepare + execute', (run, context) => {
    const {sheeva, reporter} = context;
    return Promise.resolve()
      .then(() => sheeva.prepare())
      .then(() => sheeva.execute())
      .then(() => {
        expect(reporter.getFlatLog(), 'to equal', [
          'RUNNER_START',
          'RUNNER_STARTED',
          'EXECUTER_START',
          'WORKER_ADD 0',
          'TARGET_START target 1',
          'SESSION_START 0',
          'SUITE_START root',
          'TEST_START test 1',
          'TEST_END test 1',
          'SUITE_END root',
          'SESSION_END 0',
          'TARGET_END target 1',
          'WORKER_DELETE 0',
          'EXECUTER_END'
          ]
        );
    });
  });

  it('prepare + execute + end', (run, context) => {
    const {sheeva, reporter} = context;
    return Promise.resolve()
      .then(() => sheeva.prepare())
      .then(() => sheeva.execute())
      .then(() => sheeva.end())
      .then(() => {
        expect(reporter.getFlatLog(), 'to equal', [
            'RUNNER_START',
            'RUNNER_STARTED',
            'EXECUTER_START',
            'WORKER_ADD 0',
            'TARGET_START target 1',
            'SESSION_START 0',
            'SUITE_START root',
            'TEST_START test 1',
            'TEST_END test 1',
            'SUITE_END root',
            'SESSION_END 0',
            'TARGET_END target 1',
            'WORKER_DELETE 0',
            'EXECUTER_END',
            'RUNNER_END',
          ]
        );
      });
  });

  it('should throw for execute without prepare', (run, context) => {
    const {sheeva} = context;
    const output = sheeva.execute();
    return expectReject(output, 'No suites found. Ensure you called prepare().');
  });

  describe('execute with locator', () => {

    beforeEach(context => {
      context.config.files = [{
        content: `
          describe('suite 1', () => {
            it('test 1', noop);
          });`
      }, {
        content: `
          describe('suite 2', () => {
            it('test 2', noop);
          });`
      }];
    });

    it('execute single suite', (run, context) => {
      const {Sheeva, config, reporter} = context;
      const sheeva = new Sheeva(config);
      return Promise.resolve()
        .then(() => sheeva.prepare())
        .then(() => sheeva.execute({targetId: 'target 1', flatSuiteIndex: 1}))
        .then(() => {
          expect(reporter.getFlatLog(), 'to equal', [
              'RUNNER_START',
              'RUNNER_STARTED',
              'EXECUTER_START',
              'WORKER_ADD 0',
              'TARGET_START target 1',
              'SESSION_START 0',
              'SUITE_START root',
              'SUITE_START suite 2',
              'TEST_START test 2',
              'TEST_END test 2',
              'SUITE_END suite 2',
              'SUITE_END root',
              'SESSION_END 0',
              'TARGET_END target 1',
              'WORKER_DELETE 0',
              'EXECUTER_END'
            ]
          );
        });
    });

    it('execute several suites', (run, context) => {
      const {Sheeva, config} = context;
     // config.reporters = new Reporter({include: ['TEST_END']});
      const sheeva = new Sheeva(config);
      return Promise.resolve()
        .then(() => sheeva.prepare())
        .then(() => sheeva.execute({targetId: 'target 1', flatSuiteIndex: 1}))
        .then(() => sheeva.execute({targetId: 'target 1', flatSuiteIndex: 0}))
        .then(() => {
          expect(config.reporters.getFlatLog(), 'to equal', [
              'RUNNER_START',
              'RUNNER_STARTED',

              'EXECUTER_START',
              'WORKER_ADD 0',
              'TARGET_START target 1',
              'SESSION_START 0',
              'SUITE_START root',
              'SUITE_START suite 2',
              'TEST_START test 2',
              'TEST_END test 2',
              'SUITE_END suite 2',
              'SUITE_END root',
              'SESSION_END 0',
              'TARGET_END target 1',
              'WORKER_DELETE 0',
              'EXECUTER_END',

              'EXECUTER_START',
              'WORKER_ADD 0',
              'SESSION_START 1',
              'SUITE_START root',
              'SUITE_START suite 1',
              'TEST_START test 1',
              'TEST_END test 1',
              'SUITE_END suite 1',
              'SUITE_END root',
              'SESSION_END 1',
              'WORKER_DELETE 0',
              'EXECUTER_END'
            ]
          );
        });
    });

    it('execute several targets', (run, context) => {
      const {Sheeva, config} = context;
      config.createTargets = () => [{id: 'target 1'}, {id: 'target 2'}];
      const sheeva = new Sheeva(config);
      return Promise.resolve()
        .then(() => sheeva.prepare())
        .then(() => sheeva.execute({targetId: 'target 1', flatSuiteIndex: 0}))
        .then(() => sheeva.execute({targetId: 'target 2', flatSuiteIndex: 1}))
        .then(() => {
          expect(config.reporters.getFlatLog(), 'to equal', [
              'RUNNER_START',
              'RUNNER_STARTED',

              'EXECUTER_START',
              'WORKER_ADD 0',
              'TARGET_START target 1',
              'SESSION_START 0',
              'SUITE_START root',
              'SUITE_START suite 1',
              'TEST_START test 1',
              'TEST_END test 1',
              'SUITE_END suite 1',
              'SUITE_END root',
              'SESSION_END 0',
              'TARGET_END target 1',
              'WORKER_DELETE 0',
              'EXECUTER_END',

              'EXECUTER_START',
              'WORKER_ADD 0',
              'TARGET_START target 2',
              'SESSION_START 1',
              'SUITE_START root',
              'SUITE_START suite 2',
              'TEST_START test 2',
              'TEST_END test 2',
              'SUITE_END suite 2',
              'SUITE_END root',
              'SESSION_END 1',
              'TARGET_END target 2',
              'WORKER_DELETE 0',
              'EXECUTER_END'
            ]
          );
        });
    });

    it('should throw for unknown target.id', (run, context) => {
      const {Sheeva, config} = context;
      const sheeva = new Sheeva(config);
      const output = Promise.resolve()
        .then(() => sheeva.prepare())
        .then(() => sheeva.execute({targetId: 'abc', flatSuiteIndex: 0}));
      return expectReject(output, 'Unknown target.id: abc');
    });

    it('should throw for invalid flatSuiteIndex', (run, context) => {
      const {Sheeva, config} = context;
      const sheeva = new Sheeva(config);
      const output = Promise.resolve()
        .then(() => sheeva.prepare())
        .then(() => sheeva.execute({targetId: 'target 1', flatSuiteIndex: 10}));
      return expectReject(output, 'Invalid flatSuiteIndex: 10, max: 1');
    });
  });
});
