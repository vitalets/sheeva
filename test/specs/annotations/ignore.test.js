'use strict';

describe('annotation: ignore', () => {

  it('should exclude/include test for particular target', run => {
    const config = {
      createTargets: function () {
        return [
          {id: 'target1'},
          {id: 'target2'},
        ];
      },
    };
    const output = run(`
      describe('suite 1', () => {
        it('test 0', noop);

        $ignore(target => target.id === 'target1');
        it('test 1', noop);

        $ignore(target => target.id !== 'target1');
        it('test 2', noop);
      });
    `, {config, output: 'treeReport'});

    return expectResolve(output, {
      target1: {
        session0: [
          'TEST_END test 0',
          'TEST_END test 2'
        ]
      },
      target2: {
        session1: [
          'TEST_END test 0',
          'TEST_END test 1'
        ]
      }
    });
  });

  it('should exclude/include suite for particular target', run => {
    const config = {
      createTargets: function () {
        return [
          {id: 'target1'},
          {id: 'target2'},
        ];
      },
    };
    const output = run(`
      describe('suite 0', () => {
        it('test 0', noop);
      });
      
      $ignore(target => target.id === 'target1');      
      describe('suite 1', () => {
        it('test 1', noop);
        it('test 2', noop);
      });

      $ignore(target => target.id !== 'target1');
      describe('suite 2', () => {
        it('test 3', noop);
        it('test 4', noop);
      });
    `, {config, output: 'treeReport'});

    return expectResolve(output, {
      target1: {
        session0: [
          'TEST_END test 0',
          'TEST_END test 3',
          'TEST_END test 4'
        ]
      },
      target2: {
        session1: [
          'TEST_END test 0',
          'TEST_END test 1',
          'TEST_END test 2',
        ]
      }
    });
  });

  it('should accept explicit value', run => {
    const output = run(`
      describe('suite 0', () => {
        $ignore(false);
        it('test 0', noop);
        $ignore(true);
        it('test 1', noop);
        $ignore(null);
        it('test 2', noop);
      });
    `);

    return expectResolve(output, [
      'TEST_END test 0',
      'TEST_END test 2',
    ]);
  });

});
