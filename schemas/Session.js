const mongoose = require("mongoose");

const DEFAULT_EXPIRES = 3 * 24 * 60 * 60 * 1000; // 3 days

const schema = new mongoose.Schema({
    _id: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    expires: {
        type: Date,
        default: () => Date.now() + DEFAULT_EXPIRES,
    },
});

module.exports = mongoose.model("Session", schema);
