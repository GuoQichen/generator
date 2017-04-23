const fs = require('fs')
const assert = require('assert')

const readFileAsync = (filePath) => {
	return Promise.resolve({ then(onFulfilled, onRejected) {
		fs.readFile(filePath, 'utf8', (err, data) => {
			if(err) onRejected(err)
			onFulfilled(data)
		})
	}})
}

function *gen() {
	const file1 = yield readFileAsync('./package.json')
	const file2 = yield readFileAsync('./package.json')
	assert.equal(file1, file2)
}

const run = gen => {
	const it = gen()
	const next = (result) => {
		if(result.done) return result.value
		result.value.then((data) => {
			next(it.next(data))
		}).catch((err) => {
			console.log(err)
		})
	}
	next(it.next())
}

run(gen)