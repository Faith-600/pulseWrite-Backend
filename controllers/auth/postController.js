const User = require("../../models/user");
const Post = require("../../models/post");

const createPost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const newPost = new Post({ title, content, author: req.user.id });
    const post = await newPost.save();
    res.status(201).json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", ["name", "username"])
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", [
      "name",
      "username",
    ]);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
};

const updatePost = async (req, res) => {
  const { title, content } = req.body;
  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await post.deleteOne();
    res.json({ msg: "Post removed" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
