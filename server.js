const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const cors = require('cors');

const authController = require('./controllers/authController');
const MLController = require('./controllers/MLController');
const authenticateToken = require('./middleware/authMiddleware');
const connectDB = require('./config/db');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

connectDB();
require('dotenv').config();

const app = express();

app.use(
    cors({
        origin: [
        "https://comp4537t5frontend.netlify.app",
        "http://localhost:3000",
        "http://localhost:3001",
        ],
    credentials: true,
    })
);
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
    // res.json({ message: "Profile page here", user: req.user });
});

app.get('/demo', (req, res) => {
    res.sendFile(__dirname + '/public/demo.html');
    // res.json({ message: "ML drone page here", user: req.user });
});

app.get('/gallery', authenticateToken, (req, res) => {
    res.sendFile(__dirname + '/public/gallery.html');
});

app.get('/js/main.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'public', 'js', 'main.js'));
});

app.post('/generate-caption', upload.single('file'), MLController.generateCaption);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
