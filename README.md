# Performance task

###Total time for task as is
Total time: 12113ms.

###Using p-queue with concurrency = 2
Total time: 12608ms.

###Using 'JSONStream' module  with concurrency = 2
Total time: 64950ms

###Using workerThreads with 2 queues (1 for reading and one for parsing) with concurrency = 2 for both
Total time: 24764ms.

###Parse by chunks with fs.read (sync forEach and split) with concurrency = 2
Total time: 11835ms.

###Read file line by line with 'readline' module with concurrency = 2
Total time: 13881ms.

###Parse by chunks with fs.read with optimized loop with concurrency = 2
Total time: 9860ms.

##Best result total tome : 9860ms
