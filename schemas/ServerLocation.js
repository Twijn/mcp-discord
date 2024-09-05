const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    name: String,
    city: String,
    country: String,
    countryCode: String,
    icon: String,
});

module.exports = mongoose.model("ServerLocation", schema);
