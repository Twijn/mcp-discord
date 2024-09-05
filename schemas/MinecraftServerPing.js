const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MinecraftServer",
        required: true,
    },
    location: {
        type: String,
        ref: "ServerLocation",
        required: true,
    },
    online: Boolean,
    ping: Number,
    motd: String,
    parsedMOTD: String,
    version: String,
    players: {
        online: Number,
        max: Number,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("MinecraftServerPing", schema);
