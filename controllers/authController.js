const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { updateEndpoint } = require('./endpointController');

const signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(409).json({ message: 'User already exists' });

        // Add count to the endpoint
        await updateEndpoint(req);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        // Add count to the endpoint
        await updateEndpoint(req);

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate JWT token
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.cookie('token', token, { 
            httpOnly: true, 
            secure: true,
            sameSite: 'None',
            maxAge: 3600000,
            path: '/',
         });

        res.json({ email: user.email , role: user.role });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
    }).json({ message: 'Logged out' });
}

module.exports = { signup, login, logout };
