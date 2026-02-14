const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");


const app = express();   // ✅ CREATE APP FIRST

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/upload", require("./routes/uploadRoutes"));



// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/reconciliation")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Start Server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
