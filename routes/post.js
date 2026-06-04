const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const Post = require("../models/post");
const Comment = require("../models/comments");

// create post page
router.get("/post", (req, res) => {
  return res.render("post.ejs",user=req.session.user || null);
})

// create post route
router.post("/post", upload.single("post"), async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/users/signin");
    }

    const { content } = req.body;
    const file = req.file;
    const userId = req.session.user._id;

   
    const postImageUrl = file ? file.path : null;

    const newPost = await Post.create({
      content: content,
      post: postImageUrl,
      user: userId
    });

    return res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating post");
  }
});
// like post route
router.post("/like/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const userId = req.session.user._id;

    if (post.likedBy.includes(userId)) {
      post.likes -= 1;
      post.likedBy.pull(userId);
    }
    else {
      post.likes += 1;
      post.likedBy.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes, liked: post.likedBy.includes(userId) });
  }
  catch(err){
    res.status(500).json({ error: "Error liking post" });
  }

})

// comment on post route
router.post("/comment/:postId", async (req, res) => {
  const { content } = req.body;
  const userId = req.session.user._id;
  const postId = req.params.postId;

  await Comment.create({
    content: content,
    
    user: userId,
    post: postId
  });

  return res.redirect("/");
})

// post route for reading comments

router.get("/read_comments/:postId", async (req, res) => {

  const postId = req.params.postId;

  const comments = await Comment.find({
    post: postId
  }).populate("user");

  const currentPost = await Post.findById(postId).populate("user");

  return res.render("comment_page.ejs", {
    postId,
    comments,
    currentPost,
    user: req.session.user || null,
    postUser: currentPost.user
  });
});

module.exports = router;