describe('suite 1', function () {

  var i = 0;

  before(function () {
    console.log(`before`)
    //throw new Error('abc')
  });

  before(function () {
    console.log(`before 2`)
    //throw new Error('abc')
  });

  beforeEach(function () {
    console.log(`beforeEach`, i)
    if (i <= 1) {
      i++;
    } else {
      throw new Error('abc')
    }
  });

  afterEach(function () {
    console.log(`afterEach`)
    //throw new Error('abc')
  });

  afterEach(function () {
    console.log(`afterEach 2`)
    //throw new Error('abc')
  });

  after(function () {
    console.log(`after`)
    //throw new Error('abc')
  });

  after(function () {
    console.log(`after2`)
    //throw new Error('abc')
  });

  it('test 1', function() {
    console.log('test 1');
    //throw new Error('abc')
  });

  it('test 1.1', function() {
    console.log('test 1.1');
  });

  describe('suite 2', function () {
    afterEach(function () {
      console.log(`sub afterEach`)
      //throw new Error('abc')
    });

    before(function () {
      console.log(`sub before`)
      //throw new Error('abc')
    });

    after(function () {
      console.log(`sub after`)
      //throw new Error('abc')
    });

    it('test 2', function() {
      console.log('test 2');
    });
    it('test 2.1', function() {
      console.log('test 2.1');
    });
  })


});

