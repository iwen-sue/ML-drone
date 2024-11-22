const User = require('../models/User');
const Endpoint = require('../models/Endpoint');
const { updateEndpoint } = require('./endpointController');

const getUsers = async (req, res) => {

    try {
        await updateEndpoint(req);
        const users = await User.find({ role : 'user'});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAPICalls = async (req, res) => {
    try {
        await updateEndpoint(req);
        const endpoints = await Endpoint.find();
        res.json(endpoints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getAPICalls
};