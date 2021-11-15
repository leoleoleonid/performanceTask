const fs = require("fs");
const path = require("path");
const PQueue = require("p-queue").default;
const FastJson = require('fast-json');


const concurrency = 2;
const filesToReadQuantity = 5;
const queue = new PQueue({concurrency});
const target_file_name = path.resolve(__dirname, "citylots.json");


total = 206560;

(async () => {
    const start_time = new Date().getTime();
    console.log(`${new Date().toISOString()}: Starting. Concurrency is ${concurrency}.`);

    for (let i = 0; i < filesToReadQuantity; i++) {
        queue.add(() => {
            return new Promise(async (resolve, reject) => {
                console.log(`${new Date().toISOString()}: #${i} Reading file...`);
                let json = await read(target_file_name);
                const fastJson = new FastJson();
                let j = 0;
                const data = {
                    type: "FeatureCollection",
                    features : []
                };

                fastJson.on('features[*]', (jsonText) => {
                    // console.log(typeof jsonText)
                    // data.features.push(jsonText)
                    setTimeout(() => {
                        data.features.push(JSON.parse(jsonText))
                        if (data.features.length === total) {
                            console.log(`${new Date().toISOString()}: #${i} Done (${Object.keys(data)}, ${data.features.length} fields).`);
                            resolve();
                        }
                    },0)

                    // console.log('fast-json result:',  j++);
                });
                fastJson.write(json)

                // const data = JSON.parse(json)
                console.log(`${new Date().toISOString()}: #${i} Done (${Object.keys(data)}, ${data.features.length} fields).`);
                // resolve()

            });
            // console.log(`${new Date().toISOString()}: #${i} Done (${Object.keys(data)}, ${data.features.length} fields).`);

            // queueParse.add(async () => {
            //     const data = await parse(json);
            //     console.log(`${new Date().toISOString()}: #${i} Done (${Object.keys(data)}, ${data.features.length} fields).`);
            // })
        });
    }

    await queue.onIdle();

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
