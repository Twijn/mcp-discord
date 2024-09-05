const mongoose = require("mongoose");

const config = require("../config.json");

const DiscordUser = require("./DiscordUser");

const User = require("./User");

const Session = require("./Session");

const MinecraftServer = require("./MinecraftServer");
const MinecraftServerPing = require("./MinecraftServerPing");
const MinecraftServerStat = require("./MinecraftServerStat");
const MinecraftServerTag = require("./MinecraftServerTag");
const ServerLocation = require("./ServerLocation");

class Schemas {

    DiscordUser = DiscordUser;

    User = User;

    Session = Session;

    MinecraftServer = MinecraftServer;
    MinecraftServerPing = MinecraftServerPing;
    MinecraftServerTag = MinecraftServerTag;
    MinecraftServerStat = MinecraftServerStat;

    ServerLocation = ServerLocation;

}

console.log("Connecting to MongoDB...");
mongoose.connect(config.mongodb.uri, {
    enableUtf8Validation: false,
}).then(() => {
    console.log("Connected to MongoDB!");
}, console.error);

module.exports = new Schemas();
