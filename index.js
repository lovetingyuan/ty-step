 // eslint-disable-next-line func-names, semi
(function () {
  if (!Array.isArray) {
    Array.isArray = function isArray(arr) {
      return Object.prototype.toString.call(arr) === '[object Array]'
    }
  }

  function isAllFunc(funcs) {
    if (typeof funcs === 'function') {
      return true
    } else if (Array.isArray(funcs)) {
      for (let i = 0; i < funcs.length; i++) {
        if (typeof funcs[i] !== 'function') {
          return false
        }
      }
      return true
    }
    return false
  }

  function parallel(funcs, callback, payload) {
    const len = funcs.length
    const results = []
    let i = 0
    let error = null
    let stop = false
    if (len === 0) {
      callback(null, results)
      return
    }
    const next = function next(_err, result) {
      if (stop) return
      const err = _err || error
      if (err) {
        stop = true
        callback(err)
      } else {
        results.push(result)
        i += 1
        if (i === len) {
          stop = true
          callback(null, results)
        }
      }
    }
    for (let j = 0; j < len; j++) {
      try {
        funcs[j](next, payload)
      } catch (e) {
        error = e
      }
    }
  }

  function serial(funcs, callback, payload) {
    const len = funcs.length
    const results = []
    let i = 0
    let error = null
    let stop = false
    if (len === 0) {
      callback(null, results)
      return
    }
    const next = function next(_err, result) {
      if (stop) return
      const err = _err || error
      if (err) {
        stop = true
        callback(err)
      } else {
        i += 1
        results.push(result)
        if (i === len) {
          stop = true
          callback(null, results)
        } else {
          try {
            funcs[i](next, result)
          } catch (e) {
            error = e
          }
        }
      }
    }
    try {
      funcs[i](next, payload)
    } catch (e) {
      error = e
    }
  }

  function step(...tasks) {
    for (let i = 0; i < tasks.length; i++) {
      if (!isAllFunc(tasks[i])) {
        throw new Error('Invalid params for "function step()"')
      }
    }
    const serialList = tasks.map((task) => {
      if (Array.isArray(task)) {
        return function (next, payload) { // eslint-disable-line func-names
          parallel(task, (err = null, result) => {
            next(err, result)
          }, payload)
        }
      }
      return task
    })
    return function (callback, payload) {  // eslint-disable-line func-names
      serial(serialList, callback, payload)
    }
  }

  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = step
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(() => step)
  } else {
    this.step = step
  }
}).call(this || (typeof window !== 'undefined' ? window : global))
