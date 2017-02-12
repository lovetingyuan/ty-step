# ty-step
异步流程控制，可以以并行或串行的方式执行给定的函数序列，支持参数传递和错误捕获

Inspired by [step](https://github.com/creationix/step) and [gulp-sequence](https://github.com/teambition/gulp-sequence)

### `install`
`npm install ty-step`

### `usage`

```javascript
var step = require('ty-step')
var af = function(time) {
	return function(next, payload) {
		setTimeout(function() {
			next(null, time)
		}, time)
	}
}
var task = step(af(200), af(100), [af(150), af(80), af(250)], af(400), af(50))
task(function(err, payload) {
	if(err)
		return console.error(err)
	else
		console.log(payload) // payload = [200, 100, [80, 150, 250], 400, 50]
})
```
### `License`
MIT
