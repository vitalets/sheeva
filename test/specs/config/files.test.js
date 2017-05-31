'use strict';

$if(target => target.id === 'sync-target');
describe('config.files', () => {

  it('should reject for empty config.files', run => {
    const config = {
      files: [],
    };
    const result = run([], {config});
    return expectReject(result, 'Empty config.files');
  });

  it('should reject for invalid files', run => {
    const config = {
      files: [123],
    };
    const result = run([], {config});
    return expectReject(result, 'Files should be array of String or Object {name, content}, got 123');
  });

  it('should process file as object with string content', run => {
    const config = {
      files: [{
        name: 'test.js',
        content: `
          describe('suite 1', () => {
            it('test 1', noop);
          });`
      }],
    };
    const result = run([], {config});
    return expectResolve(result, ['TEST_END test 1']);
  });

  it('should generate file name if not passed for file as object', run => {
    const assertions = {
      '0.data.suite.name': '0.js',
      '1.data.suite.name': '1.js',
    };
    const config = {
      files: [
        {content: `it('test 1', noop);`},
        {content: `it('test 2', noop);`},
      ],
    };
    const result = run([], {config, include: ['SUITE_END'], rawEvents: Object.keys(assertions)});
    return expectResolve(result).then(res => expect(res, 'to equal', assertions));
  });


  $ignore(IS_WEB_WORKER);
  it('should process file as object with function content', run => {
    const config = {
      files: [{
        name: 'test.js',
        content: () => {
          describe('suite 1', () => {
            it('test 1', noop);
          });
        }
      }],
    };
    const result = run([], {config});
    return expectResolve(result, ['TEST_END test 1']);
  });

  $if(IS_BROWSER);
  describe('browser', () => {
    it('should process file as url', run => {
      const config = {files: ['data/test.js']};
      const result = run([], {config});
      return expectResolve(result, ['TEST_END test 1']);
    });

    it('should reject for incorrect url', run => {
      const config = {
        files: ['abc'],
      };
      const result = run([], {config});
      return expectReject(result, {
        message: /The script at '.*abc.*' failed to load/,
      });
    });
  });

  $if(IS_NODE);
  describe('node', () => {
    it('should reject for empty matched files', run => {
      const config = {
        files: ['abc'],
      };
      const result = run([], {config});
      return expectReject(result, 'No files matched');
    });

    it('should process file as path', run => {
      const config = {files: ['test/data/test.js']};
      const result = run([], {config});
      return expectResolve(result, ['TEST_END test 1']);
    });

    it('should process directory (without slash)', run => {
      const config = {files: 'test/data/subdir1'};
      const result = run([], {config});
      return expectResolve(result, [
        'TEST_END test 1',
        'TEST_END test 2'
      ]);
    });

    it('should process directory (with slash)', run => {
      const config = {files: ['test/data/subdir2/']};
      const result = run([], {config});
      return expectResolve(result, [
        'TEST_END test 1',
        'TEST_END test 2'
      ]);
    });

    it('should process pattern *.js', run => {
      const config = {files: ['test/data/subdir3/*.js']};
      const result = run([], {config});
      return expectResolve(result, [
        'TEST_END test 1',
        'TEST_END test 2'
      ]);
    });

    it('should process pattern **', run => {
      const config = {files: ['test/data/subdir4/**']};
      const result = run([], {config});
      return expectResolve(result, [
        'TEST_END test 1',
        'TEST_END test 2'
      ]);
    });
  });

});
