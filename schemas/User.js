const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    discordUser: {
        type: String,
        ref: "DiscordUser",
        index: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", schema);
