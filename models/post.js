const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User", // This creates a relationship to our User model
      required: true,
    },
    // Future fields we might add:
    // status: { type: String, enum: ['draft', 'published'], default: 'published' },
    // tags: [String],
    // imageUrl: String,
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model("Post", PostSchema);
