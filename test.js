function f(time, err) {
  err = err || null;
  return function(next, payload) {
    if (time === 0)
      next(err, time)
    else
      setTimeout(function() {
        next(err, time);
      }, time)
  }
}
var step = step || require('./index.min')
var assert = assert || require('chai').assert

describe('测试参数合法性', function() {
  it('包含除函数和数组之外的参数，测试一', function() {
    assert.throws(function() {
      step(f(20), f(90), 100, f(30), [f(120), f(80)])
    }, 'Invalid params for "function step()"')
  })
  it('包含除函数和数组之外的参数，测试二', function() {
    assert.throws(function() {
      step(f(20), f(90), f(30), [300, f(120), f(80)])
    }, 'Invalid params for "function step()"')
  })
  it('数组中包含其他数组', function() {
    assert.throws(function() {
      step(f(20), f(90), f(30), [f(120), [f(50)], f(80)])
    }, 'Invalid params for "function step()"')
  })
})

describe('并行序列测试', function() {
  it('不包含方法，空数组', function(done) {
    step([])(function(err, data) {
      assert.isNull(err, '没有错误抛出')
      assert.deepEqual(data, [
        []
      ], '结果正确')
      done()
    })
  })
  it('包含一个方法', function(done) {
    step([f(300)])(function(err, data) {
      assert.isNull(err, '没有错误抛出')
      assert.deepEqual(data, [
        [300]
      ], '结果正确')
      done()
    })
  })
  it('包含多个方法', function(done) {
    step([f(300), f(100), f(400)])(function(err, data) {
      assert.isNull(err, '没有错误抛出')
      assert.deepEqual(data, [
        [100, 300, 400]
      ], '结果正确')
      done()
    })
  })
})

describe('串行序列测试', function() {
  it('不包含方法，参数为空', function(done) {
    step()(function(err, data) {
      assert.isNull(err, '没有错误抛出')
      assert.isArray(data)
      assert.lengthOf(data, 0, '结果为空数组')
      done()
    })
  })
  it('包含一个方法', function(done) {
    step(f(300))(function(err, data) {
      assert.isNull(err, '没有错误抛出')
      assert.deepEqual(data, [300], '结果正确')
      done()
    })
  })
  it('包含多个方法', function(done) {
    step(f(300), f(100), f(400))(function(err, data) {
      assert.isNull(err, '没有错误抛出')
      assert.deepEqual(data, [300, 100, 400], '结果正确')
      done()
    })
  })
})

describe('同时包含串行和并行方法序列', function() {
  it('测试一(包含同步方法)', function(done) {
    var foo = step(f(600), [f(220), f(0), f(680)], f(50), f(0), [f(1000)], f(240), f(180))
    foo(function(err, data) {
      assert.isNull(err, '没有错误抛出')
      assert.deepEqual(data, [600, [0, 220, 680], 50, 0, [1000], 240, 180], '结果正确')
      done()
    })
  })
  it('测试二', function(done) {
    var foo = step(f(400), f(140), [f(380), f(20)], f(500),
      f(10), f(30), [f(320), f(80), f(40)], f(320), [f(20)], f(90))
    foo(function(err, data) {
      assert.isNull(err, '没有错误抛出')
      assert.deepEqual(data, [400, 140, [20, 380], 500, 10, 30,
        [40, 80, 320], 320, [20], 90], '结果正确')
      done()
    })
  })
})

describe('测试错误捕获', function() {
  it('在串行中抛出错误', function(done) {
    var foo = step(f(600), [f(220), f(120), f(680)], f(50), function(next, payload) {
      setTimeout(function() {
        try {
          throw new Error(100);
          next(null, payload);
        } catch (e) {
          next(e);
        }
      }, 100)
    }, [f(1000)], f(240), f(180))
    foo(function(err, data) {
      assert.instanceOf(err, Error, '有错误抛出')
      assert.equal(err.message, 100, '错误信息为 100')
      done()
    })
  })

  it('在并行中抛出错误', function(done) {
    var foo = step(f(600), [f(220), function(next, payload) {
      setTimeout(function() {
        try {
          throw new Error(120);
          next(null, payload);
        } catch (e) {
          next(e);
        }
      }, 120)
    }, f(680)], f(50), [f(1000)], f(240), f(180))
    foo(function(err, data) {
      assert.instanceOf(err, Error, '有错误抛出')
      assert.equal(err.message, 120, '错误信息为 120')
      done()
    })
  })
})

describe('测试异步结果传递', function() {
  function f(time, err) {
    err = err || null;
    var total = function(arr) {
      var result = 0;
      if(!(arr instanceof Array))
        arr = [arr]
      for(var i = 0; i < arr.length; i++) {
        result += arr[i]
      }
      return result
    }
    return function(next, payload) {
      setTimeout(function() {
        next(err, time + total(payload));
      }, time);
    }
  }
  it('将返回的结果相加并传递', function(done) {
    var foo = step(f(60), f(40), [f(220), f(10), f(280)], f(50), [f(500), f(90)], f(240), f(180))
    foo(function(err, data) {
      assert.isNull(err, '没有错误抛出')
      assert.deepEqual(data, [
        61, 101, [111, 321, 381], 863, [953, 1363], 2556, 2736
      ], '结果正确')
      done()
    }, 1)
  })
})
