const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Body is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    state: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    read_count: {
      type: Number,
      default: 0,
    },
    reading_time: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

blogSchema.pre("save", function () {
  if (this.isModified("body")) {
    const wordsPerMinute = 200;
    const wordCount = this.body.split(/\s+/).length;
    this.reading_time = Math.ceil(wordCount / wordsPerMinute);
  }
});

blogSchema.index({ title: "text", tags: "text" });

module.exports = mongoose.model("Blog", blogSchema);
