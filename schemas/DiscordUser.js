const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    email: String,
    username: String,
    avatar: String,
    banner: String,
    bannerColor: String,
    globalName: String,
    locale: String,
});

module.exports = mongoose.model("DiscordUser", schema);
