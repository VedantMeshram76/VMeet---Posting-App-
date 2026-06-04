const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const upload = require("../middleware/multer");
const Post = require("../models/post");

// signin & signup page rendering 
router.get("/signin", (req, res) => {
    return res.render("signin.ejs", { error: null, user: null });
});

router.get("/signup", (req, res) => {

    return res.render("signup.ejs", { user: req.session.user || null });
});

router.get("/account", (req, res) => {
    return res.render("account.ejs", {
        user: req.session.user
    });
})

// signup & signin logic
router.post("/signup", upload.single("profileImage"), async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    let profileImage = null;

    if (req.file) {
        profileImage = "/uploads/" + req.file.filename;
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);


    const newUser = await User.create({
        fullName: req.body.fullName,
        email: req.body.email,
        gender: req.body.gender,
        password: hashedPassword,
        profileImage: profileImage,
    })

    req.session.user = newUser;

    return res.redirect("/");
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
        console.log("user not found");
        return res.render("signin.ejs", {
            error: "User not found",
            user: null,
        });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        console.log("invalid password");
        return res.render("signin.ejs", {
            error: "Invalid password",
            user: null,
        });
    }

    req.session.user = user;
    return res.redirect("/");


})

// route for update 
router.post("/update", upload.single("profileImage"), async (req, res) => {
    const { fullName, email } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.session.user._id,
            {
                fullName,
                email,
                profileImage: req.file
                    ? "/uploads/" + req.file.filename
                    : req.session.user.profileImage
            },
            { new: true }
        );

        req.session.user = updatedUser;

        res.redirect("/users/account");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error updating account");
    }
});


// route for password update
router.post("/password", async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.session.user._id);

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
        return res.status(400).send("Current password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    req.session.user = user;
    res.redirect("/users/account");
});

// logout route 
router.post("/logout", (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            console.log("Logout Error:", err);
            return res.redirect("/");
        }

        res.clearCookie("connect.sid");


        res.redirect("/");
    });
});


// Profile access route
router.get("/profile/:userId", async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    const postCount = await Post.countDocuments({
        user: user._id
    });


const posts = await Post.find({
    user: user._id
});

    res.render("profile.ejs", {    profileUser: user, postCount, posts, currentUser: req.session.user || null,user: req.session.user || null });
});

// follow user route
router.post("/follow/:userId", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: "Please login first" });
        }

        const userId = req.params.userId;
        const currentUserId = req.session.user._id;

        // Prevent users from following themselves
        if (currentUserId.toString() === userId.toString()) {
            return res.status(400).json({ error: "You cannot follow yourself" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isFollowing = user.followedBy.includes(currentUserId);

        if (isFollowing) {
            // UNFOLLOW LOGIC: Decrease counts and pull user ID out
            user.followers = Math.max(0, user.followers - 1); // Keeps count from dipping under zero
            user.followedBy = user.followedBy.filter(id => id.toString() !== currentUserId.toString());
        } else {
            // FOLLOW LOGIC: Increase counts and push user ID in
            user.followers += 1;
            user.followedBy.push(currentUserId);
        }

        await user.save();

        // Return updated count and current action state back to client
        res.json({
            followers: user.followers,
            isFollowing: !isFollowing
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error processing follow state" });
    }
});

module.exports = router;