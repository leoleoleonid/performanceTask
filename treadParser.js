const { workerData, parentPort } = require('worker_threads');
const json = JSON.parse(workerData.data);
parentPort.postMessage(json)
