const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const User = require("../models/User");

const generateImage = async (req, res) => {
  const email = req.user.email;
  try {
    const user = await User.findOne({ email });
    user.reqCount += 1;
    await user.save();

    // Make image generation api call here
    res.send( { message: "Image generated successfully", user });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { generateImage };
