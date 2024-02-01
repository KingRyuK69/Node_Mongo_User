// Importing required modules
const express = require("express");
const morgan = require("morgan");

// import mongo connection
const connectDB = require("./config/db");

// Loading environment variables from .env file
require("dotenv").config();

// Adding color support to console.log
require("colors");

// Establishing connection with MongoDB
connectDB();

// Importing routes
const userRoute = require("./routes/userRoute");
const newsRoute = require("./routes/newsRoute");

// Initializing express app
const app = express();

// Using morgan for logging in development environment
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Setting up port
const PORT = process.env.PORT || 3000;

// Enabling express to parse JSON and url-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setting up routes (default routes)
app.use("/api/users", userRoute);
app.use("/api/news", newsRoute);

app.get("/", (req, res) => {
  res.send("Hello Node API!");
});

app.get("/blog", (req, res) => {
  res.send("BlogPost!");
});

// Starting the server
app.listen(PORT, () => {
  console.log(
    `Node Server is connected in ${process.env.NODE_ENV} mode on port ${PORT}`
      .bgRed
  );
});
