class JobStorage {
    constructor() {
      this.storage = new Map();
    }
  
    async set(jobId, data) {
      const jobData = {
        ...data,
        timestamp: Date.now()
      };
      
      this.storage.set(jobId, jobData);
      
      setTimeout(() => {
        this.storage.delete(jobId);
      }, 1800000); // 30 minutes
    }
  
    async get(jobId) {
      return this.storage.get(jobId) || null;
    }
  
    async delete(jobId) {
      this.storage.delete(jobId);
    }
  }
  
  module.exports = new JobStorage();