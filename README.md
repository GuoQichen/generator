# generator

```js
// generator
function *gen() {
	const file1 = yield readFile('./file1.json', 'utf8')
	const file2 = yield readFile('./file2.json', 'utf8')
	console.log(file1, file2)
}
```

## Why generator
要理解为什么generator能解决异步的关键，很重要的一点是理解迭代器模式，迭代器模式中的迭代器根据调用的方式可以分为两种，内部迭代器和外部迭代器，内部迭代器就是`Array.ptototype.forEach`，即内部定义好了迭代的过程。而外部迭代器需要显式的迭代下一个元素，即需要手动调用`next()`方法

```js
// 外部迭代器(需要手动迭代)
const iterator = function (obj) {
	let current = -1
	const __isDone = () => current >= obj.length
	const __getCurrentItem = () => obj[current]
	const next = () => {
		current += 1
		return {
			value: __getCurrentItem(),
			done: __isDone()
		}
	}
	return {
		next
	}
}
const i = iterator([...'一二'])
i.next() // { value: '一', done: false }
i.next() // { value: '二', done: false }
i.next() // { value: undefined, done: true }
```

那么generator之所以能解决的异步，关键在于利用外部迭代器的手动迭代，就能在异步动作完成的时候才去调用next()进行下一步，那么异步动作完成后的通知方式有两种，callback和promise

## 异步的解决方案
1. 使用callback
2. 包装成promise形式

## callback
1. 因为需要使用callback，所以`g.next().value`就应该是一个只接受callback的函数，所以就需要一个函数把多参数异步函数转化成只接受callback的函数 ===> thunk
	
	```js
	// call
	const it = gen()
	it.next().value((error, data) => {
		it.next(data).value((error, data) => {
			it.next(data)
		})
	})
	```

2. thunk
	
	```js
	const thunk = fn => (...arg) => cb => fn.call(null, ...arg, cb)
	```

3. 调用generator的时候不可能每次都手动调用，所以需要一个自动调用函数

	```js
	const run = (gen) => {
		const it = gen()
		const next = (result) => {
			if(result.done) return result.value
			result.value((error, data) => {
				next(it.next(data))
			})
		}
		next(it.next())
	}
	```

4. 所以最后使用thunk函数的调用方式

	```js
	// generator
	function *gen() {
		const file1 = yield readFileThunk('./file1.json', 'utf8')
		const file2 = yield readFileThunk('./file2.json', 'utf8')
		console.log(file1, file2)
	}
	// run
	run(gen)
	```

## promise
1. 首先，需要把异步操作包装成异步形式

	```js
	const readFileAsync = (filePath) => Promise.resolve({ then(onFulfilled, onRejected) {
		fs.readFile(filePath, 'utf8', (err, data) => {
			if(err) return onRejected(err)
			onFulfilled(data)
		})
	}})
	```

2. 自动调用的函数也必须改成promise形式

	```js
	const run = gen => {
		const it = gen()
		const next = (result) => {
			if(result.done) return result.value
			result.value.then((data) => {
				next(it.next(data))
			})
		}
		next(it.next())
	}
	```

## async
1. 是generator的语法糖，不需要自动调用函数，但是只支持promise形式

	```js
	(async () => {
		const file1 = await readFileAsync('./file1.json')
		const file2 = await readFileAsync('./file2.json')
		console.log(file1, file2)
	})()
	```

### something about async
1. return value 

	async函数的返回值是一个promise，如果没有返回值，默认返回一个resolved的promise，如果有返回值，那个值作为resolved的值，如果在async函数中抛错，那么就会返回rejected的promise

	```js
	// wait ms milliseconds
	function wait(ms) {
		return new Promise(r => setTimeout(r, ms));
	}
	async function hello() {
		await wait(500);
		return 'world';
	}
	hello().then(val => console.log(val)) // val will be 'world'
	```

	```js
	async function foo() {
		await wait(500);
		throw Error('bar');
	}
	foo().catch(err => console.log(err)) // err will be 'bar'
	```

2. syntax

	1. normal function

		```js
		async function foo() {}
		```
	2. arrow function

		```js
		// map some URLs to json-promises
		const jsonPromises = urls.map(async url => {
			const response = await fetch(url);
			return response.json();
		});		
		```
	3. object method

		```js
		const storage = {
			async getAvatar(name) {
				const cache = await caches.open('avatars');
				return cache.match(`/avatars/${name}.jpg`);
			}
		};
		storage.getAvatar('jaffathecake').then(…);		
		```
	4. class method

		```js
		class Storage {
			constructor() {
				this.cachePromise = caches.open('avatars');
			}
			async getAvatar(name) {
				const cache = await this.cachePromise;
				return cache.match(`/avatars/${name}.jpg`);
			}
		}
		const storage = new Storage();
		storage.getAvatar('jaffathecake').then(…);		
		```