const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authController = require("./controllers/authController");
const MLController = require("./controllers/MLController");
const adminController = require("./controllers/adminController");
const accountController = require("./controllers/accountController");
const authenticateToken = require("./middleware/authMiddleware");
const isAdmin = require("./middleware/adminMiddleware");
const connectDB = require("./config/db");

connectDB();
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500", 
      "https://comp4537t5frontend.netlify.app",
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public")); // Serve static files

app.post("/signup", authController.signup);

app.post("/login", authController.login);

app.post("/generate-image", authenticateToken, MLController.generateImage );

app.get("/generate-image/status/:jobId", authenticateToken, MLController.getGenerationStatus);

app.get('/users', authenticateToken, isAdmin, adminController.getUsers);

app.get('/api-calls', authenticateToken, isAdmin, adminController.getAPICalls);

app.get('/account', authenticateToken, accountController.getAccount);

app.delete('/delete-account', authenticateToken, accountController.deleteAccount);

app.patch('/change-password', authenticateToken, accountController.changePassword);

app.post('/logout', authenticateToken, authController.logout);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
