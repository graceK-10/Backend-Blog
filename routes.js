const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const postsFilePath = path.join(__dirname, "./data", "blogs.json");

// Helper function to read posts from the file
const readPosts = () => {
  const data = fs.readFileSync(postsFilePath, "utf-8");
  return JSON.parse(data);
};

// Helper function to write posts to the file
const writePosts = (posts) => {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
};

// Generate a new sequential ID as a string
const generateNewId = (posts) => {
  const maxId =
    posts.length > 0 ? Math.max(...posts.map((p) => parseInt(p.id))) : 0;
  return (maxId + 1).toString();
};

// Get all posts
router.get("/", (req, res) => {
  const posts = readPosts();
  res.json(posts);
});

// Get a single post by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const posts = readPosts();
  const post = posts.find((p) => p.id === id);
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

// Create a new post with validation
router.post("/", (req, res) => {
  const { name, date, title, imageUrl, content } = req.body;

  if (!name || !date || !title || !imageUrl || !content) {
    return res.status(400).json({
      message:
        "All fields (name, date, title, imageUrl, content) are required.",
    });
  }

  const posts = readPosts();
  const newId = generateNewId(posts);
  const newPost = {
    id: newId,
    name,
    date,
    title,
    imageUrl,
    content,
    comments: [],
  };
  posts.push(newPost);
  writePosts(posts);
  res.status(201).json(newPost);
});

// Add a comment to a post
router.post("/:id/comments", (req, res) => {
  const { id } = req.params;
  const posts = readPosts();
  const post = posts.find((p) => p.id === id);
  if (post) {
    if (req.body.text) {
      const newComment = { text: req.body.text };
      post.comments.push(newComment);
      writePosts(posts);
      res.status(201).json(newComment);
    } else {
      res.status(400).json({ message: "Comment text is required" });
    }
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

// Delete all comments from a post
router.delete("/:id/comments", (req, res) => {
  const { id } = req.params;
  const posts = readPosts();
  const post = posts.find((p) => p.id === id);
  if (post) {
    post.comments = [];
    writePosts(posts);
    res.status(200).json({ message: "All comments deleted" });
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

module.exports = router;