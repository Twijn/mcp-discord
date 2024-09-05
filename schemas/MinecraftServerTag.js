const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: String,
    category: {
        type: String,
        enum: ["gametype"],
        default: "gametype",
    },
});

module.exports = mongoose.model("MinecraftServerTag", schema);
