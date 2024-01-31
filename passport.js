const express = require("express");
const passport = require("passport");
const session = require("express-session");
require("./auth");

// Loading environment variables from .env file
require("dotenv").config();

// Adding color support to console.log
require("colors");

// Initializing express app
const app = express();

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

// Use session middleware
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Setting up port
const PORT1 = process.env.PORT1 || 8000;

// Setting up a simple route for the home page
app.get("/", (req, res) => {
  res.send('<a href = "/auth/google">Authenticate with Google</a>');
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Setting up a simple route for the blog page
app.get("/protected", isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.displayName}`);
});

app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/auth/google/failure",
  })
);

app.get("/auth/google/failure", (req, res) => {
  res.send("Something Went Wrong...");
});

// app.get("/logout", (req, res) => {
//   req.logout(() => {
//     req.session.destroy(() => {
//       res.send("Bye-Bye");
//     });
//   });
// });

app.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  res.send("See you soon!");
});

// Starting the server
app.listen(PORT1, () => {
  console.log(
    `Node Server is connected in ${process.env.NODE_ENV} mode on port ${PORT1}`
      .bgMagenta
  );
});
