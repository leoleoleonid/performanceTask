const fs = require("fs");
const path = require("path");
const PQueue = require("p-queue").default;

const concurrency = 5;
const filesToReadQuantity = concurrency;
const queue = new PQueue({concurrency});

const target_file_name = path.resolve(__dirname, "citylots.json");

(async () => {
    const start_time = new Date().getTime();
    console.log(`${new Date().toISOString()}: Starting. Concurrency is ${concurrency}.`);
    const promises = [];
    for (let i = 0; i < filesToReadQuantity; i++) {
        queue.add(() => {
            console.log(`${new Date().toISOString()}: #${i} Reading file...`);
            promises.push(new Promise(resolve => {
                fs.readFile(target_file_name, (err, data) => {
                    const json = JSON.parse(data);
                    console.log(`${new Date().toISOString()}: #${i} Done (${Object.keys(json).length} fields).`);
                    resolve();
                });
            }));
        });
    }
    await queue.onIdle();
    console.log(`${new Date().toISOString()}: Queue is idle.`);
    await Promise.all(promises);
    const end_time = new Date().getTime();
    console.log(`${new Date().toISOString()}: Done all.`);
    console.log(`${new Date().toISOString()}: Total time: ${end_time - start_time}ms.`);
})();
