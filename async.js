const fs = require('fs')

const readFileAsync = (filePath) => {
	return Promise.resolve({ then(onFulfilled, onRejected) {
		fs.readFile(filePath, 'utf8', (err, data) => {
			if(err) onRejected(err)
			onFulfilled(data)
		})
	}})
}


(async () => {
	const file1 = await readFileAsync('package.json')
	const file2 = await readFileAsync('package.json')
	assert.equal(file1, file2)	
})()