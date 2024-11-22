const User = require('../models/User');
const bycrpt = require('bcryptjs');
const { updateEndpoint } = require('./endpointController');

const getAccount = async (req, res) => {
    const { email } = req.user;
    const pathname = req._parsedUrl.pathname;
    const method = req.method;

    try {
        await updateEndpoint(pathname, method);
        const user = await User.find({ email })
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAccount = async (req, res) => {
    const { email } = req.user;
    const pathname = req._parsedUrl.pathname;
    const method = req.method;

    try {
        await updateEndpoint(pathname, method);
        const user = await User.findOneAndDelete({ email });
        res.status(200).json({ message: 'Account deleted successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    const { email } = req.user;
    const { password } = req.body;
    const pathname = req._parsedUrl.pathname;
    const method = req.method;

    try {
        await updateEndpoint(pathname, method);
        const hashedPassword = await bycrpt.hash(password, 10);
        // update the password of the user
        const user = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
        res.status(200).json({ message: 'Password changed successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getAccount,
    deleteAccount,
    changePassword
 };