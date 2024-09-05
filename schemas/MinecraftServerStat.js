const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MinecraftServer",
        required: true,
    },
    uptime: Number,
    ping: {
        type: [{
            location: String,
            min: Number,
            max: Number,
            average: Number,
        }],
    },
    motd: String,
    parsedMOTD: String,
    players: {
        min: Number,
        max: Number,
        average: Number,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("MinecraftServerStat", schema);
