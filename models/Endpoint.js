const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    method: { type: String, required: true },
    reqCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Endpoint', endpointSchema);