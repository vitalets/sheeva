describe('config runner', () => {

  it('should call sync startRunner', run => {
    let a = 0;
    const config = {
      startRunner: () => a++,
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

    return expectResolve(result)
      .then(() => expect(a, 'to equal', 1))
  });

  it('should call async startRunner', run => {
    let a = 0;
    const config = {
      startRunner: () => Promise.resolve().then(() => a++)
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

    return expectResolve(result)
      .then(() => expect(a, 'to equal', 1))
  });

  it('should call sync endRunner', run => {
    let a = 0;
    const config = {
      endRunner: () => a++,
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

    return expectResolve(result).then(() => {
      expect(a, 'to equal', 1);
    })
  });

  it('should call async endRunner', run => {
    let a = 0;
    const config = {
      endRunner: () => Promise.resolve().then(() => a++)
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

    return expectResolve(result)
      .then(() => expect(a, 'to equal', 1))
  });

  it('should call startRunner / endRunner in success test', run => {
    let a = 0;
    let b = 0;
    const config = {
      startRunner: () => Promise.resolve().then(() => a++),
      endRunner: () => Promise.resolve().then(() => b++)
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

    return expectResolve(result).then(() => {
      expect(a, 'to equal', 1);
      expect(b, 'to equal', 1);
    })
  });

  it('should call startRunner / endRunner in failed test', run => {
    let a = 0;
    let b = 0;
    const config = {
      startRunner: () => Promise.resolve().then(() => a++),
      endRunner: () => Promise.resolve().then(() => b++)
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', () => { throw new Error('err') });
      });
      `], {config});

    return expectResolve(result).then(() => {
      expect(a, 'to equal', 1);
      expect(b, 'to equal', 1);
    })
  });

  it('should not call startRunner, but call endRunner in case of error in createEnvs', run => {
    let a = 0;
    let b = 0;
    const config = {
      startRunner: () => Promise.resolve().then(() => a++),
      endRunner: () => Promise.resolve().then(() => b++),
      createEnvs: () => { throw new Error('err') }
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

    return expectReject(result, { message: 'err'})
      .then(() => {
        expect(a, 'to equal', 0);
        expect(b, 'to equal', 1);
      });
  });

  it('should call endRunner even if startRunner has error', run => {
    let b = 0;
    const config = {
      startRunner: () => Promise.resolve().then(() => { throw new Error('err') }),
      endRunner: () => Promise.resolve().then(() => b++),
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

    return expectReject(result, { message: 'err'})
      .then(() => expect(b, 'to equal', 1));
  });

});
