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
            const json = await lineByLine(target_file_name);
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

async function lineByLine  (filePath) {
    const skip = 3
    let linesCount = 0;
    let end = false;
    return new Promise((resolve, reject) => {
        var rd = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: process.stdout,
            terminal: false
        });

        const result = {
            type: "FeatureCollection",
            features : []
        };


        rd.on('line', function(item) {
            linesCount++;
            // console.log(item)
            if (linesCount > skip && item !== ',') {
                // setTimeout(() => {
                if (item.slice(-2) === '},') item = item.slice(0,-1);
                if (item.slice(0,2) === ',{') item = item.slice(1);
                try {
                    result.features.push(JSON.parse(item));
                } catch (e) {
                    if (!end) rd.emit('end');
                }
                // },0)
            }
        });

        rd.on('end', function() {
            if (!end) resolve(result);
            end = true;
        });
    })
}
