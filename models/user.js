const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    salt: {
        type: String,

    },
    Gender: {
        type: String,
        require: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: "/images/avatar-7964945_640.png"
    },
    followers: {
        type: Number,
        default: 0
    },
    followedBy: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        default: []
    },
    posts:[{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }]
},
    {
        timestamp: true,
    })

const User = model("User", userSchema);
module.exports = User;