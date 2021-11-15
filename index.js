const fs = require("fs");
const path = require("path");
const PQueue = require("p-queue").default;
const concurrency = 2;
const filesToReadQuantity = 5;
const queue = new PQueue({concurrency});
const readline = require('readline');

const target_file_name = path.resolve(__dirname, "citylots.json");

(async () => {
    const start_time = new Date().getTime();
    console.log(`${new Date().toISOString()}: Starting. Concurrency is ${concurrency}.`);
    const promises = [];
    for (let i = 0; i < filesToReadQuantity; i++) {
        queue.add(async () => {
            console.log(`${new Date().toISOString()}: #${i} Reading file...`);
            const json = await readAndParseSplinN(target_file_name);
            console.log(`${new Date().toISOString()}: #${i} Done (${json.features.length} fields).`);
        });
    }
    await queue.onIdle();
    console.log(`${new Date().toISOString()}: Queue is idle.`);
    await Promise.all(promises);
    const end_time = new Date().getTime();
    console.log(`${new Date().toISOString()}: Done all.`);
    console.log(`${new Date().toISOString()}: Total time: ${end_time - start_time}ms.`);
})();

async function readAndParseSplinN  (filePath) {
    return new Promise((resolve, reject) => {
        let CHUNK_SIZE =  10*1024 * 1024;
        let buffer = new Buffer.alloc(CHUNK_SIZE);
        let restSrt = '';
        const result = {
            type: "FeatureCollection",
            features : []
        };
        let isLast = false;
        fs.open(filePath, 'r', function(err, fd) {
            if (err) throw err;
            let data = '';
            function readNextChunk(isFirst = false) {
                fs.read(fd, buffer, 0, CHUNK_SIZE, null, function(err, nread) {
                    if (err) reject(err);

                    if (nread === 0) {
                        // done reading file, do any necessary finalization steps
                        fs.close(fd, function(err) {
                            if (err) reject(err);
                        });
                        resolve(result);
                        return;
                    }

                    if (nread < CHUNK_SIZE) {
                        data = restSrt + (buffer.slice(0, nread)).toString('utf8');
                        isLast = true;
                    } else {
                        data = restSrt + buffer.toString('utf8');
                    }

                    if(isFirst) {
                        data = data.substring(45, data.length - 1);
                    }
                    if(isLast) data = data.substring(0,data.length - 6);
                    const sep = /[^\n]*/
                    while(data.length) {
                        let res = sep.exec(data);
                        if (!res) {
                            restSrt = data;
                            break;
                        }
                        let [item] = res;
                        data = data.substring(item.length+3, data.length);
                        if (item !== ',') {
                            const rawItem = item;
                            if (item.slice(-2) === '},') item = item.slice(0,-1);
                            if (item.slice(0,2) === ',{') item = item.slice(1);
                            try {
                                result.features.push(JSON.parse(item))
                            } catch (e) {
                                restSrt = rawItem;
                                data = '';
                            }
                        }
                    }

                    readNextChunk(false)

                });
            }
            readNextChunk(true);
        });
    })
}
