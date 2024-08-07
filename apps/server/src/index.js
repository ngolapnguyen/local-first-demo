const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const User = require("./models/userModel");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cookieParser());

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Persist user data after successful authentication
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Retrieve user data from the session
passport.deserializeUser((id, done) => {
  try {
    User.findOne({ _id: id }).then((user) => {
      done(null, user);
    });
  } catch (error) {
    console.log("error", error);
  }
});

// Middleware
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_SIDE_URI, // Allow requests from the this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these request methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these request headers,
    credentials: true, // Allow credentials
  })
);

// Routes
app.use("/", require("./routes/authenticationRoutes"));
app.use("/api/todo", require("./routes/todoRoutes"));

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
