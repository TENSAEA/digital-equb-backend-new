require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const connectDB = require("./configs/db");
const userRoutes = require("./routes/userRoutes");
const authMiddleware = require("./middleware/auth");
const equbRoutes = require("./routes/equbRoutes");
const equbDrawRoutes = require("./routes/equbDrawRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const requestRoutes = require("./routes/requestRoutes");
const contributionRoutes = require("./routes/contributionRoutes");
const equbBuySellRoutes = require("./routes/equbBuySellRoutes");
const holidayLotteryRoutes = require("./routes/lotteryRoutes");
const announcementRoutes = require("./routes/announcementRoutes"); // Import announcement routes

// Create 'uploads' directory if it doesn't exist
const fs = require("fs");
const dir = path.join(__dirname, "uploads");

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Express app
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors()); // This allows all origins to make requests

// Connect to MongoDB
connectDB();

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Routes
app.use("/api/users", userRoutes);

// Protected route
app.get("/api/home", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to the home page", user: req.user.email });
});

// Use Equb routes
app.use("/api/equbs", authMiddleware, equbRoutes); // Authenticated users only
// Cotribute Equb routes
app.use("/api/equb", authMiddleware, contributionRoutes); // Authenticated users only
// Use Equb draw routes
app.use("/api/equb-draws", authMiddleware, equbDrawRoutes); // Authenticated users only
//notification routes
app.use("/api/notifications", authMiddleware, notificationRoutes); // Authenticated users
//chat routes
app.use("/api/chat", authMiddleware, chatRoutes); // Authenticated users
//ticket routes
app.use("/api/tickets", authMiddleware, ticketRoutes); // Authenticated users
//request routes
app.use("/api/requests", authMiddleware, requestRoutes);
app.use("/api/equbBuySell", authMiddleware, equbBuySellRoutes);

// Use Holiday Lottery routes
app.use("/api/holiday-lotteries", authMiddleware, holidayLotteryRoutes);
// Use Announcement routes
app.use("/api/announcements", authMiddleware, announcementRoutes); // Authenticated users only
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
