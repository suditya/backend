"use strict";
const mongoose = require("mongoose");
const connectionStr = "mongodb://localhost:27017";
const DB_NAME = "Poodi-Sabji-dot-com";
mongoose.connect(connectionStr);
mongoose.connection.on("error", (error) => {
    console.error(`could not connect to database ${DB_NAME}, error = `, error.message);
    process.exit(1);
});
mongoose.connection.on("open", function () {
    console.error(`connected to database ${DB_NAME}`);
});
