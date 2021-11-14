const fs = require("fs");
const path = require("path");
const PQueue = require("p-queue").default;
const JSONStream = require('JSONStream');

const concurrency = 2;
const filesToReadQuantity = 5;
const queue = new PQueue({concurrency});

const target_file_name = path.resolve(__dirname, "citylots.json");

(async () => {
    const start_time = new Date().getTime();
    console.log(`${new Date().toISOString()}: Starting. Concurrency is ${concurrency}.`);
    for (let i = 0; i < filesToReadQuantity; i++) {
        queue.add(async () => {
                console.log(`${new Date().toISOString()}: #${i} Reading file...`);
                const json = await readStream(target_file_name);
                console.log(`${new Date().toISOString()}: #${i} Done (${Object.keys(json).length} fields). features.length=${json.features.length}`);
        });
    }
    await queue.onIdle();
    console.log(`${new Date().toISOString()}: Queue is idle.`);
    const end_time = new Date().getTime();
    console.log(`${new Date().toISOString()}: Done all.`);
    console.log(`${new Date().toISOString()}: Total time: ${end_time - start_time}ms.`);
})();

async function readStream(filePath) {
    const data = {
        type: "FeatureCollection",
        features : []
    };
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(JSONStream.parse('features.*'))
            .on('data', function (doc) {
                data.features.push(doc);
            })
            .on('end', () => {
                resolve(data)
            });
    });
}
