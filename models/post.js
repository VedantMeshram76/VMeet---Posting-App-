const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    post: {
      type: String,
      required: true,
    },
     user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
   likes:{
        type:Number,
        default:0
    },
    likedBy:[ 
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
 
  },
  {
    timestamps: true,
  }
);

const Post = model("Post", postSchema);

module.exports = Post;