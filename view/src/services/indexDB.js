let db;
const request = window.indexedDB.open("file", 1);
request.onerror = function (event) {
	logger.error('file数据库打开报错');
};
request.onsuccess = function (event) {
	db = request.result;
	logger.info('file数据库打开成功');
};

request.onupgradeneeded = function (event) {
	db = event.target.result;
	let objectStore;
	if (!db.objectStoreNames.contains('person')) {
		objectStore = db.createObjectStore('file', { keyPath: 'filenameOrigin' });
		// objectStore.createIndex('username', 'username', {
		// 	unique: false
		// });
	}
}

export const addDataFromIndexDB = (contentObj) => {
	if (Object.prototype.toString.call(contentObj) !== '[object Object]') {
		return Promise.reject("error_data_type")
	}
	return new Promise((resolve, reject) => {
		const request = db.transaction(['file'], 'readwrite')
			.objectStore('file')
			.add(contentObj);

		request.onsuccess = function (event) {
			resolve("success")
			logger.info('file 数据写入成功');
		};

		request.onerror = function (event) {
			reject(event)
			logger.warn('file 数据写入失败');
		}
	})
}

export const readDataFromIndexDB = (queryString) => {
	if (!queryString) return Promise.reject("no_queryString")
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['file']);
		const objectStore = transaction.objectStore('file');
		const request = objectStore.get(queryString);

		request.onerror = function (event) {
			reject(event)
			logger.error('file 事务失败');
		};

		request.onsuccess = function (event) {
			if (request.result) {
				resolve([request.result])
			} else {
				resolve('未获得数据记录')
			}
		};
	})
}

export const readAllDataFromIndexDB = () => {
	const result = []
	return new Promise((resolve, reject) => {
		const objectStore = db.transaction('file').objectStore('file');
		objectStore.openCursor().onsuccess = function (event) {
			const cursor = event.target.result;
			if (cursor) {
				result.push(cursor.value)
				cursor.continue();
			} else {
				resolve(result)
			}
		};
	})

}

export const updateDataToIndexDB = (contentObj) => {
	if (Object.prototype.toString.call(contentObj) !== '[object Object]') {
		return Promise.reject("error_data_type")
	}
	return new Promise((resolve, reject) => {
		const request = db.transaction(['file'], 'readwrite')
			.objectStore('file')
			.put(contentObj);

		request.onsuccess = function (event) {
			logger.info('file 数据更新成功');
			resolve('success')
		};

		request.onerror = function (event) {
			logger.error('file 数据更新失败');
			reject(event)
		}
	})
}

export const removeDataFromIndexDB = (queryString) => {
	if (!queryString) return Promise.reject("no_queryString")
	return new Promise((resolve, reject) => {
		const request = db.transaction(['file'], 'readwrite')
			.objectStore('file')
			.delete(queryString);

		request.onsuccess = function (event) {
			logger.info('file 数据删除成功');
			resolve('success')
		};
	})
}

export const removeDataByIndexFromIndexDB = (queryString) => {
	return new Promise((resolve, reject) => {
		const request = db.transaction(['file'], 'readwrite')
			.objectStore('file')
			.delete(queryString);

		request.onsuccess = function (e) {
			const result = e.target.result;
			logger.info("file 数据移除成功", result)
			if (result) {
				resolve(result)
			} else {
				resolve("success")
			}
		}
		request.onerror = function (event) {
			logger.error('file 数据移除失败');
			reject(event)
		}
	})
}

export const readDataByIndexFromIndexDB = (queryString, indexName) => {
	return dealWithDataByIndex(queryString, indexName)
		.then(index => {
			return new Promise((resolve, reject) => {
				const request = index.get(queryString);
				request.onsuccess = function (e) {
					const result = e.target.result;
					if (result) {
						resolve(result)
					} else {
						resolve()
					}
				}
				request.onerror = function (event) {
					logger.error('file 数据读取失败');
					reject(event)
				}
			})
		})
}

function dealWithDataByIndex(queryString, indexName = "filenameOrigin") {
	if (!queryString) return Promise.reject("no_queryString")
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['file'], 'readonly');
		const store = transaction.objectStore('file');
		const index = store.index(indexName);
		resolve(index)
	})
}
