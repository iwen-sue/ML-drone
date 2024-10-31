const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authController = require('./controllers/authController');
const authenticateToken = require('./middleware/authMiddleware');
const connectDB = require('./config/db');

connectDB();
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public')); // Serve static files

app.post('/signup', authController.signup);
app.post('/login', authController.login);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/drone', authenticateToken, (req, res) => {
    res.json({ message: "ML drone page here" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
