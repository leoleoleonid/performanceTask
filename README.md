# performanceTask
nodejs file reading performance

total time for task as is
Total time: 12113ms.

using p-queue with concurrency = 2
Total time: 12608ms.

using 'JSONStream' module  with concurrency = 2
Total time: 64950ms

using workerThreads with 2 queues (1 for reading and one for parsing)
with concurrency = 2 for both
Total time: 24764ms.

parse by chunks with fs.read (sync forEach and split)
with concurrency = 2
Total time: 11835ms.

read file line by line with 'readline' module
with concurrency = 2
Total time: 13881ms.


