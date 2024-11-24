const Queue = require('bull');

const createQueue = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  return new Queue('image-generation', redisUrl, {
    redis: {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      tls: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false,
      } : undefined
    }
  });
};

module.exports = createQueue();