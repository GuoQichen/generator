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


/**
 * practical usage
 */

// sleept function 
async function sleep(ms, cb) {
	await ((ms) => new Promise(r => setTimeout(r, ms)))(ms)
	cb && cb.call(this)
}

/**
 * other async function syntax
 * We've seen async function() {} already, but the async keyword can be used with other function syntax:
 */

// arrow function 

// 1
const echo = async (val) => val
echo('hello world').then(val => console.log(val))

// 2
const jsonPromise = urls.map(async (url) => (await fetch(json)).json())

// object method
const storage = {
	async getAvatar(name) {
		const cache = await caches.open('avatars')
		return cache.match(`/avatars/${name}.jpg`)
	}
}

storage.getAvatar('jaffathecake').then()

// class method
class Storage {
	constructor() {
		this.cachePromise = caches.open('avatars');
	}

	async getAvatar(name) {
		const cache = await this.cachePromise;
		return cache.match(`/avatars/${name}.jpg`);
	}
}

const storage_ = new Storage();
storage_.getAvatar('jaffathecake').then();