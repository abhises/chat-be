const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const userRoute = require("./Routes/userRoute");
const chatRoute = require("./Routes/chatRoute");
const messageRoute = require("./Routes/messageRoute");
const { Server } = require("socket.io");

require("dotenv").config();

app.use(express.json());
app.use(cors());

// routes
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);

const port = process.env.PORT || 5000;

const expressServer = app.listen(port, (req, res) => {
  console.log(`server running at port:${port}`);
});

const io = new Server(expressServer, { cors: process.env.CLIENT_URL });

// MongoDB Connection
const mongoURI = process.env.DB_URL; // Replace with your MongoDB URI
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB database connected..."))
  .catch((err) => console.error("MongoDB connection error:", err));

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("new Connection...", socket.id);

  socket.on("addNewUser", (userId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });

    io.emit("getOnlineUsers", onlineUsers);
  });
  // console.log("onlineusers", onlineUsers);

  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(
      (user) => user.userId === message.recipientId
    );
    if (user) {
      io.to(user.socketId).emit("getMessage", message);
      io.to(user.socketId).emit("getNotification", {
        senderId: message.senderId,
        isRead: false,
        date: new Date(),
      });
    }
  });
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});
