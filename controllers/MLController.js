const User = require("../models/User");
const { updateEndpoint } = require("./endpointController");

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
    
    console.log("Generating image...");
    const { Client } = await import('@gradio/client');

    const client = await Client.connect("grace2268/black-forest-labs-FLUX.1-dev");
    const result = await client.predict("/predict", { 		
        param_0: text? text : "Hello, World!"
    });

    console.log(result.data);

    res.status(200).json({ message: "Image generated successfully", result: result.data });

  } catch (error) {
    res.status(500).json({ message: "Server error: ", error });
  }
};

module.exports = { generateImage };
