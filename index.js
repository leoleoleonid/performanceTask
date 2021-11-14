const fs = require("fs");
const path = require("path");
const PQueue = require("p-queue").default;
const { Worker } = require('worker_threads')

const concurrency = 2;
const filesToReadQuantity = 5;
const queue = new PQueue({concurrency});
const queueParser = new PQueue({concurrency});
const target_file_name = path.resolve(__dirname, "citylots.json");

(async () => {
    const start_time = new Date().getTime();
    console.log(`${new Date().toISOString()}: Starting. Concurrency is ${concurrency}.`);
    for (let i = 0; i < filesToReadQuantity; i++) {
        queue.add(async () => {
                console.log(`${new Date().toISOString()}: #${i} Reading file...`);
                const json = await read(target_file_name);
                // console.log('json', json.length)
                queueParser.add(async () => {
                    const data = await treadParser({data: json})
                    console.log(`${new Date().toISOString()}: #${i} Done (${Object.keys(data).length} fields). features.length=${data.features.length}`);
                });
        });
    }
    await queue.onIdle();
    await queueParser.onIdle();
    console.log(`${new Date().toISOString()}: Queue is idle.`);
    const end_time = new Date().getTime();
    console.log(`${new Date().toISOString()}: Done all.`);
    console.log(`${new Date().toISOString()}: Total time: ${end_time - start_time}ms.`);
})();


async function read  (filePath) {
    return new Promise((resolve, reject) => {
        let CHUNK_SIZE = 10 * 1024 * 1024,
            buffer = new Buffer.alloc(CHUNK_SIZE);

        fs.open(filePath, 'r', function(err, fd) {
            if (err) throw err;
            let data = '';
            function readNextChunk() {
                fs.read(fd, buffer, 0, CHUNK_SIZE, null, function(err, nread) {
                    if (err) reject(err);

                    if (nread === 0) {
                        // done reading file, do any necessary finalization steps
                        fs.close(fd, function(err) {
                            if (err) reject(err);
                        });
                        resolve(data);
                        return;
                    }

                    if (nread < CHUNK_SIZE) {
                        data = data + (buffer.slice(0, nread)).toString('utf8');
                    } else {
                        data = data + buffer.toString('utf8');
                    }

                    readNextChunk();
                    // do something with `data`, then call `readNextChunk();`
                });
            }
            readNextChunk();
        });
    })
}

function treadParser (workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./treadParser.js', {workerData} );
        worker.on('message', (data) => resolve(data));
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`stopped with  ${code} exit code`));
        })
    })
}
