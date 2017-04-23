const fs = require('fs')

const thunk = fn => (...arg) => cb => fn.call(null, ...arg, cb)

thunk(fs.readFile)('./package.json', 'utf8')((error, data) => {
	console.log(`response data is`, data)
})