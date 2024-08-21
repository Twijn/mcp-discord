const express = require("express");
const app = express();

const config = require("./config.json");

app.get("/", (req, res) => {
    res.send(`Discord client ${config.serverLocation} is online!`);
});

app.listen(config.express.discordPort, () => {
    console.log(`Express server listening on port ${config.express.discordPort}`)
});
