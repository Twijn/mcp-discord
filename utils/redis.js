const redis = require("redis");
const config = require("../config.json");

const publisher = redis.createClient({
    url: config.redis.uri,
});

console.log("Connecting to redis...");

publisher.on("error", console.error);

publisher.connect().then(async () => {
    console.log("Connected to redis!");
}, console.error);

module.exports = publisher;
