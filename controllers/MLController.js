const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const User = require("../models/User");

const generateCaption = async (req, res) => {
  const email = req.user.email;
  try {
    const user = await User.findOne({ email });
    // update the user's request count
    user.reqCount += 1;
    await user.save();

    const fileBuffer = req.file.buffer;
    const originalFileName = req.file.originalname;
    const url =
      "https://image-captioning-service-646262006328.us-west1.run.app/generate-caption/";

    // Create a form and append the image file from the buffer
    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: originalFileName,
      contentType: req.file.mimetype,
      knownLength: fileBuffer.length,
    });

    // Forward the request to the API endpoint
    axios
      .post(url, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }, { timeout: 60000 })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        console.error("Error:", error.message);
        res.status(500).send("An error occurred while processing the image.");
      });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { generateCaption };
