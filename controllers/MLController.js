const User = require("../models/User");
const { updateEndpoint } = require("./endpointController");
const imageQueue = require('../config/queue');
const jobStorage = require('../utils/jobStorage');

const generateImage = async (req, res) => {
  const email = req.user.email;
  const text = req.body.text;
  
  try {
    await updateEndpoint(req);

    const user = await User.findOne({ email });
    user.reqCount += 1;
    if (user.role !== 'admin' && user.reqCount > 20) {
      return res.status(400).json({ message: "Request limit exceeded" });
    }
    await user.save();
    
    const job = await imageQueue.add({
      text,
      email
    }, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      timeout: 120000,
      removeOnComplete: true,
      removeOnFail: true
    });

    await jobStorage.set(job.id, {
      status: 'pending',
      email: email,
      created: Date.now()
    });

    res.status(202).json({ 
      message: "Image generation started",
      jobId: job.id,
      statusEndpoint: `/generate-image/status/${job.id}`
    });

  } catch (error) {
    res.status(500).json({ message: "Server error: ", error });
  }
};

const getGenerationStatus = async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const status = await jobStorage.get(jobId);
    
    if (!status) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (status.email !== req.user.email) {
      return res.status(403).json({ message: "Unauthorized to view this job" });
    }

    return res.status(200).json({
      status: status.status,
      ...(status.result && { result: status.result }),
      ...(status.error && { error: status.error }),
      created: status.created
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ message: "Server error checking status", error: error.message });
  }
};

imageQueue.process(async (job) => {
  try {
    const { text, email } = job.data;
    console.log(`Processing job ${job.id} for ${email}`);
    
    await jobStorage.set(job.id, {
      status: 'processing',
      email
    });

    const { Client } = await import('@gradio/client');
    
    const client = await Promise.race([
      Client.connect("grace2268/black-forest-labs-FLUX.1-dev"),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 30000)
      )
    ]);

    const result = await Promise.race([
      client.predict("/predict", { 		
        param_0: text || "Hello, World!"
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Prediction timeout')), 250000)
      )
    ]);

    await jobStorage.set(job.id, {
      status: 'completed',
      result: result.data,
      email,
      completed: Date.now()
    });

    return result.data;
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    
    await jobStorage.set(job.id, {
      status: 'failed',
      error: error.message,
      email: job.data.email,
      failed: Date.now()
    });
    
    throw error;
  }
});

module.exports = { generateImage, getGenerationStatus };
