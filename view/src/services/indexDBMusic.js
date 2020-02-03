let db;
const request = window.indexedDB.open("music", 1);
request.onerror = function (event) {
	logger.error('music 数据库打开报错');
};
request.onsuccess = function (event) {
	db = request.result;
	logger.info('music 数据库打开成功');
};

request.onupgradeneeded = function (event) {
	db = event.target.result;
	if (!db.objectStoreNames.contains('person')) {
		db.createObjectStore('music', { keyPath: 'filenameOrigin' });
		// objectStore.createIndex('username', 'username', {
		// 	unique: false
		// });
	}
}

export const addMusicDataFromIndexDB = (contentObj) => {
	if (Object.prototype.toString.call(contentObj) !== '[object Object]') {
		return Promise.reject("error_data_type")
	}
	return new Promise((resolve, reject) => {
		const request = db.transaction(['music'], 'readwrite')
			.objectStore('music')
			.add(contentObj);

		request.onsuccess = function (event) {
			resolve("success")
			logger.info('music 数据写入成功');
		};

		request.onerror = function (event) {
			reject(event)
			logger.warn('music 数据写入失败');
		}
	})
}

export const readMusicDataFromIndexDB = (queryString) => {
	if (!queryString) return Promise.reject("no_queryString")
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['music']);
		const objectStore = transaction.objectStore('music');
		const request = objectStore.get(queryString);

		request.onerror = function (event) {
			reject(event)
			logger.error('music 事务失败');
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

export const readAllMusicDataFromIndexDB = () => {
	const result = []
	return new Promise((resolve, reject) => {
		const objectStore = db.transaction('music').objectStore('music');
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

export const updateMusicDataToIndexDB = (contentObj) => {
	if (Object.prototype.toString.call(contentObj) !== '[object Object]') {
		return Promise.reject("error_data_type")
	}
	return new Promise((resolve, reject) => {
		const request = db.transaction(['music'], 'readwrite')
			.objectStore('music')
			.put(contentObj);

		request.onsuccess = function (event) {
			logger.info('music 数据更新成功');
			resolve('success')
		};

		request.onerror = function (event) {
			logger.error('music 数据更新失败');
			reject(event)
		}
	})
}

export const removeMusicDataFromIndexDB = (queryString) => {
	if (!queryString) return Promise.reject("no_queryString")
	return new Promise((resolve, reject) => {
		const request = db.transaction(['music'], 'readwrite')
			.objectStore('music')
			.delete(queryString);

		request.onsuccess = function (event) {
			logger.info('music 数据删除成功');
			resolve('success')
		};
	})
}

export const removeMusicDataByIndexFromIndexDB = (queryString) => {
	return new Promise((resolve, reject) => {
		const request = db.transaction(['music'], 'readwrite')
			.objectStore('music')
			.delete(queryString);

		request.onsuccess = function (e) {
			const result = e.target.result;
			logger.info("music 数据移除成功", result)
			if (result) {
				resolve(result)
			} else {
				resolve("success")
			}
		}
		request.onerror = function (event) {
			logger.error('music 数据移除失败');
			reject(event)
		}
	})
}

export const readMusicDataByIndexFromIndexDB = (queryString, indexName) => {
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
					logger.error('music 数据读取失败');
					reject(event)
				}
			})
		})
}

function dealWithDataByIndex(queryString, indexName = "filenameOrigin") {
	if (!queryString) return Promise.reject("no_queryString")
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['music'], 'readonly');
		const store = transaction.objectStore('music');
		const index = store.index(indexName);
		resolve(index)
	})
}
