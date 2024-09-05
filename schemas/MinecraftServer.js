const { Storage } = require("@google-cloud/storage");
const mongoose = require("mongoose");
const sharp = require("sharp");
const aes256 = require("aes256");

const config = require("../config.json");
const utils = require("../utils");

const storage = new Storage({
    keyFilename: "./gkey.json",
});
const bucket = storage.bucket(config.google.bannerBucket);

const schema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        index: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    ip: {
        type: String,
        required: true,
    },
    port: {
        type: Number,
        default: 25565,
    },
    favicon: {
        type: String,
        default: null,
    },
    banner: {
        type: String,
        default: null,
    },
    votifier: {
        enabled: {
            type: Boolean,
            default: false,
        },
        ip: String,
        port: Number,
        publicKey: String,
    },
    score: {
        total: {
            type: Number,
            default: 0,
        },
        player: Number,
        favicon: Number,
        banner: Number,
        connection: Number,
        address: Number,
        port: Number,
    },
    pingServer: {
        type: String,
        ref: "ServerLocation",
        default: "us-east-nyc-01",
    },
    disabledPingServers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "ServerLocation",
        default: [],
    },
    lastPing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MinecraftServerPing",
    },
    lastPings: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "MinecraftServerPing",
        default: [],
    },
});

schema.methods.setVotifierPublicKey = function(key) {
    
}

schema.methods.updateBanner = function(bannerLocation) {
    return new Promise((resolve, reject) => {
        const newLocation = `/tmp/RESIZE_${utils.stringGenerator(24)}.webp`;

        if (this?.banner) {
            const urlSplit = this.banner.split("/");
            bucket.deleteFiles(urlSplit[urlSplit.length - 1], err => {
                if (err) {
                    console.error("Failed to delete old banner!");
                    console.error(err);
                }
            });
        }
        
        sharp(bannerLocation, {
                pages: -1
            })
            .resize(468, 60)
            .webp()
            .toFile(newLocation, (err) => {
                if (err) {
                    return reject(err);
                }

                bucket.upload(newLocation, {
                    destination: `${this.url}-${utils.stringGenerator(5)}.webp`,
                }, (err, file) => {
                    if (err) {
                        return reject(err);
                    }
        
                    file.makePublic(err => {
                        if (err) {
                            return reject(err);
                        }
        
                        this.banner = file.publicUrl();
        
                        resolve(file.publicUrl());
                    })
                });
            });
    });
}

schema.methods.calculateScore = async function() {
    if (!this?.lastPing) return;

    if (!this?.lastPing?._id) {
        await this.populate("lastPing");
    }

    const ping = this.lastPing;

    // Calculate player score based on the number of players currently online
    this.score.player = Math.min(ping.online ? ping.players.online * .25 : 0, 1000);

    // Give 30 extra points if the server has a favicon
    this.score.favicon = this?.favicon ? 30 : 0;

    // Give 50 extra points if the server has a banner
    this.score.banner = this?.banner ? 50 : 0;

    // Use the main server ping to calculate a connection score. If offline, give -100 points.
    this.score.connection = ping.online ? ping.ping * -.1 : -100;

    // Remove 15 points for every period seperated section in the IP (greater than 3, ie. mc.example.com).
    // This means having an IPv4 address will subtract 15 points, and so will having a subdomain of a subdomain
    const splitIP = this.ip.split(".");
    this.score.address = Math.min((splitIP.length - 3) * -15, 0);

    // Remove 15 points for having a server port other than 25565.
    this.score.port = this.port === 25565 ? 0 : -15;

    // Add everything up
    this.score.total =
        this.score.player +
        this.score.favicon +
        this.score.banner +
        this.score.connection +
        this.score.address +
        this.score.port;

    console.log(`Gave server score of ${this.score.total.toFixed(2)}: [Player ${this.score.player.toFixed(1)}] [Favicon ${this.score.favicon.toFixed(1)}] [Banner ${this.score.banner.toFixed(1)}] [Connection ${this.score.connection.toFixed(1)}] [Address ${this.score.address.toFixed(1)}] [Port ${this.score.port.toFixed(1)}]`);
}

schema.methods.faviconURL = function() {
    if (!this.favicon) return null;
    const safeFavicon = this.favicon.replace(/[^a-z0-9]/gi, "");
    return `${config.express.webURI}server/${this.url}/image/favicon-${safeFavicon.substring(safeFavicon.length - 5).toUpperCase()}`;
}

module.exports = mongoose.model("MinecraftServer", schema);
