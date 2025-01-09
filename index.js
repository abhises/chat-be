const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const userRoute = require("./Routes/userRoute");
const chatRoute = require("./Routes/chatRoute");

require("dotenv").config();

app.use(express.json());
app.use(cors());

// routes
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);

const port = process.env.PORT || 5000;
app.listen(port, (req, res) => {
  console.log(`server running at port:${port}`);
});

// MongoDB Connection
const mongoURI = process.env.DB_URL; // Replace with your MongoDB URI
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB database connected..."))
  .catch((err) => console.error("MongoDB connection error:", err));
