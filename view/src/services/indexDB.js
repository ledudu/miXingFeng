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
	db.createObjectStore('file', { keyPath: 'filenameOrigin' });
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
