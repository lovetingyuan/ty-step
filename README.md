# ty-step

[![travis-ci](https://travis-ci.org/lovetingyuan/ty-step.svg?branch=master "CI")](https://travis-ci.org/lovetingyuan/ty-step)
[![Version](https://img.shields.io/npm/v/ty-step.svg "version")](https://www.npmjs.com/package/ty-step)
[![Dependencies](https://david-dm.org/lovetingyuan/ty-step/status.svg "dependencies")](https://david-dm.org/lovetingyuan/ty-step)
[![License](https://img.shields.io/npm/l/ty-step.svg "License")](https://github.com/lovetingyuan/ty-step/blob/master/LICENSE)

简单的异步流程控制，可以以并行或串行的方式执行给定的函数序列，支持参数传递和错误捕获

Inspired by [`step`](https://github.com/creationix/step) and [`gulp-sequence`](https://github.com/teambition/gulp-sequence)

---------
## Install
`npm install ty-step` or `<script src="index.min.js"></script>`

## Usage

```javascript
var step = require('ty-step') // or window.step for browsers
var af = function (time) {
  return function (next, payload) {
    setTimeout(function () {
      next(null, time)
    }, time)
  }
}
var task = step(af(200), af(100), [af(150), af(80), af(250)], af(400), af(50))
task(function (err, payload) {
  if (err)
    console.error(err)
  else
    console.log(payload) // payload = [200, 100, [80, 150, 250], 400, 50]
})
```

`step`接收一系列的函数或者由函数组成的数组作为参数，这些函数代表要执行的任务，接收`next`和`payload`作为参数。`next`在任务结束时调用，传入的参数为`error`和`data`，`error`代表上一个函数是否发生了错误，若不为`null`则表示发生了错误，会中断执行后续函数，`data`表示上一个函数中`next`传递的结果。`step`返回一个`thunk`函数，传递的`callback`表示对最终结果的处理，同样接收`error`和`data`作为参数

## License
**MIT**
