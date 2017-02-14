/*!
*
ty-step v1.0.1
*
https://github.com/lovetingyuan/ty-step | Released under MIT license
*/

// eslint-disable-next-line func-names, semi
(function () {
 /**
  * Polyfill for Array.isArray
  */
  if (!Array.isArray) {
    Array.isArray = function isArray(arr) {
      return Object.prototype.toString.call(arr) === '[object Array]'
    }
  }

 /**
  * 检查参数是否为函数类型或者是否全部由函数组成的数组
  * @param  {Any}  funcs 待检查的参数
  * @return {Boolean}       true表示参数复合描述规定的类型，false表示不符合
  */
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

 /**
  * 并行执行给出的方法
  * @param  {Array}   funcs    待执行的方法序列
  * @param  {Function} callback 执行完成后的回调函数，接收error和data参数
  * @param  {Any}   payload  传递进来的数据
  * @return {Undefined}            无
  */
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

 /**
  * 串行执行给出的函数
  * @param  {Array}   funcs    要执行的方法序列
  * @param  {Function} callback 执行完毕后的回调函数
  * @param  {Any}   payload  传入的额外数据
  * @return 无
  */
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

 /**
  * 串行或并行执行给出的方法及方法序列
  * @param  {Function || Array} tasks 给出的方法序列，只能是函数类型或由函数组成的数组
  * @return {Function}          返回一个thunk函数，接收一个callback函数作为参数，
  *                             callback接收error和data作为参数表示所有任务执行完后的结果
  */
  function step(...tasks) {
    const serialList = []
    for (let i = 0; i < tasks.length; i++) {
      if (!isAllFunc(tasks[i])) {
        throw new Error('Invalid params for "function step()"')
      }
      if (Array.isArray(tasks[i])) {
        serialList.push((next, payload) => { // eslint-disable-line func-names
          parallel(tasks[i], (err = null, result) => {
            next(err, result)
          }, payload)
        })
      } else {
        serialList.push(tasks[i])
      }
    }
    return function (callback, payload) { // eslint-disable-line func-names
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
