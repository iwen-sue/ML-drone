const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const generateCaption = (req, res) => {
    const fileBuffer = req.file.buffer;
    const originalFileName = req.file.originalname;
    const url = 'https://image-captioning-service-646262006328.us-west1.run.app/generate-caption/';

    // Create a form and append the image file from the buffer
    const formData = new FormData();
    formData.append('file', fileBuffer, {
        filename: originalFileName,
        contentType: req.file.mimetype,
        knownLength: fileBuffer.length,
    });

    // Forward the request to the API endpoint
    axios.post(url, formData, {
        headers: {
            ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    })
    .then(response => {
        // Send the API's response back to the frontend
        res.send(response.data);
    })
    .catch(error => {
        console.error('Error:', error.message);
        // Send an error response to the frontend
        res.status(500).send('An error occurred while processing the image.');
    });
}

module.exports = { generateCaption };