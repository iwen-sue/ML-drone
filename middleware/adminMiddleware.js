const User = require('../models/User');

const isAdmin = async (req, res, next) => {
    const { email } = req.user;
    try {
        const user = await User.findOne({ email })
        user.role === 'admin' ? next() : res.status(401).json({ message: 'Unauthorized' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = isAdmin;