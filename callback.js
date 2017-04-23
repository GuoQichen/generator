const fs = require('fs')
const assert = require('assert')

const thunk = fn => (...arg) => cb => fn.call(null, ...arg, cb)
const readFileThunk = thunk(fs.readFile)

function *gen() {
	const file1 = yield readFileThunk('./package.json', 'utf8')
	const file2 = yield readFileThunk('./package.json', 'utf8')
	assert.equal(file1, file2)
}

const run = gen => {
	const it = gen()
	const next = (result) => {
		if(result.done) return result.value
		result.value((err, data) => {
			if(err) return console.log(err)
			next(it.next(data))
		})
	}
	next(it.next())
}

run(gen)