require('dotenv').config();

const express = require("express");
const app = express();
const userRouter = require("./routes/users");
const postRouter = require("./routes/post");
const aboutRouter = require("./routes/about");
const mongoose = require("mongoose");
const session = require("express-session");
const Post = require("./models/post");
const path = require("path");

const dbURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Vmeet";

mongoose.connect(dbURI)
    .then(() => {
        console.log("Connected to MongoDB successfully")
    })
    .catch((err) => {
        console.log("Database connection error:", err)
    });

const PORT = process.env.PORT || 5000;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); 

// Middleware
app.use(express.static(path.join(__dirname, "Public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

!


app.use(session({
    secret: process.env.SESSION_SECRET || "vedant@24005066",
    resave: false,
    saveUninitialized: true
}));

// Routes
app.use("/users", userRouter);
app.use("/users", postRouter);
app.use("/users", aboutRouter);

app.get("/", async (req, res) => {
    try {
        const posts = await Post.find().populate("user").sort({ createdAt: -1 }).exec();
        return res.render("home.ejs", {
            success: req.query.success,
            user: req.session.user || null,
            posts: posts
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error loading feed");
    }
});

app.listen(PORT, () => {
    console.log("Server is running on port: ", PORT);
});