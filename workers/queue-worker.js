// workers/queue-worker.js
require('dotenv').config();
const imageQueue = require('../config/queue');

console.log('Queue worker started');

imageQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

imageQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await imageQueue.close();
  process.exit(0);
});