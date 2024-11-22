const User = require('../models/User');
const Endpoint = require('../models/Endpoint');
const { updateEndpoint } = require('./endpointController');

const getUsers = async (req, res) => {
    const pathname = req._parsedUrl.pathname;
    const method = req.method;
    try {
        await updateEndpoint(pathname, method);
        const users = await User.find({ role : 'user'});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAPICalls = async (req, res) => {
    const pathname = req._parsedUrl.pathname;
    const method = req.method;

    try {
        await updateEndpoint(pathname, method);
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