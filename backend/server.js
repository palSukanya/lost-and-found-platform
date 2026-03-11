require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");


const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const communityRoutes = require("./routes/communityRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const connectDB = require('./config/db');
const profileRoutes = require("./routes/profileRoutes");
const app = express();
const PORT = process.env.PORT || 5000;


// 2. CORS FIRST
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ 3. BODY PARSERS BEFORE ROUTES
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);     // Multer still works fine here
app.use("/api/community", communityRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/profile", profileRoutes);

// 6. DB
connectDB();

// 7. Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
  },
});

// Make io available inside controllers via req.app.get('io')
app.set("io", io);

io.on("connection", (socket) => {
  const { userId } = socket.handshake.auth || {};
  if (!userId) {
    console.log("Socket connected without userId, disconnecting");
    return socket.disconnect();
  }

  // Each user joins their own room for direct notifications
  socket.join(userId);
  console.log("Socket connected for user:", userId);

  socket.on("typing", ({ to }) => {
    if (to) {
      io.to(to).emit("typing", { from: userId });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", userId);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
});
