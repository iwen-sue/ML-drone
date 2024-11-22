const User = require("../models/User");

const generateImage = async (req, res) => {
  const email = req.user.email;
  const pathname = req._parsedUrl.pathname;
  
  try {
    await updateEndpoint(pathname, "POST");

    const user = await User.findOne({ email });
    user.reqCount += 1;
    if (user.role !== 'admin' && user.reqCount > 20) {
      return res.status(400).json({ message: "Request limit exceeded" });
    }
    await user.save();

    // Make image generation api call here
    res.send( { message: "Image generated successfully", user });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { generateImage };
